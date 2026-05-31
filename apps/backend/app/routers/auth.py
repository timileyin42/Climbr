from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Request, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, ConfigDict
from sqlalchemy.orm import Session
from typing import Optional, Dict, Any

from app.database import get_db
from app.limiter import limiter
from app.models.database_models import User, UserType
from app.services.auth import AuthService
from app.services.email import EmailService
from app.services.verification import VerificationService
from app.services.firebase import verify_firebase_id_token
from app.dependencies.auth import get_current_user

router = APIRouter(tags=["auth"])

auth_service = AuthService()


# ── Helpers ────────────────────────────────────────────────────────────────────

def _user_names(user: User) -> tuple[str, str]:
    """Return (first_name, last_name) from the appropriate profile relation."""
    if user.user_type == UserType.TALENT and user.talent:
        return user.talent.first_name or "", user.talent.last_name or ""
    if user.user_type == UserType.EMPLOYER and user.employer:
        parts = (user.employer.contact_name or "").split(" ", 1)
        return parts[0], parts[1] if len(parts) > 1 else ""
    if user.user_type == UserType.TRAINER and user.trainer:
        parts = (user.trainer.contact_name or "").split(" ", 1)
        return parts[0], parts[1] if len(parts) > 1 else ""
    if user.user_type == UserType.ADMIN and user.admin:
        return user.admin.first_name or "", user.admin.last_name or ""
    return "", ""


def _profile_pic(user: User) -> str | None:
    """Return the profile picture / logo URL for any user type."""
    if user.user_type == UserType.TALENT and user.talent:
        return user.talent.profile_image_url
    if user.user_type == UserType.EMPLOYER and user.employer:
        return user.employer.logo_url
    if user.user_type == UserType.TRAINER and user.trainer:
        return user.trainer.logo_url
    return None


def _auth_response(user: User) -> dict:
    """Build the full auth response the frontend expects."""
    token_data = auth_service.create_user_token(user)
    first_name, last_name = _user_names(user)

    # Surface a basic profile_completion flag so the frontend can decide
    # whether to redirect a talent user to /onboarding after login.
    profile_complete = False
    if user.user_type.value == "talent" and user.talent:
        profile_complete = bool(user.talent.bio)

    return {
        **token_data,
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": first_name,
            "last_name": last_name,
            "role": user.user_type.value,
            "is_verified": user.is_verified,
            "profile_complete": profile_complete,
        },
    }


# ── Schemas ────────────────────────────────────────────────────────────────────

class LoginPayload(BaseModel):
    email: str
    password: str


class RegisterPayload(BaseModel):
    model_config = ConfigDict(extra="allow")

    email: str
    password: str
    role: str = "talent"
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    # employer / trainer extras (shown in docs, others accepted via extra="allow")
    company_name: Optional[str] = None
    contact_name: Optional[str] = None
    provider_name: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None


@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, credentials: LoginPayload, db: Session = Depends(get_db)):
    return _login_user(db, credentials.email, credentials.password)


@router.post("/token")
async def swagger_token_login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """OAuth2 password-flow login used by Swagger UI's Authorize button."""
    return _login_user(db, form_data.username, form_data.password)


def _login_user(db: Session, email: str, password: str) -> dict:
    user = auth_service.authenticate_user(db, email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please verify your email before logging in.",
        )
    return _auth_response(user)


# ── Register ───────────────────────────────────────────────────────────────────

# Fields that belong to the User row, not the profile — must be stripped before
# passing to create_talent / create_employer / create_trainer.
_USER_LEVEL_FIELDS = {"email", "password", "role", "user_type"}

# Talent and Trainer share first_name/last_name columns.
# Employer uses contact_name — we convert below.
_EMPLOYER_ONLY_FIELDS = {"company_name", "contact_name", "phone", "website",
                          "industry", "company_size", "location", "description"}


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("10/minute")
async def register(
    request: Request,
    payload: RegisterPayload,
    background_tasks: BackgroundTasks = None,
    db: Session = Depends(get_db),
):
    user_data: dict[str, Any] = payload.model_dump(exclude_none=True)
    email = user_data.get("email")
    password = user_data.get("password")
    role_str = user_data.get("role") or user_data.get("user_type", "talent")

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email and password are required")

    try:
        user_type = UserType(role_str)
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Invalid role: {role_str}")

    if auth_service.get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Strip user-level fields so only profile columns remain
    profile = {k: v for k, v in user_data.items() if k not in _USER_LEVEL_FIELDS}

    try:
        if user_type == UserType.TALENT:
            obj = auth_service.create_talent(db, email, password, profile)
            user = obj.user

        elif user_type == UserType.EMPLOYER:
            # Employer has contact_name, not first_name/last_name
            if "first_name" in profile or "last_name" in profile:
                profile["contact_name"] = (
                    f"{profile.pop('first_name', '')} {profile.pop('last_name', '')}".strip()
                )
            profile.setdefault("company_name", profile.get("contact_name", email.split("@")[0]))
            profile.setdefault("industry", "Other")
            profile.setdefault("location", "")
            obj = auth_service.create_employer(db, email, password, profile)
            user = obj.user

        elif user_type == UserType.TRAINER:
            profile.setdefault("provider_name", f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip() or email.split("@")[0])
            obj = auth_service.create_trainer(db, email, password, profile)
            user = obj.user

        else:
            raise HTTPException(status_code=400, detail="Invalid role")

        # Send verification email in background
        if background_tasks:
            await VerificationService.send_verification_email(db, user)

        return _auth_response(user)

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


