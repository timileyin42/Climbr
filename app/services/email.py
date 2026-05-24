import logging
from pathlib import Path
from typing import Any

import jinja2
import resend

from app.config import settings

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).parent.parent / "templates"
TEMPLATES_DIR.mkdir(exist_ok=True, parents=True)

_jinja_env = jinja2.Environment(
    loader=jinja2.FileSystemLoader(str(TEMPLATES_DIR)),
    autoescape=jinja2.select_autoescape(["html"]),
)


def _render(template_name: str, data: dict[str, Any]) -> str:
    """Render a Jinja2 template or fall back to a simple key/value HTML block."""
    try:
        tpl = _jinja_env.get_template(template_name)
        return tpl.render(**data)
    except jinja2.TemplateNotFound:
        logger.warning("Email template '%s' not found — using fallback", template_name)
        body = "".join(f"<p><strong>{k}:</strong> {v}</p>" for k, v in data.items())
        return f"<h2>Climbr Notification</h2>{body}"


class EmailService:
    """Thin wrapper around the official Resend SDK."""

    @staticmethod
    def _configured() -> bool:
        if not settings.RESEND_API_KEY:
            logger.warning("RESEND_API_KEY not set — email sending is disabled")
            return False
        resend.api_key = settings.RESEND_API_KEY
        return True

    @staticmethod
    async def send_email(
        to_email: str,
        subject: str,
        template_name: str,
        template_data: dict[str, Any],
        background_tasks=None,  # accepted for backward-compat but ignored; SDK is async-native
    ) -> bool:
        if not EmailService._configured():
            return False

        html = _render(template_name, template_data)
        params: resend.Emails.SendParams = {
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html,
        }
        try:
            await resend.Emails.send_async(params)
            logger.info("Email sent to %s (subject: %s)", to_email, subject)
            return True
        except Exception as exc:
            logger.error("Resend send failed: %s", exc)
            return False

    # ── Convenience methods ────────────────────────────────────────────────────

    @staticmethod
    async def send_verification_email(to_email: str, verification_link: str) -> bool:
        return await EmailService.send_email(
            to_email=to_email,
            subject="Verify your Climbr email address",
            template_name="email_verification.html",
            template_data={
                "verification_link": verification_link,
                "platform_name": "Climbr",
                "expiry_hours": 24,
            },
        )

    @staticmethod
    async def send_password_reset_email(to_email: str, reset_link: str) -> bool:
        return await EmailService.send_email(
            to_email=to_email,
            subject="Reset your Climbr password",
            template_name="password_reset.html",
            template_data={
                "reset_link": reset_link,
                "platform_name": "Climbr",
                "expiry_hours": 1,
            },
        )

    @staticmethod
    async def send_welcome_email(to_email: str, user_name: str) -> bool:
        return await EmailService.send_email(
            to_email=to_email,
            subject="Welcome to Climbr!",
            template_name="welcome.html",
            template_data={
                "user_name": user_name,
                "platform_name": "Climbr",
                "login_url": f"{settings.FRONTEND_URL}/login",
            },
        )

    @staticmethod
    async def send_application_confirmation(
        to_email: str,
        user_name: str,
        title: str,
        is_job: bool = True,
    ) -> bool:
        kind = "job" if is_job else "training"
        return await EmailService.send_email(
            to_email=to_email,
            subject=f"Your {kind} application has been submitted",
            template_name="application_confirmation.html",
            template_data={
                "user_name": user_name,
                "application_type": kind,
                "title": title,
                "dashboard_url": f"{settings.FRONTEND_URL}/talent/dashboard",
            },
        )

    @staticmethod
    async def send_application_status_update(
        to_email: str,
        user_name: str,
        title: str,
        is_job: bool = True,
    ) -> bool:
        kind = "job" if is_job else "training"
        return await EmailService.send_email(
            to_email=to_email,
            subject=f"Update on your {kind} application",
            template_name="application_status_update.html",
            template_data={
                "user_name": user_name,
                "application_type": kind,
                "title": title,
                "dashboard_url": f"{settings.FRONTEND_URL}/talent/dashboard",
            },
        )

    @staticmethod
    async def send_contact_notification(
        name: str,
        email: str,
        message: str,
        submission_id: int,
        submitted_at: Any,
    ) -> bool:
        admin_email = settings.ADMIN_EMAIL or settings.FROM_EMAIL
        return await EmailService.send_email(
            to_email=admin_email,
            subject=f"New contact form submission from {name}",
            template_name="contact_notification.html",
            template_data={
                "name": name,
                "email": email,
                "message": message,
                "submission_id": submission_id,
                "submitted_at": submitted_at,
            },
        )
