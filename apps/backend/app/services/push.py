import logging
from typing import Optional

logger = logging.getLogger(__name__)


async def send_push_notification(
    token: str,
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> bool:
    """Send a single FCM push notification to one device token."""
    try:
        from app.services.firebase import _get_app
        _get_app()
        from firebase_admin import messaging

        message = messaging.Message(
            notification=messaging.Notification(title=title, body=body),
            data={str(k): str(v) for k, v in (data or {}).items()},
            token=token,
        )
        messaging.send(message)
        return True
    except Exception as exc:
        logger.warning("Push notification failed for token %s: %s", token[:20], exc)
        return False


async def send_push_multicast(
    tokens: list[str],
    title: str,
    body: str,
    data: Optional[dict] = None,
) -> int:
    """Send to multiple device tokens. Returns success count."""
    if not tokens:
        return 0
    try:
        from app.services.firebase import _get_app
        _get_app()
        from firebase_admin import messaging

        message = messaging.MulticastMessage(
            notification=messaging.Notification(title=title, body=body),
            data={str(k): str(v) for k, v in (data or {}).items()},
            tokens=tokens,
        )
        response = messaging.send_each_for_multicast(message)
        return response.success_count
    except Exception as exc:
        logger.warning("Multicast push failed: %s", exc)
        return 0
