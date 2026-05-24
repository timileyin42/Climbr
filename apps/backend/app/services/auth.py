from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import timedelta
from typing import Optional

from app.config import settings
from app.models.database_models import User, UserType, Talent, Employer, Trainer, Admin
from app.dependencies.auth import create_access_token
from app.repositories.user_repository import UserRepository
from app.repositories.talent_repository import TalentRepository
from app.repositories.employer_repository import EmployerRepository
from app.repositories.trainer_repository import TrainerRepository
from app.repositories.admin_repository import AdminRepository

# Argon2 is the primary scheme; bcrypt kept for verifying legacy hashes
pwd_context = CryptContext(
    schemes=["argon2", "bcrypt"],
    deprecated=["bcrypt"],
)


class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        repo = UserRepository(db)
        return repo.get_by_email(email)

    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = AuthService.get_user_by_email(db, email)
        if not user:
            return None
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        return user

    @staticmethod
    def create_user_token(user: User) -> dict:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": user.email, "user_type": user.user_type},
            expires_delta=access_token_expires,
        )
        return {"access_token": access_token, "token_type": "bearer"}

    @staticmethod
    def create_talent(
        db: Session, email: str, password: str, talent_data: dict
    ) -> Talent:
        hashed_password = AuthService.get_password_hash(password)

        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.TALENT,
            is_active=True,
        )
        db.add(user)
        db.flush()

        talent_repo = TalentRepository(db)
        talent = Talent(user_id=user.id, **talent_data)
        db.add(talent)
        db.commit()
        db.refresh(talent)
        return talent

    @staticmethod
    def create_employer(
        db: Session, email: str, password: str, employer_data: dict
    ) -> Employer:
        hashed_password = AuthService.get_password_hash(password)

        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.EMPLOYER,
            is_active=True,
        )
        db.add(user)
        db.flush()

        employer = Employer(user_id=user.id, **employer_data)
        db.add(employer)
        db.commit()
        db.refresh(employer)
        return employer

    @staticmethod
    def create_trainer(
        db: Session, email: str, password: str, trainer_data: dict
    ) -> Trainer:
        hashed_password = AuthService.get_password_hash(password)

        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.TRAINER,
            is_active=True,
        )
        db.add(user)
        db.flush()

        trainer = Trainer(user_id=user.id, **trainer_data)
        db.add(trainer)
        db.commit()
        db.refresh(trainer)
        return trainer

    @staticmethod
    def create_admin(
        db: Session, email: str, password: str, admin_data: dict
    ) -> Admin:
        hashed_password = AuthService.get_password_hash(password)

        user = User(
            email=email,
            hashed_password=hashed_password,
            user_type=UserType.ADMIN,
            is_active=True,
        )
        db.add(user)
        db.flush()

        admin_repo = AdminRepository(db)
        admin = Admin(user_id=user.id, **admin_data)
        db.add(admin)
        db.commit()
        db.refresh(admin)
        return admin
