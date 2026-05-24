from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.database_models import Payment, PaymentStatus
from app.repositories.base import BaseRepository


class PaymentRepository(BaseRepository[Payment]):
    def __init__(self, db: Session):
        super().__init__(db, Payment)

    def get_by_reference(self, reference: str) -> Optional[Payment]:
        return (
            self.db.query(Payment)
            .filter(Payment.transaction_id == reference)
            .first()
        )

    def get_all(
        self, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ) -> List[Payment]:
        query = self.db.query(Payment)

        if filters:
            if filters.get("employer_id"):
                query = query.filter(Payment.employer_id == filters["employer_id"])

            if filters.get("trainer_id"):
                query = query.filter(Payment.trainer_id == filters["trainer_id"])

            if filters.get("status"):
                query = query.filter(Payment.status == filters["status"])

            if filters.get("currency"):
                query = query.filter(Payment.currency == filters["currency"])

        return query.order_by(Payment.created_at.desc()).offset(skip).limit(limit).all()

    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = self.db.query(Payment)

        if filters:
            if filters.get("employer_id"):
                query = query.filter(Payment.employer_id == filters["employer_id"])

            if filters.get("trainer_id"):
                query = query.filter(Payment.trainer_id == filters["trainer_id"])

            if filters.get("status"):
                query = query.filter(Payment.status == filters["status"])

            if filters.get("currency"):
                query = query.filter(Payment.currency == filters["currency"])

        return query.count()

    def create(self, **data) -> Payment:
        payment = Payment(**data)
        self.db.add(payment)
        self.db.commit()
        self.db.refresh(payment)
        return payment

    def mark_success(self, payment: Payment, reference: str) -> Payment:
        payment.status = PaymentStatus.SUCCESS
        payment.transaction_id = reference
        self.db.commit()
        self.db.refresh(payment)
        return payment
