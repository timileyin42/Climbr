from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.database import get_db
from app.models.user_models import Token, UserCreate, UserOut
from app.models.database_models import UserType
from app.services.auth import AuthService
from app.services.verification import VerificationService
from app.services.oauth import OAuthService
from app.services.email import EmailService

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

@router.get("/google/login")
async def google_login(user_type: UserType):
    """
    Generate a Google OAuth authorization URL.
    """
    # Generate state parameter (for CSRF protection)
    import secrets
    state = f"{user_type.value}:{secrets.token_urlsafe(16)}"
    
    # Generate authorization URL
    auth_url = OAuthService.get_google_auth_url(state)
    
    if not auth_url:
        raise HTTPException(status_code=500, detail="Google OAuth is not configured")
        
    return {"auth_url": auth_url}

@router.get("/google/callback")
async def google_callback(
    code: str,
    state: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Handle Google OAuth callback.
    """
    # Parse state parameter
    user_type = UserType.TALENT  # Default to talent
    if state and ":" in state:
        try:
            user_type_str, _ = state.split(":", 1)
            user_type = UserType(user_type_str)
        except (ValueError, KeyError):
            pass
    
    # Authenticate user
    success, result = await OAuthService.authenticate_google_user(db, auth_service, code)
    
    if success:
        return result
        
    # If authentication failed because user doesn't exist, try to register
    if result.get("error") == "User not found. Please sign up first.":
        success, result = await OAuthService.register_google_user(db, auth_service, code, user_type)
        
        if success:
            return result
    
    # If still failed, return error
    raise HTTPException(status_code=400, detail=result.get("error", "Authentication failed"))