import hashlib
import secrets
import logging
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from app.config import settings
from app.models.database_models import User
from app.services.email import EmailService

logger = logging.getLogger(__name__)


def _hash_token(token: str) -> str:
    """SHA-256 hash a plain token for safe storage. Never store the plain value."""
    return hashlib.sha256(token.encode()).hexdigest()


class VerificationService:

    @staticmethod
    def generate_token() -> str:
        return secrets.token_urlsafe(32)

    @staticmethod
    async def create_verification_token(db: Session, user: User) -> Tuple[bool, str]:
        try:
            token = VerificationService.generate_token()
            user.verification_token_hash = _hash_token(token)
            user.verification_token_expires = datetime.now(timezone.utc) + timedelta(hours=24)
            db.commit()
            return True, token  # return the plain token — caller puts it in the email link
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating verification token: {e}")
            return False, str(e)

    @staticmethod
    async def verify_email(db: Session, token: str) -> Tuple[bool, str, Optional[User]]:
        try:
            token_hash = _hash_token(token)
            user = db.query(User).filter(User.verification_token_hash == token_hash).first()

            if not user:
                return False, "Invalid verification token", None

            expires = user.verification_token_expires
            if not expires or expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
                return False, "Verification token has expired", None

            user.is_verified = True
            user.verification_token_hash = None
            user.verification_token_expires = None
            db.commit()
            db.refresh(user)
            return True, "Email verified successfully", user
        except Exception as e:
            db.rollback()
            logger.error(f"Error verifying email: {e}")
            return False, str(e), None

    @staticmethod
    async def send_verification_email(db: Session, user: User) -> Tuple[bool, str]:
        try:
            success, token = await VerificationService.create_verification_token(db, user)
            if not success:
                return False, f"Failed to create verification token: {token}"

            verification_link = f"{settings.FRONTEND_URL.rstrip('/')}/verify-email?token={token}"
            await EmailService.send_verification_email(user.email, verification_link)
            return True, "Verification email sent successfully"
        except Exception as e:
            logger.error(f"Error sending verification email: {e}")
            return False, str(e)

    @staticmethod
    async def create_password_reset_token(db: Session, user: User) -> Tuple[bool, str]:
        try:
            token = VerificationService.generate_token()
            user.password_reset_token_hash = _hash_token(token)
            user.password_reset_expires = datetime.now(timezone.utc) + timedelta(hours=1)
            db.commit()
            return True, token
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating password reset token: {e}")
            return False, str(e)

    @staticmethod
    async def verify_password_reset_token(db: Session, token: str) -> Tuple[bool, Optional[User], str]:
        try:
            token_hash = _hash_token(token)
            user = db.query(User).filter(User.password_reset_token_hash == token_hash).first()

            if not user:
                return False, None, "Invalid password reset token"

            reset_expires = user.password_reset_expires
            if not reset_expires or reset_expires.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
                return False, None, "Password reset token has expired"

            return True, user, "Valid password reset token"
        except Exception as e:
            logger.error(f"Error verifying password reset token: {e}")
            return False, None, str(e)

    @staticmethod
    async def send_password_reset_email(db: Session, user: User) -> Tuple[bool, str]:
        try:
            success, token = await VerificationService.create_password_reset_token(db, user)
            if not success:
                return False, f"Failed to create password reset token: {token}"

            reset_link = f"{settings.FRONTEND_URL.rstrip('/')}/reset-password?token={token}"
            await EmailService.send_password_reset_email(user.email, reset_link)
            return True, "Password reset email sent successfully"
        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
            return False, str(e)

    @staticmethod
    async def reset_password(db: Session, token: str, new_password: str, auth_service) -> Tuple[bool, str]:
        try:
            success, user, message = await VerificationService.verify_password_reset_token(db, token)
            if not success or not user:
                return False, message

            user.hashed_password = auth_service.get_password_hash(new_password)
            user.password_reset_token_hash = None
            user.password_reset_expires = None
            db.commit()
            return True, "Password reset successfully"
        except Exception as e:
            db.rollback()
            logger.error(f"Error resetting password: {e}")
            return False, str(e)
