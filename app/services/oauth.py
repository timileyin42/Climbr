from typing import Optional, Dict, Any, Tuple
import os
import logging
import httpx
from sqlalchemy.orm import Session
import secrets
import string

from app.models.database_models import User, UserType
from app.services.auth import AuthService

logger = logging.getLogger(__name__)

# Google OAuth configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

# Google API endpoints
GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"

class OAuthService:
    """
    Service for handling OAuth authentication with various providers.
    """
    
    @staticmethod
    def get_google_auth_url(state: str = "") -> str:
        """
        Generate the Google OAuth authorization URL.
        
        Args:
            state: Optional state parameter for CSRF protection
            
        Returns:
            Google authorization URL
        """
        if not GOOGLE_CLIENT_ID or not GOOGLE_REDIRECT_URI:
            logger.error("Google OAuth credentials not set. Google login is disabled.")
            return ""
            
        params = {
            "client_id": GOOGLE_CLIENT_ID,
            "redirect_uri": GOOGLE_REDIRECT_URI,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        if state:
            params["state"] = state
            
        # Build the URL with query parameters
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        auth_url = f"{GOOGLE_AUTH_URL}?{query_string}"
        
        return auth_url
    
    @staticmethod
    async def exchange_code_for_token(code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Exchange an authorization code for an access token.
        
        Args:
            code: Authorization code from Google
            
        Returns:
            Tuple[bool, Dict]: Success status and token data or error message
        """
        if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET or not GOOGLE_REDIRECT_URI:
            logger.error("Google OAuth credentials not set. Google login is disabled.")
            return False, {"error": "Google OAuth is not configured"}
            
        try:
            payload = {
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": GOOGLE_REDIRECT_URI
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(GOOGLE_TOKEN_URL, data=payload)
                
                if response.status_code != 200:
                    logger.error(f"Failed to exchange code for token: {response.status_code} - {response.text}")
                    return False, {"error": "Failed to exchange code for token"}
                    
                token_data = response.json()
                return True, token_data
                
        except Exception as e:
            logger.error(f"Error exchanging code for token: {str(e)}")
            return False, {"error": str(e)}
    
    @staticmethod
    async def get_google_user_info(access_token: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Get user information from Google using an access token.
        
        Args:
            access_token: Google OAuth access token
            
        Returns:
            Tuple[bool, Dict]: Success status and user data or error message
        """
        try:
            headers = {"Authorization": f"Bearer {access_token}"}
            
            async with httpx.AsyncClient() as client:
                response = await client.get(GOOGLE_USERINFO_URL, headers=headers)
                
                if response.status_code != 200:
                    logger.error(f"Failed to get user info: {response.status_code} - {response.text}")
                    return False, {"error": "Failed to get user information"}
                    
                user_info = response.json()
                return True, user_info
                
        except Exception as e:
            logger.error(f"Error getting user info: {str(e)}")
            return False, {"error": str(e)}
    
    @staticmethod
    async def authenticate_google_user(db: Session, auth_service: AuthService, code: str) -> Tuple[bool, Dict[str, Any]]:
        """
        Authenticate a user with Google OAuth.
        
        Args:
            db: Database session
            auth_service: AuthService instance
            code: Authorization code from Google
            
        Returns:
            Tuple[bool, Dict]: Success status and user data with token or error message
        """
        # Exchange code for token
        token_success, token_data = await OAuthService.exchange_code_for_token(code)
        if not token_success:
            return False, token_data
            
        # Get user info
        user_success, user_info = await OAuthService.get_google_user_info(token_data.get("access_token"))
        if not user_success:
            return False, user_info
            
        # Check if user exists
        email = user_info.get("email")
        if not email:
            return False, {"error": "Email not provided by Google"}
            
        # Try to find user by email
        user = auth_service.get_user_by_email(db, email)
        
        if user:
            # User exists, update Google ID if not set
            if not user.google_id:
                user.google_id = user_info.get("sub")  # Google's user ID
                db.commit()
        else:
            # User doesn't exist, this is a new signup
            # In a real application, you would redirect to a page to complete profile
            # For now, we'll return an error indicating the user needs to sign up first
            return False, {"error": "User not found. Please sign up first."}
            
        # Create access token
        access_token = auth_service.create_user_token(user)
        
        return True, {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "user_type": user.user_type.value
        }
    
    @staticmethod
    async def register_google_user(db: Session, auth_service: AuthService, code: str, user_type: UserType) -> Tuple[bool, Dict[str, Any]]:
        """
        Register a new user with Google OAuth.
        
        Args:
            db: Database session
            auth_service: AuthService instance
            code: Authorization code from Google
            user_type: Type of user to create
            
        Returns:
            Tuple[bool, Dict]: Success status and user data with token or error message
        """
        # Exchange code for token
        token_success, token_data = await OAuthService.exchange_code_for_token(code)
        if not token_success:
            return False, token_data
            
        # Get user info
        user_success, user_info = await OAuthService.get_google_user_info(token_data.get("access_token"))
        if not user_success:
            return False, user_info
            
        # Check if user exists
        email = user_info.get("email")
        if not email:
            return False, {"error": "Email not provided by Google"}
            
        # Try to find user by email
        user = auth_service.get_user_by_email(db, email)
        
        if user:
            # User already exists
            return False, {"error": "User with this email already exists"}
            
        # Create new user
        # Generate a random password for the user (they'll use Google to sign in)
        
        password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(16))
        
        # Create user
        user = User(
            email=email,
            hashed_password=auth_service.get_password_hash(password),
            user_type=user_type,
            is_active=True,
            is_verified=True,  # Auto-verify users who sign up with Google
            google_id=user_info.get("sub")  # Google's user ID
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        # Create access token
        access_token = auth_service.create_user_token(user)
        
        return True, {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "email": user.email,
            "user_type": user.user_type.value,
            "profile_incomplete": True  # Flag indicating the user needs to complete their profile
        }