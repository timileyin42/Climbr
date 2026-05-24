from typing import Dict, Any, Optional, List
import logging
from sqlalchemy.orm import Session

from app.repositories.payment_repository import PaymentRepository

logger = logging.getLogger(__name__)


class PaymentService:
    """
    Payment service. Stripe has been removed (Milestone K).
    Payment intent methods are stubbed out pending Paystack integration.
    """

    @staticmethod
    async def create_payment_intent(
        amount: float,
        currency: str = "GBP",
        customer_email: str = None,
        metadata: Dict[str, Any] = None,
    ) -> Dict[str, Any]:
        """Stub: Paystack not yet configured."""
        return {"success": False, "error": "Paystack not yet configured"}

    @staticmethod
    async def get_payment_status(payment_id: str) -> Dict[str, Any]:
        """Stub: Paystack not yet configured."""
        return {"success": False, "error": "Paystack not yet configured"}

    @staticmethod
    async def refund_payment(
        payment_id: str, amount: Optional[float] = None
    ) -> Dict[str, Any]:
        """Stub: Paystack not yet configured."""
        return {"success": False, "error": "Paystack not yet configured"}

    @staticmethod
    def get_payments(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ):
        repo = PaymentRepository(db)
        return repo.get_all(skip=skip, limit=limit, filters=filters)

    @staticmethod
    def count_payments(
        db: Session, filters: Optional[Dict[str, Any]] = None
    ) -> int:
        repo = PaymentRepository(db)
        return repo.count(filters=filters)