# ── Email verification ─────────────────────────────────────────────────────────

@router.post("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    success, message, user = await VerificationService.verify_email(db, token)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    # Return full auth response so the frontend can log the user in automatically
    # and redirect straight to onboarding without requiring a second login.
    return _auth_response(user)


@router.post("/resend-verification")
async def resend_verification_email(
    email: str,
    db: Session = Depends(get_db),
):
    user = auth_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.is_verified:
        return {"message": "Email is already verified"}
    success, message = await VerificationService.send_verification_email(db, user)
    if not success:
        raise HTTPException(status_code=500, detail=message)
    return {"message": "Verification email sent successfully"}


# ── Password reset ─────────────────────────────────────────────────────────────

@router.post("/forgot-password")
@limiter.limit("5/minute")
async def forgot_password(request: Request, email: str, db: Session = Depends(get_db)):
    user = auth_service.get_user_by_email(db, email)
    if user:
        await VerificationService.send_password_reset_email(db, user)
    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(token: str, new_password: str, db: Session = Depends(get_db)):
    success, message = await VerificationService.reset_password(db, token, new_password, auth_service)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}


# ── Firebase / Google sign-in ──────────────────────────────────────────────────

@router.post("/firebase")
async def firebase_sign_in(
    id_token: str = Body(..., embed=True),
    user_type: UserType = Body(UserType.TALENT),
    user_data: Optional[Dict[str, Any]] = Body(None),
    db: Session = Depends(get_db),
):
    claims = await verify_firebase_id_token(id_token)
    if not claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired Firebase ID token")

    firebase_uid: str = claims["uid"]
    email: str = claims.get("email", "")
    display_name: str = claims.get("name", "")

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Firebase token does not include an email address")

    user: Optional[User] = (
        db.query(User).filter(User.firebase_uid == firebase_uid).first()
        or db.query(User).filter(User.email == email).first()
    )

    if user:
        if not user.firebase_uid:
            user.firebase_uid = firebase_uid
            db.commit()
        return _auth_response(user)

    # New user
    name_parts = display_name.split(" ", 1)
    first_name = name_parts[0] or "User"
    last_name = name_parts[1] if len(name_parts) > 1 else ""

    profile = {**(user_data or {})}
    profile.setdefault("first_name", first_name)
    profile.setdefault("last_name", last_name)

    import secrets as _secrets
    random_password = _secrets.token_hex(24)

    try:
        if user_type == UserType.TALENT:
            obj = auth_service.create_talent(db, email, random_password, profile)
            created_user = obj.user
        elif user_type == UserType.EMPLOYER:
            if "first_name" in profile or "last_name" in profile:
                profile["contact_name"] = f"{profile.pop('first_name', '')} {profile.pop('last_name', '')}".strip()
            profile.setdefault("company_name", profile.get("contact_name", email.split("@")[0]))
            profile.setdefault("industry", "Other")
            profile.setdefault("location", "")
            obj = auth_service.create_employer(db, email, random_password, profile)
            created_user = obj.user
        elif user_type == UserType.TRAINER:
            profile.setdefault("provider_name", f"{first_name} {last_name}".strip() or email.split("@")[0])
            obj = auth_service.create_trainer(db, email, random_password, profile)
            created_user = obj.user
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid user_type")

        created_user.firebase_uid = firebase_uid
        created_user.is_verified = True
        db.commit()

        # Send welcome email in the background — don't block the response
        import asyncio as _asyncio
        _asyncio.create_task(
            EmailService.send_welcome_email(
                created_user.email,
                f"{first_name} {last_name}".strip() or created_user.email,
            )
        )

        response = _auth_response(created_user)
        response["is_new"] = True
        return response

    except HTTPException:
        raise
    except Exception as exc:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Account creation failed: {exc}") from exc


# ── Me ─────────────────────────────────────────────────────────────────────────

@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    first_name, last_name = _user_names(current_user)
    return {
        "id": current_user.id,
        "email": current_user.email,
        "first_name": first_name,
        "last_name": last_name,
        "role": current_user.user_type.value,
        "is_active": current_user.is_active,
        "is_verified": current_user.is_verified,
        "created_at": current_user.created_at,
    }
