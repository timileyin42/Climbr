import hashlib
import hmac
import logging
import secrets
from typing import Any, Dict, List, Optional

import httpx
from sqlalchemy.orm import Session

from app.config import settings
from app.models.database_models import PaymentStatus
from app.repositories.payment_repository import PaymentRepository

logger = logging.getLogger(__name__)

_PAYSTACK_BASE = "https://api.paystack.co"


def _headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.PAYSTACK_SECRET_KEY}",
        "Content-Type": "application/json",
    }


class PaymentService:
    """Paystack payment integration — NGN only for v1."""

    # ── Transaction lifecycle ──────────────────────────────────────────────────

    @staticmethod
    async def initialize_transaction(
        amount_ngn: float,
        email: str,
        reference: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
        callback_url: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Initialize a Paystack transaction.

        Returns dict with keys:
          success, authorization_url, access_code, reference
          or success=False, error=<str>
        """
        if not settings.PAYSTACK_SECRET_KEY:
            return {"success": False, "error": "PAYSTACK_SECRET_KEY not configured"}

        ref = reference or f"climbr_{secrets.token_hex(12)}"
        payload: Dict[str, Any] = {
            "amount": int(amount_ngn * 100),  # convert NGN → kobo
            "email": email,
            "reference": ref,
            "currency": "NGN",
        }
        if metadata:
            payload["metadata"] = metadata
        if callback_url:
            payload["callback_url"] = callback_url

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(
                    f"{_PAYSTACK_BASE}/transaction/initialize",
                    json=payload,
                    headers=_headers(),
                )
            data = resp.json()
            if resp.status_code == 200 and data.get("status"):
                return {
                    "success": True,
                    "authorization_url": data["data"]["authorization_url"],
                    "access_code": data["data"]["access_code"],
                    "reference": data["data"]["reference"],
                }
            return {"success": False, "error": data.get("message", "Unknown error")}
        except Exception as exc:
            logger.error("Paystack initialize_transaction error: %s", exc)
            return {"success": False, "error": str(exc)}

    @staticmethod
    async def verify_transaction(reference: str) -> Dict[str, Any]:
        """
        Verify a Paystack transaction by reference.

        Returns dict with keys:
          success, status ("success"|"failed"|...), amount_ngn, email, metadata
        """
        if not settings.PAYSTACK_SECRET_KEY:
            return {"success": False, "error": "PAYSTACK_SECRET_KEY not configured"}

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    f"{_PAYSTACK_BASE}/transaction/verify/{reference}",
                    headers=_headers(),
                )
            data = resp.json()
            if resp.status_code == 200 and data.get("status"):
                tx = data["data"]
                return {
                    "success": True,
                    "status": tx["status"],          # "success", "failed", "abandoned"
                    "amount_ngn": tx["amount"] / 100,
                    "email": tx.get("customer", {}).get("email"),
                    "metadata": tx.get("metadata", {}),
                }
            return {"success": False, "error": data.get("message", "Verification failed")}
        except Exception as exc:
            logger.error("Paystack verify_transaction error: %s", exc)
            return {"success": False, "error": str(exc)}

    # ── Webhook ────────────────────────────────────────────────────────────────

    @staticmethod
    def verify_webhook_signature(payload_bytes: bytes, signature_header: str) -> bool:
        """
        Verify Paystack webhook HMAC-SHA512 signature.
        https://paystack.com/docs/payments/webhooks/#verify-event-origin
        """
        if not settings.PAYSTACK_WEBHOOK_SECRET:
            logger.warning("PAYSTACK_WEBHOOK_SECRET not set — skipping webhook verification")
            return False
        expected = hmac.new(
            settings.PAYSTACK_WEBHOOK_SECRET.encode(),
            payload_bytes,
            hashlib.sha512,
        ).hexdigest()
        return hmac.compare_digest(expected, signature_header)

    # ── Repository helpers ─────────────────────────────────────────────────────

    @staticmethod
    def get_payments(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List:
        return PaymentRepository(db).get_all(skip=skip, limit=limit, filters=filters)

    @staticmethod
    def count_payments(
        db: Session, filters: Optional[Dict[str, Any]] = None
    ) -> int:
        return PaymentRepository(db).count(filters=filters)
