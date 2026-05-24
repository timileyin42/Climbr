from typing import Optional
from sqlalchemy.orm import Session

from app.models.database_models import Admin
from app.repositories.base import BaseRepository


class AdminRepository(BaseRepository[Admin]):
    def __init__(self, db: Session):
        super().__init__(db, Admin)

    def get_by_user_id(self, user_id: int) -> Optional[Admin]:
        return self.db.query(Admin).filter(Admin.user_id == user_id).first()
