"""Unit tests for PaymentService — mocks all Paystack HTTP calls."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.payment import PaymentService


@pytest.fixture(autouse=True)
def mock_paystack_key(monkeypatch):
    monkeypatch.setattr("app.services.payment.settings.PAYSTACK_SECRET_KEY", "sk_test_fake")
    monkeypatch.setattr("app.services.payment.settings.PAYSTACK_WEBHOOK_SECRET", "wh_secret")


class TestInitializeTransaction:
    @pytest.mark.asyncio
    async def test_success(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "authorization_url": "https://paystack.com/pay/abc",
                "access_code": "acc_123",
                "reference": "climbr_abc123",
            },
        }

        with patch("app.services.payment.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )
            result = await PaymentService.initialize_transaction(
                amount_ngn=5000,
                email="talent@example.com",
            )

        assert result["success"] is True
        assert "authorization_url" in result
        assert "reference" in result

    @pytest.mark.asyncio
    async def test_paystack_error_response(self):
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.json.return_value = {"status": False, "message": "Invalid email"}

        with patch("app.services.payment.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = AsyncMock(
                return_value=mock_response
            )
            result = await PaymentService.initialize_transaction(
                amount_ngn=5000,
                email="bad_email",
            )

        assert result["success"] is False
        assert "error" in result

    @pytest.mark.asyncio
    async def test_amount_converted_to_kobo(self):
        captured = {}

        async def fake_post(url, json=None, headers=None):
            captured["amount"] = json.get("amount")
            r = MagicMock()
            r.status_code = 200
            r.json.return_value = {
                "status": True,
                "data": {
                    "authorization_url": "url",
                    "access_code": "acc",
                    "reference": "ref",
                },
            }
            return r

        with patch("app.services.payment.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.post = fake_post
            await PaymentService.initialize_transaction(amount_ngn=1500, email="x@x.com")

        assert captured["amount"] == 150000  # 1500 NGN × 100


class TestVerifyTransaction:
    @pytest.mark.asyncio
    async def test_success_status(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "status": "success",
                "amount": 500000,
                "customer": {"email": "t@t.com"},
                "metadata": {},
            },
        }

        with patch("app.services.payment.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            result = await PaymentService.verify_transaction("some_ref")

        assert result["success"] is True
        assert result["status"] == "success"
        assert result["amount_ngn"] == 5000.0

    @pytest.mark.asyncio
    async def test_failed_transaction(self):
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {
            "status": True,
            "data": {
                "status": "failed",
                "amount": 500000,
                "customer": {"email": "t@t.com"},
                "metadata": {},
            },
        }

        with patch("app.services.payment.httpx.AsyncClient") as mock_client:
            mock_client.return_value.__aenter__.return_value.get = AsyncMock(
                return_value=mock_response
            )
            result = await PaymentService.verify_transaction("bad_ref")

        assert result["success"] is True
        assert result["status"] == "failed"


class TestWebhookSignature:
    def test_valid_signature(self):
        import hashlib, hmac
        secret = "wh_secret"
        payload = b'{"event":"charge.success"}'
        sig = hmac.new(secret.encode(), payload, hashlib.sha512).hexdigest()
        assert PaymentService.verify_webhook_signature(payload, sig) is True

    def test_invalid_signature(self):
        payload = b'{"event":"charge.success"}'
        assert PaymentService.verify_webhook_signature(payload, "wrong_sig") is False
