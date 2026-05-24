import logging

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.database_models import Employer, Payment, PaymentStatus, Trainer
from app.services.payment import PaymentService

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/webhook/paystack", status_code=status.HTTP_200_OK)
async def paystack_webhook(
    request: Request,
    x_paystack_signature: str = Header(..., alias="x-paystack-signature"),
    db: Session = Depends(get_db),
):
    """
    Paystack webhook — handles charge.success events.

    Paystack sends HMAC-SHA512(raw body, secret) in the x-paystack-signature header.
    We verify that before processing any event.
    """
    payload_bytes = await request.body()

    if not PaymentService.verify_webhook_signature(payload_bytes, x_paystack_signature):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid signature")

    try:
        import json
        event = json.loads(payload_bytes)
    except Exception:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid JSON")

    event_type = event.get("event")
    if event_type != "charge.success":
        # Acknowledge all other events without action
        return {"status": "ok"}

    data = event.get("data", {})
    reference = data.get("reference")
    if not reference:
        return {"status": "ok"}

    payment = (
        db.query(Payment).filter(Payment.transaction_id == reference).first()
    )
    if not payment or payment.status == PaymentStatus.SUCCESS:
        # Unknown reference or already credited — idempotent
        return {"status": "ok"}

    payment.status = PaymentStatus.SUCCESS

    if payment.employer_id:
        employer = db.query(Employer).filter(Employer.id == payment.employer_id).first()
        if employer:
            employer.job_credits += payment.package_quantity
    elif payment.trainer_id:
        trainer = db.query(Trainer).filter(Trainer.id == payment.trainer_id).first()
        if trainer:
            trainer.training_credits += payment.package_quantity

    db.commit()
    logger.info("Paystack webhook: credited %s credits for reference %s", payment.package_quantity, reference)
    return {"status": "ok"}
