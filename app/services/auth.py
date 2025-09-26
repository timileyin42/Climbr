from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional
import os
from dotenv import load_dotenv

# Import models
from app.models.database_models import User, UserType, Talent, Employer, Trainer, Admin
from app.dependencies.auth import create_access_token

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.
        
        Args:
            plain_password: Plain text password
            hashed_password: Hashed password
            
        Returns:
            True if password matches hash, False otherwise
        """
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """
        Hash a password.
        
        Args:
            password: Plain text password
            
        Returns:
            Hashed password
        """
        return pwd_context.hash(password)
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        """
        Get a user by email.
        
        Args:
            db: Database session
            email: User email
            
        Returns:
            User object if found, None otherwise
        """
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        """
        Authenticate a user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            
        Returns:
            User object if authentication successful, None otherwise
        """
        user = AuthService.get_user_by_email(db, email)
        
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        
        return user
    
    @staticmethod
    def create_user_token(user: User) -> dict:
        """
        Create a token for a user.
        
        Args:
            user: User object
            
        Returns:
            Dictionary with access token and token type
        """
        access_token_expires = timedelta(minutes=int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")))
        
        access_token = create_access_token(
            data={"sub": user.email, "user_type": user.user_type},
            expires_delta=access_token_expires
        )
        
        return {"access_token": access_token, "token_type": "bearer"}
    
    @staticmethod
    def create_talent(db: Session, email: str, password: str, talent_data: dict) -> Talent:
        """
        Create a new talent user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            talent_data: Talent data
            
        Returns:
            Created Talent object
        """
        # Hash the password
        hashed_password = AuthService.get_password_hash(password)
        
        # Create user record
        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.TALENT,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create talent record
        talent = Talent(
            user_id=user.id,
            **talent_data
        )
        
        db.add(talent)
        db.commit()
        db.refresh(talent)
        
        return talent
    
    @staticmethod
    def create_employer(db: Session, email: str, password: str, employer_data: dict) -> Employer:
        """
        Create a new employer user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            employer_data: Employer data
            
        Returns:
            Created Employer object
        """
        # Hash the password
        hashed_password = AuthService.get_password_hash(password)
        
        # Create user record
        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.EMPLOYER,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create employer record
        employer = Employer(
            user_id=user.id,
            **employer_data
        )
        
        db.add(employer)
        db.commit()
        db.refresh(employer)
        
        return employer
    
    @staticmethod
    def create_trainer(db: Session, email: str, password: str, trainer_data: dict) -> Trainer:
        """
        Create a new trainer user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            trainer_data: Trainer data
            
        Returns:
            Created Trainer object
        """
        # Hash the password
        hashed_password = AuthService.get_password_hash(password)
        
        # Create user record
        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.TRAINER,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create trainer record
        trainer = Trainer(
            user_id=user.id,
            **trainer_data
        )
        
        db.add(trainer)
        db.commit()
        db.refresh(trainer)
        
        return trainer
    
    @staticmethod
    def create_admin(db: Session, email: str, password: str, admin_data: dict) -> Admin:
        """
        Create a new admin user.
        
        Args:
            db: Database session
            email: User email
            password: User password
            admin_data: Admin data
            
        Returns:
            Created Admin object
        """
        # Hash the password
        hashed_password = AuthService.get_password_hash(password)
        
        # Create user record
        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.ADMIN,
            is_active=True
        )
        
        db.add(user)
        db.flush()  # Flush to get the user ID
        
        # Create admin record
        admin = Admin(
            user_id=user.id,
            **admin_data
        )
        
        db.add(admin)
        db.commit()
        db.refresh(admin)
        
        return admin