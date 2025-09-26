from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Import models and database
from app.models.user_models import TokenData
from app.models.database_models import User, Talent, Employer, Trainer, Admin
from app.database import get_db

# Load environment variables
load_dotenv()

# Get JWT settings from environment variables or use defaults
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Password utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against its hash.
    
    Args:
        plain_password: The plain text password
        hashed_password: The hashed password from database
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Hash a password for storing in database.
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password
    """
    return pwd_context.hash(password)

def verify_token_expiry(token_expires: Optional[datetime]) -> bool:
    """
    Verify if a token has not expired.
    
    Args:
        token_expires: Token expiration datetime
        
    Returns:
        True if token is still valid, False if expired
    """
    if token_expires is None:
        return False
    return datetime.utcnow() < token_expires

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """
    Create a JWT access token.
    
    Args:
        data: Data to encode in the token
        expires_delta: Optional expiration time
        
    Returns:
        Encoded JWT token
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    
    return encoded_jwt

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email and password.
    
    Args:
        db: Database session
        email: User email
        password: Plain text password
        
    Returns:
        User object if authentication successful, None otherwise
    """
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        return None
        
    if not verify_password(password, user.hashed_password):
        return None
        
    return user

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Verify and decode the JWT token to get the current user from database.
    
    Args:
        token: JWT token
        db: Database session
        
    Returns:
        User object from database
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        user_type: str = payload.get("user_type")
        
        if email is None or user_type is None:
            raise credentials_exception
        
        # Query the database to get the actual user
        user = db.query(User).filter(User.email == email, User.user_type == user_type).first()
        
        if user is None:
            raise credentials_exception
            
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive"
            )
        
        return user
    
    except JWTError:
        raise credentials_exception

async def get_current_talent(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the current talent user.
    
    Args:
        current_user: Current user from database
        db: Database session
        
    Returns:
        Talent object if the user is a talent
    """
    if current_user.user_type.value != "talent":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as talent"
        )
    
    # Get the talent profile from database
    talent = db.query(Talent).filter(Talent.user_id == current_user.id).first()
    
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent profile not found"
        )
    
    return talent

async def get_current_employer(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the current employer user.
    
    Args:
        current_user: Current user from database
        db: Database session
        
    Returns:
        Employer object if the user is an employer
    """
    if current_user.user_type.value != "employer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as employer"
        )
    
    # Get the employer profile from database
    employer = db.query(Employer).filter(Employer.user_id == current_user.id).first()
    
    if not employer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employer profile not found"
        )
    
    return employer

async def get_current_trainer(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the current trainer user.
    
    Args:
        current_user: Current user from database
        db: Database session
        
    Returns:
        Trainer object if the user is a trainer
    """
    if current_user.user_type.value != "trainer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as trainer"
        )
    
    # Get the trainer profile from database
    trainer = db.query(Trainer).filter(Trainer.user_id == current_user.id).first()
    
    if not trainer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Trainer profile not found"
        )
    
    return trainer

async def get_current_admin(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """
    Get the current admin user.
    
    Args:
        current_user: Current user from database
        db: Database session
        
    Returns:
        Admin object if the user is an admin
    """
    if current_user.user_type.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized as admin"
        )
    
    # Get the admin profile from database
    admin = db.query(Admin).filter(Admin.user_id == current_user.id).first()
    
    if not admin:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Admin profile not found"
        )
    
    return admin

async def get_current_verified_user(current_user: User = Depends(get_current_user)):
    """
    Get the current user only if they are verified.
    
    Args:
        current_user: Current user from database
        
    Returns:
        User object if the user is verified
    """
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email verification required"
        )
    
    return current_user

def create_verification_token(user_id: int) -> str:
    """
    Create a verification token for email verification.
    
    Args:
        user_id: User ID
        
    Returns:
        Verification token
    """
    data = {
        "user_id": user_id,
        "type": "verification",
        "exp": datetime.utcnow() + timedelta(hours=24)  # 24 hours expiry
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def create_password_reset_token(user_id: int) -> str:
    """
    Create a password reset token.
    
    Args:
        user_id: User ID
        
    Returns:
        Password reset token
    """
    data = {
        "user_id": user_id,
        "type": "password_reset",
        "exp": datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    }
    return jwt.encode(data, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str, token_type: str) -> Optional[dict]:
    """
    Verify a token and return its payload.
    
    Args:
        token: JWT token
        token_type: Expected token type ('verification' or 'password_reset')
        
    Returns:
        Token payload if valid, None otherwise
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        if payload.get("type") != token_type:
            return None
            
        return payload
        
    except JWTError:
        return None