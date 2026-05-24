"""Tests for /health, /version, and / (root) endpoints."""
import pytest
from fastapi.testclient import TestClient

from tests.conftest import client  # noqa: F401


def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    body = r.json()
    assert body["status"] == "ok"
    assert "environment" in body


def test_version(client):
    r = client.get("/version")
    assert r.status_code == 200
    body = r.json()
    assert "version" in body
    assert body["api"] == "Climbr API"


def test_etag_returned_on_get(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert "etag" in r.headers


def test_etag_304_on_match(client):
    r1 = client.get("/health")
    etag = r1.headers.get("etag")
    assert etag

    r2 = client.get("/health", headers={"if-none-match": etag})
    assert r2.status_code == 304
