from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database_models import User, UserType
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(db, User)

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_firebase_uid(self, uid: str) -> Optional[User]:
        return self.db.query(User).filter(User.firebase_uid == uid).first()

    def get_by_type(self, user_type: UserType, skip: int = 0, limit: int = 100) -> List[User]:
        return (
            self.db.query(User)
            .filter(User.user_type == user_type)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_type(self, user_type: UserType) -> int:
        return self.db.query(User).filter(User.user_type == user_type).count()

    def set_verified(self, user: User) -> User:
        user.is_verified = True
        user.verification_token_hash = None
        user.verification_token_expires = None
        self.db.commit()
        self.db.refresh(user)
        return user

    def update_password(self, user: User, hashed_password: str) -> User:
        user.hashed_password = hashed_password
        user.password_reset_token_hash = None
        user.password_reset_expires = None
        self.db.commit()
        self.db.refresh(user)
        return user
