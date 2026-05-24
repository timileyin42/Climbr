from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.database_models import Trainer, User
from app.repositories.base import BaseRepository


class TrainerRepository(BaseRepository[Trainer]):
    def __init__(self, db: Session):
        super().__init__(db, Trainer)

    def get_by_user_id(self, user_id: int) -> Optional[Trainer]:
        return self.db.query(Trainer).filter(Trainer.user_id == user_id).first()

    def get_all_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Trainer]:
        query = self.db.query(Trainer).join(User)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search:
            query = query.filter(
                or_(
                    Trainer.provider_name.ilike(f"%{search}%"),
                    Trainer.contact_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )

        return query.offset(skip).limit(limit).all()

    def add_credits(self, trainer: Trainer, amount: int) -> Trainer:
        trainer.training_credits += amount
        self.db.commit()
        self.db.refresh(trainer)
        return trainer

    def deduct_credit(self, trainer: Trainer) -> Trainer:
        if trainer.training_credits == 0:
            raise ValueError("Trainer has no training credits remaining")
        trainer.training_credits -= 1
        self.db.commit()
        self.db.refresh(trainer)
        return trainer
