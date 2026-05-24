"""
Shared pytest fixtures.

Route tests use TestClient with a mocked DB session so no PostgreSQL server
is required. Service/repository unit tests mock the DB directly.

To run integration tests against a real PostgreSQL, set:
  TEST_DATABASE_URL=postgresql://user:pass@localhost/climbr_test
"""
import os
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "postgresql://test:test@localhost/climbr_test")
os.environ.setdefault("JWT_SECRET_KEY", "a-very-long-secret-key-for-testing-purposes-here-32")

from app.database import get_db
from app.main import app


# ── Test Client with mocked DB ─────────────────────────────────────────────

@pytest.fixture(scope="session")
def mock_db():
    db = MagicMock()
    return db


@pytest.fixture(scope="session")
def client(mock_db):
    def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


# ── Auth helpers ──────────────────────────────────────────────────────────

def make_user(
    id=1,
    email="test@example.com",
    user_type_value="talent",
    is_active=True,
    is_verified=True,
):
    from app.models.database_models import UserType
    user = MagicMock()
    user.id = id
    user.email = email
    user.is_active = is_active
    user.is_verified = is_verified
    user.user_type = MagicMock()
    user.user_type.value = user_type_value
    user.firebase_uid = None
    return user


def make_talent(id=1, user=None):
    talent = MagicMock()
    talent.id = id
    talent.user = user or make_user()
    talent.job_applications = []
    talent.training_applications = []
    return talent
