"""Unit tests for StorageService — mocks boto3, tests magic detection and EXIF stripping."""
import io
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from fastapi import HTTPException
from fastapi.datastructures import UploadFile


def _make_upload(data: bytes, filename: str = "test.jpg", content_type: str = "image/jpeg") -> UploadFile:
    """Build a minimal UploadFile from raw bytes."""
    return UploadFile(filename=filename, file=io.BytesIO(data))


class TestMimeDetection:
    def test_detect_jpeg(self):
        from app.services.storage import _detect_mime
        # Minimal JPEG magic bytes
        jpeg = bytes([0xFF, 0xD8, 0xFF, 0xE0]) + b"\x00" * 100
        assert _detect_mime(jpeg) == "image/jpeg"

    def test_detect_pdf(self):
        from app.services.storage import _detect_mime
        pdf = b"%PDF-1.4 test content"
        assert _detect_mime(pdf) == "application/pdf"


class TestExifStrip:
    def test_strip_returns_bytes(self):
        from app.services.storage import _strip_exif
        from PIL import Image
        buf = io.BytesIO()
        img = Image.new("RGB", (10, 10), color=(255, 0, 0))
        img.save(buf, format="JPEG")
        raw = buf.getvalue()
        result = _strip_exif(raw, "image/jpeg")
        assert isinstance(result, bytes)
        assert len(result) > 0

    def test_non_raster_unchanged(self):
        from app.services.storage import _strip_exif
        data = b"%PDF-1.4 unchanged"
        result = _strip_exif(data, "application/pdf")
        assert result == data


class TestUploadFile:
    @pytest.mark.asyncio
    async def test_invalid_mime_raises_415(self, monkeypatch):
        from app.services.storage import StorageService

        # A text file disguised as jpeg
        monkeypatch.setattr("app.services.storage._detect_mime", lambda data: "text/plain")

        from io import BytesIO
        f = UploadFile(filename="evil.txt", file=BytesIO(b"not an image"))
        with pytest.raises(HTTPException) as exc_info:
            await StorageService.upload_image(f, "test")
        assert exc_info.value.status_code == 415

    @pytest.mark.asyncio
    async def test_success_returns_url(self, monkeypatch):
        from app.services.storage import StorageService

        monkeypatch.setattr("app.services.storage._detect_mime", lambda data: "image/jpeg")
        monkeypatch.setattr("app.services.storage._strip_exif", lambda data, mime: data)
        monkeypatch.setattr("app.services.storage.settings.R2_ACCOUNT_ID", "acct")
        monkeypatch.setattr("app.services.storage.settings.R2_ACCESS_KEY_ID", "key")
        monkeypatch.setattr("app.services.storage.settings.R2_SECRET_ACCESS_KEY", "secret")
        monkeypatch.setattr("app.services.storage.settings.R2_BUCKET_NAME", "bucket")
        monkeypatch.setattr("app.services.storage.settings.R2_PUBLIC_URL", "https://pub.r2.dev")

        mock_client = MagicMock()
        mock_client.put_object = MagicMock()

        with patch("app.services.storage._get_r2_client", return_value=mock_client):
            f = UploadFile(filename="photo.jpg", file=io.BytesIO(b"fake jpeg data"))
            url = await StorageService.upload_image(f, "profile_images/1")

        assert url is not None
        assert url.startswith("https://pub.r2.dev/profile_images/1/")
        mock_client.put_object.assert_called_once()
