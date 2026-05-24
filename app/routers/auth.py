from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.database import get_db
from app.models.user_models import Token, UserCreate, UserOut
from app.models.database_models import User, UserType
from app.services.auth import AuthService
from app.services.verification import VerificationService
from app.services.firebase import verify_firebase_id_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Initialize services
auth_service = AuthService()

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Standard login endpoint that authenticates a user with username/email and password.
    Returns a JWT token upon successful authentication.
    """
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in."
        )
        
    # Generate access token
    return auth_service.create_user_token(user)

@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    user_data: Dict[str, Any] = Body(...),
    request: Request = None,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db)
):
    """
    Register a new user account.
    """
    # Extract required fields
    email = user_data.get("email")
    password = user_data.get("password")
    user_type = user_data.get("user_type", UserType.TALENT)  # Default to talent
    
    # Validate required fields
    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")
    
    # Check if user already exists
    existing_user = auth_service.get_user_by_email(db, email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    try:
        # Create user based on user type
        if user_type == UserType.TALENT:
            user = auth_service.create_talent(db, email, password, user_data)
        elif user_type == UserType.EMPLOYER:
            user = auth_service.create_employer(db, email, password, user_data)
        elif user_type == UserType.TRAINER:
            user = auth_service.create_trainer(db, email, password, user_data)
        else:
            raise HTTPException(status_code=400, detail="Invalid user type")
        
        # Get base URL for verification link
        base_url = ""
        if request:
            base_url = str(request.base_url)
        
        # Send verification email in background
        if background_tasks and base_url:
            await VerificationService.send_verification_email(db, user, base_url, background_tasks)
        
        return {"message": "User registered successfully. Please check your email to verify your account."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify a user's email address using the provided token.
    """
    success, message = await VerificationService.verify_email(db, token)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return {"message": message}

@router.post("/resend-verification")
async def resend_verification_email(
    email: str, 
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Resend a verification email to a user.
    """
    # Check if user exists
    user = auth_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if user is already verified
    if user.is_verified:
        return {"message": "Email is already verified"}
        
    # Get base URL for verification link
    base_url = str(request.base_url)
        
    # Send verification email
    success, message = await VerificationService.send_verification_email(db, user, base_url)
    
    if not success:
        raise HTTPException(status_code=500, detail=message)
        
    return {"message": "Verification email sent successfully"}

@router.post("/forgot-password")
async def forgot_password(
    email: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """
    Send a password reset email to a user.
    """
    # Check if user exists
    user = auth_service.get_user_by_email(db, email)
    if not user:
        # Don't reveal that the user doesn't exist for security reasons
        return {"message": "If the email exists, a password reset link has been sent"}
        
    # Get base URL for reset link
    base_url = str(request.base_url)
        
    # Send password reset email
    success, message = await VerificationService.send_password_reset_email(db, user, base_url)
    
    # Always return success for security reasons
    return {"message": "If the email exists, a password reset link has been sent"}

@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
):
    """
    Reset a user's password using a valid reset token.
    """
    success, message = await VerificationService.reset_password(db, token, new_password, auth_service)
    
    if not success:
        raise HTTPException(status_code=400, detail=message)
        
    return {"message": message}

@router.post("/firebase")
async def firebase_sign_in(
    id_token: str = Body(..., embed=True),
    user_type: UserType = Body(UserType.TALENT),
    user_data: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db),
):
    """
    Authenticate (or register) a user with a Firebase ID token.

    The mobile client signs in via Google through Firebase, then sends the
    resulting ID token here. We verify it server-side using the Firebase Admin SDK.

    Flow:
      1. Verify token → get uid + email + display_name
      2. If user exists (by firebase_uid or email) → return JWT
      3. Else create a new account of the requested user_type → return JWT
    """
    claims = await verify_firebase_id_token(id_token)
    if not claims:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    firebase_uid: str = claims["uid"]
    email: str = claims.get("email", "")
    display_name: str = claims.get("name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Firebase token does not include an email address",
        )

    # Look up existing user by firebase_uid first, then email
    user: Optional[User] = (
        db.query(User).filter(User.firebase_uid == firebase_uid).first()
        or db.query(User).filter(User.email == email).first()
    )

    if user:
        # Sync firebase_uid if this is a first-time Firebase login for an existing account
        if not user.firebase_uid:
            user.firebase_uid = firebase_uid
            db.commit()
        return auth_service.create_user_token(user)

    # ── New user — create account ────────────────────────────────────────────
    # Parse name: split display_name into first/last
    name_parts = display_name.split(" ", 1)
    first_name = name_parts[0] or "User"
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    # Base profile data; caller may supply extra fields via user_data
    profile = user_data or {}
    profile.setdefault("first_name", first_name)
    profile.setdefault("last_name", last_name)
    profile.setdefault("is_verified", True)   # Google has already verified the email

    import secrets as _secrets
    # Random password — user can't log in with password anyway for Firebase accounts
    random_password = _secrets.token_hex(24)

    try:
        if user_type == UserType.TALENT:
            new_user_obj = auth_service.create_talent(db, email, random_password, profile)
            created_user = new_user_obj.user
        elif user_type == UserType.EMPLOYER:
            new_user_obj = auth_service.create_employer(db, email, random_password, profile)
            created_user = new_user_obj.user
        elif user_type == UserType.TRAINER:
            new_user_obj = auth_service.create_trainer(db, email, random_password, profile)
            created_user = new_user_obj.user
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_type")

        # Stamp firebase_uid and mark verified
        created_user.firebase_uid = firebase_uid
        created_user.is_verified = True
        db.commit()

        return auth_service.create_user_token(created_user)

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Account creation failed: {exc}") from exc