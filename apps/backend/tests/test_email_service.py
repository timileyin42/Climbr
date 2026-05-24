"""Unit tests for EmailService — mocks the Resend SDK."""
import pytest
from unittest.mock import AsyncMock, MagicMock, patch


@pytest.fixture(autouse=True)
def mock_resend_key(monkeypatch):
    monkeypatch.setattr("app.services.email.settings.RESEND_API_KEY", "re_test_key")
    monkeypatch.setattr("app.services.email.settings.FROM_EMAIL", "noreply@climbr.com")
    monkeypatch.setattr("app.services.email.settings.FROM_NAME", "Climbr")
    monkeypatch.setattr("app.services.email.settings.FRONTEND_URL", "http://localhost:3000")


class TestEmailService:
    @pytest.mark.asyncio
    async def test_send_email_success(self):
        from app.services.email import EmailService

        with patch("app.services.email.resend") as mock_resend:
            mock_resend.api_key = None
            mock_resend.Emails.send_async = AsyncMock(return_value=MagicMock(id="email_001"))
            result = await EmailService.send_email(
                to_email="user@example.com",
                subject="Test",
                template_name="nonexistent_template.html",
                template_data={"key": "value"},
            )

        assert result is True

    @pytest.mark.asyncio
    async def test_send_email_no_api_key(self, monkeypatch):
        from app.services.email import EmailService

        monkeypatch.setattr("app.services.email.settings.RESEND_API_KEY", None)
        result = await EmailService.send_email(
            to_email="user@example.com",
            subject="Test",
            template_name="test.html",
            template_data={},
        )
        assert result is False

    @pytest.mark.asyncio
    async def test_send_email_sdk_exception(self):
        from app.services.email import EmailService

        with patch("app.services.email.resend") as mock_resend:
            mock_resend.api_key = None
            mock_resend.Emails.send_async = AsyncMock(side_effect=Exception("network error"))
            result = await EmailService.send_email(
                to_email="user@example.com",
                subject="Test",
                template_name="test.html",
                template_data={},
            )
        assert result is False

    @pytest.mark.asyncio
    async def test_send_verification_email(self):
        from app.services.email import EmailService

        with patch.object(EmailService, "send_email", new_callable=AsyncMock, return_value=True) as mock:
            result = await EmailService.send_verification_email("u@e.com", "https://verify")
        assert result is True
        mock.assert_called_once()
        call_kwargs = mock.call_args
        assert call_kwargs.kwargs.get("to_email") == "u@e.com" or call_kwargs.args[0] == "u@e.com"

    @pytest.mark.asyncio
    async def test_send_password_reset_email(self):
        from app.services.email import EmailService

        with patch.object(EmailService, "send_email", new_callable=AsyncMock, return_value=True) as mock:
            result = await EmailService.send_password_reset_email("u@e.com", "https://reset")
        assert result is True
        mock.assert_called_once()
