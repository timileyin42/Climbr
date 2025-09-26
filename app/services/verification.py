from datetime import datetime, timedelta
import secrets
import logging
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session

from app.models.database_models import User
from app.services.email import EmailService

logger = logging.getLogger(__name__)

class VerificationService:
    """
    Service for handling email verification and password reset functionality.
    """
    
    @staticmethod
    def generate_token() -> str:
        """
        Generate a secure random token for verification or password reset.
        
        Returns:
            str: A secure random token
        """
        return secrets.token_urlsafe(32)
    
    @staticmethod
    async def create_verification_token(db: Session, user: User) -> Tuple[bool, str]:
        """
        Create and store a verification token for a user.
        
        Args:
            db: Database session
            user: User to create verification token for
            
        Returns:
            Tuple[bool, str]: Success status and token or error message
        """
        try:
            # Generate token
            token = VerificationService.generate_token()
            
            # Set expiration (24 hours from now)
            expires = datetime.utcnow() + timedelta(hours=24)
            
            # Update user record
            user.verification_token = token
            user.verification_token_expires = expires
            db.commit()
            
            return True, token
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating verification token: {str(e)}")
            return False, str(e)
    
    @staticmethod
    async def verify_email(db: Session, token: str) -> Tuple[bool, str]:
        """
        Verify a user's email using the provided token.
        
        Args:
            db: Database session
            token: Verification token
            
        Returns:
            Tuple[bool, str]: Success status and message
        """
        try:
            # Find user with this token
            user = db.query(User).filter(User.verification_token == token).first()
            
            if not user:
                return False, "Invalid verification token"
                
            # Check if token is expired
            if not user.verification_token_expires or user.verification_token_expires < datetime.utcnow():
                return False, "Verification token has expired"
                
            # Mark user as verified and clear token
            user.is_verified = True
            user.verification_token = None
            user.verification_token_expires = None
            db.commit()
            
            return True, "Email verified successfully"
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error verifying email: {str(e)}")
            return False, str(e)
    
    @staticmethod
    async def send_verification_email(db: Session, user: User, base_url: str) -> Tuple[bool, str]:
        """
        Send a verification email to a user.
        
        Args:
            db: Database session
            user: User to send verification email to
            base_url: Base URL for verification link
            
        Returns:
            Tuple[bool, str]: Success status and message
        """
        try:
            # Create verification token
            success, token = await VerificationService.create_verification_token(db, user)
            if not success:
                return False, f"Failed to create verification token: {token}"
                
            # Create verification link
            verification_link = f"{base_url}/verify-email?token={token}"
            
            # Send email
            email_service = EmailService()
            await email_service.send_verification_email(user.email, verification_link)
            
            return True, "Verification email sent successfully"
            
        except Exception as e:
            logger.error(f"Error sending verification email: {str(e)}")
            return False, str(e)
    
    @staticmethod
    async def create_password_reset_token(db: Session, user: User) -> Tuple[bool, str]:
        """
        Create and store a password reset token for a user.
        
        Args:
            db: Database session
            user: User to create password reset token for
            
        Returns:
            Tuple[bool, str]: Success status and token or error message
        """
        try:
            # Generate token
            token = VerificationService.generate_token()
            
            # Set expiration (1 hour from now)
            expires = datetime.utcnow() + timedelta(hours=1)
            
            # Update user record
            user.password_reset_token = token
            user.password_reset_expires = expires
            db.commit()
            
            return True, token
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error creating password reset token: {str(e)}")
            return False, str(e)
    
    @staticmethod
    async def verify_password_reset_token(db: Session, token: str) -> Tuple[bool, Optional[User], str]:
        """
        Verify a password reset token and return the associated user.
        
        Args:
            db: Database session
            token: Password reset token
            
        Returns:
            Tuple[bool, Optional[User], str]: Success status, user (if found), and message
        """
        try:
            # Find user with this token
            user = db.query(User).filter(User.password_reset_token == token).first()
            
            if not user:
                return False, None, "Invalid password reset token"
                
            # Check if token is expired
            if not user.password_reset_expires or user.password_reset_expires < datetime.utcnow():
                return False, None, "Password reset token has expired"
                
            return True, user, "Valid password reset token"
            
        except Exception as e:
            logger.error(f"Error verifying password reset token: {str(e)}")
            return False, None, str(e)
    
    @staticmethod
    async def send_password_reset_email(db: Session, user: User, base_url: str) -> Tuple[bool, str]:
        """
        Send a password reset email to a user.
        
        Args:
            db: Database session
            user: User to send password reset email to
            base_url: Base URL for password reset link
            
        Returns:
            Tuple[bool, str]: Success status and message
        """
        try:
            # Create password reset token
            success, token = await VerificationService.create_password_reset_token(db, user)
            if not success:
                return False, f"Failed to create password reset token: {token}"
                
            # Create password reset link
            reset_link = f"{base_url}/reset-password?token={token}"
            
            # Send email
            email_service = EmailService()
            await email_service.send_password_reset_email(user.email, reset_link)
            
            return True, "Password reset email sent successfully"
            
        except Exception as e:
            logger.error(f"Error sending password reset email: {str(e)}")
            return False, str(e)
    
    @staticmethod
    async def reset_password(db: Session, token: str, new_password: str, auth_service) -> Tuple[bool, str]:
        """
        Reset a user's password using a valid reset token.
        
        Args:
            db: Database session
            token: Password reset token
            new_password: New password to set
            auth_service: AuthService instance for password hashing
            
        Returns:
            Tuple[bool, str]: Success status and message
        """
        try:
            # Verify token and get user
            success, user, message = await VerificationService.verify_password_reset_token(db, token)
            if not success or not user:
                return False, message
                
            # Hash new password
            hashed_password = auth_service.get_password_hash(new_password)
            
            # Update user's password and clear reset token
            user.hashed_password = hashed_password
            user.password_reset_token = None
            user.password_reset_expires = None
            db.commit()
            
            return True, "Password reset successfully"
            
        except Exception as e:
            db.rollback()
            logger.error(f"Error resetting password: {str(e)}")
            return False, str(e)