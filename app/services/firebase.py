import base64
import json
import logging
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

_firebase_app = None


def _get_app():
    """Return (or lazily initialize) the Firebase Admin app."""
    global _firebase_app
    if _firebase_app is not None:
        return _firebase_app

    if not settings.FIREBASE_PROJECT_ID or not settings.FIREBASE_CREDENTIALS_JSON:
        raise RuntimeError("Firebase is not configured — set FIREBASE_PROJECT_ID and FIREBASE_CREDENTIALS_JSON")

    import firebase_admin
    from firebase_admin import credentials

    if not firebase_admin._apps:
        try:
            raw = base64.b64decode(settings.FIREBASE_CREDENTIALS_JSON).decode("utf-8")
            cred_dict = json.loads(raw)
            cred = credentials.Certificate(cred_dict)
        except Exception as exc:
            raise RuntimeError(f"FIREBASE_CREDENTIALS_JSON is not valid base64-encoded JSON: {exc}") from exc

        _firebase_app = firebase_admin.initialize_app(cred)
    else:
        _firebase_app = firebase_admin.get_app()

    return _firebase_app


async def verify_firebase_id_token(id_token: str) -> Optional[dict]:
    """
    Verify a Firebase ID token and return the decoded claims.

    Returns decoded token dict (contains uid, email, name, etc.)
    or None if invalid/expired.
    """
    try:
        _get_app()
        from firebase_admin import auth as fb_auth
        decoded = fb_auth.verify_id_token(id_token)
        return decoded
    except Exception as exc:
        logger.warning("Firebase token verification failed: %s", exc)
        return None
