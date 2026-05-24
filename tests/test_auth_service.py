"""Unit tests for AuthService — no DB required."""
import pytest
from unittest.mock import MagicMock, patch

from app.services.auth import AuthService


class TestPasswordHashing:
    def test_hash_and_verify(self):
        h = AuthService.get_password_hash("hunter2")
        assert h.startswith("$argon2")
        assert AuthService.verify_password("hunter2", h)
        assert not AuthService.verify_password("wrong", h)

    def test_different_passwords_give_different_hashes(self):
        h1 = AuthService.get_password_hash("pass1")
        h2 = AuthService.get_password_hash("pass1")
        # Argon2 is salted — same input produces different digests
        assert h1 != h2

    def test_legacy_bcrypt_hash_still_verifies(self):
        from passlib.context import CryptContext
        bcrypt_ctx = CryptContext(schemes=["bcrypt"])
        legacy_hash = bcrypt_ctx.hash("mypassword")
        # Our mixed context should verify bcrypt hashes
        assert AuthService.verify_password("mypassword", legacy_hash)


class TestTokenCreation:
    def test_create_user_token(self):
        from app.models.database_models import UserType
        user = MagicMock()
        user.email = "u@example.com"
        user.user_type = UserType.TALENT

        result = AuthService().create_user_token(user)
        assert "access_token" in result
        assert result["token_type"] == "bearer"
        assert len(result["access_token"]) > 10

    def test_get_user_by_email(self):
        db = MagicMock()
        user = MagicMock()
        db.query.return_value.filter.return_value.first.return_value = user

        result = AuthService.get_user_by_email(db, "u@example.com")
        assert result == user
