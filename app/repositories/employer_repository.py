from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.database_models import Employer, User
from app.repositories.base import BaseRepository


class EmployerRepository(BaseRepository[Employer]):
    def __init__(self, db: Session):
        super().__init__(db, Employer)

    def get_by_user_id(self, user_id: int) -> Optional[Employer]:
        return self.db.query(Employer).filter(Employer.user_id == user_id).first()

    def get_all_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Employer]:
        query = self.db.query(Employer).join(User)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search:
            query = query.filter(
                or_(
                    Employer.company_name.ilike(f"%{search}%"),
                    Employer.contact_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )

        return query.offset(skip).limit(limit).all()

    def add_credits(self, employer: Employer, amount: int) -> Employer:
        employer.job_credits += amount
        self.db.commit()
        self.db.refresh(employer)
        return employer

    def deduct_credit(self, employer: Employer) -> Employer:
        if employer.job_credits == 0:
            raise ValueError("Employer has no job credits remaining")
        employer.job_credits -= 1
        self.db.commit()
        self.db.refresh(employer)
        return employer
