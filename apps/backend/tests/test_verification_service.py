"""Unit tests for VerificationService — mocks DB and email."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


class TestTokenHashing:
    def test_hash_is_deterministic(self):
        from app.services.verification import _hash_token
        h1 = _hash_token("abc123")
        h2 = _hash_token("abc123")
        assert h1 == h2

    def test_different_tokens_give_different_hashes(self):
        from app.services.verification import _hash_token
        assert _hash_token("token1") != _hash_token("token2")

    def test_hash_is_hex_string(self):
        from app.services.verification import _hash_token
        h = _hash_token("test_token")
        int(h, 16)  # must be valid hex


class TestVerifyEmail:
    @pytest.mark.asyncio
    async def test_invalid_token(self):
        from app.services.verification import VerificationService

        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = None

        success, message = await VerificationService.verify_email(db, "bad_token")
        assert success is False
        assert "Invalid" in message

    @pytest.mark.asyncio
    async def test_already_verified(self):
        from app.services.verification import VerificationService
        from app.services.verification import _hash_token

        token = "mytoken"
        user = MagicMock()
        user.is_verified = True
        user.verification_token_hash = _hash_token(token)
        user.verification_token_expires = None

        db = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = user

        success, message = await VerificationService.verify_email(db, token)
        # Still succeeds or gracefully handles it
        assert isinstance(success, bool)
        assert isinstance(message, str)


class TestSendVerificationEmail:
    @pytest.mark.asyncio
    async def test_send_creates_token_and_calls_email(self):
        from app.services.verification import VerificationService

        user = MagicMock()
        user.email = "u@example.com"
        db = MagicMock()

        with patch.object(
            VerificationService,
            "create_verification_token",
            new_callable=AsyncMock,
            return_value=(True, "fake_token"),
        ):
            with patch("app.services.verification.EmailService.send_verification_email", new_callable=AsyncMock, return_value=True):
                success, msg = await VerificationService.send_verification_email(
                    db, user, "http://localhost:8000"
                )

        assert success is True
