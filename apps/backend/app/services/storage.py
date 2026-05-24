import io
import logging
import uuid
import zipfile
from typing import Optional

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException, status
from PIL import Image

from app.config import settings

logger = logging.getLogger(__name__)

# MIME types accepted by the platform (validated via file signatures)
ALLOWED_IMAGE_TYPES: dict[str, str] = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/svg+xml": "svg",
}

ALLOWED_DOCUMENT_TYPES: dict[str, str] = {
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
}

ALLOWED_TYPES = {**ALLOWED_IMAGE_TYPES, **ALLOWED_DOCUMENT_TYPES}

# Max file sizes
MAX_IMAGE_BYTES = 5 * 1024 * 1024   # 5 MB
MAX_DOCUMENT_BYTES = 10 * 1024 * 1024  # 10 MB

# EXIF-strippable raster formats
_RASTER_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _get_r2_client():
    """Return a boto3 S3-compatible client pointed at Cloudflare R2."""
    if not all([
        settings.R2_ACCOUNT_ID,
        settings.R2_ACCESS_KEY_ID,
        settings.R2_SECRET_ACCESS_KEY,
        settings.R2_BUCKET_NAME,
    ]):
        raise RuntimeError("Cloudflare R2 is not configured — check R2_* env vars")

    return boto3.client(
        "s3",
        endpoint_url=f"https://{settings.R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=settings.R2_ACCESS_KEY_ID,
        aws_secret_access_key=settings.R2_SECRET_ACCESS_KEY,
        region_name="auto",
        config=Config(signature_version="s3v4"),
    )


def _detect_mime(data: bytes) -> str:
    """Return the MIME type detected from file signatures (not client Content-Type)."""
    if data.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if data.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "image/webp"
    if _looks_like_svg(data):
        return "image/svg+xml"
    if data.startswith(b"%PDF-"):
        return "application/pdf"
    if data.startswith(b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"):
        return "application/msword"
    if _looks_like_docx(data):
        return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    return "application/octet-stream"


def _looks_like_svg(data: bytes) -> bool:
    sample = data[:512].lstrip()
    return sample.startswith(b"<svg") or (
        sample.startswith(b"<?xml") and b"<svg" in sample[:256]
    )


def _looks_like_docx(data: bytes) -> bool:
    if not data.startswith(b"PK"):
        return False
    try:
        with zipfile.ZipFile(io.BytesIO(data)) as archive:
            names = set(archive.namelist())
            return "[Content_Types].xml" in names and any(
                name.startswith("word/") for name in names
            )
    except zipfile.BadZipFile:
        return False


def _strip_exif(data: bytes, mime_type: str) -> bytes:
    """Strip EXIF/metadata from raster images and return clean bytes."""
    if mime_type not in _RASTER_TYPES:
        return data
    try:
        with Image.open(io.BytesIO(data)) as img:
            clean = Image.new(img.mode, img.size)
            clean.putdata(list(img.getdata()))  # type: ignore[arg-type]
            buf = io.BytesIO()
            fmt = "JPEG" if mime_type == "image/jpeg" else img.format or "PNG"
            clean.save(buf, format=fmt)
            return buf.getvalue()
    except Exception:
        logger.warning("EXIF strip failed — uploading original bytes")
        return data


class StorageService:
    """Cloudflare R2 storage — single provider, magic-byte validation, EXIF stripping."""

    @staticmethod
    async def upload_file(
        file: UploadFile,
        folder: str,
        filename: Optional[str] = None,
        allowed_types: Optional[dict[str, str]] = None,
    ) -> Optional[str]:
        """
        Validate, optionally strip EXIF, and upload a file to R2.

        Returns the public URL on success, raises HTTPException on validation failure,
        returns None on upload I/O failure (caller should surface a 500).
        """
        if allowed_types is None:
            allowed_types = ALLOWED_TYPES

        raw = await file.read()
        await file.seek(0)

        # Magic-byte MIME detection
        detected = _detect_mime(raw)
        if detected not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"File type '{detected}' is not allowed. "
                       f"Accepted: {', '.join(allowed_types.keys())}",
            )

        # Size guard
        max_bytes = MAX_IMAGE_BYTES if detected in ALLOWED_IMAGE_TYPES else MAX_DOCUMENT_BYTES
        if len(raw) > max_bytes:
            mb = max_bytes // (1024 * 1024)
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds the {mb} MB limit for {detected}",
            )

        # Strip EXIF for raster images
        payload = _strip_exif(raw, detected)

        # Build the object key
        ext = allowed_types[detected]
        safe_name = filename or f"{uuid.uuid4().hex}.{ext}"
        folder = folder.rstrip("/")
        object_key = f"{folder}/{safe_name}"

        try:
            client = _get_r2_client()
            client.put_object(
                Bucket=settings.R2_BUCKET_NAME,
                Key=object_key,
                Body=payload,
                ContentType=detected,
            )
        except RuntimeError:
            raise
        except ClientError as exc:
            logger.error("R2 upload failed: %s", exc)
            return None
        except Exception as exc:
            logger.error("R2 upload unexpected error: %s", exc)
            return None

        base_url = (settings.R2_PUBLIC_URL or "").rstrip("/")
        return f"{base_url}/{object_key}"

    @staticmethod
    async def delete_file(file_url: str) -> bool:
        """Delete a file from R2 given its public URL."""
        base_url = (settings.R2_PUBLIC_URL or "").rstrip("/")
        if not base_url or not file_url.startswith(base_url):
            logger.error("Cannot delete: URL does not match R2_PUBLIC_URL")
            return False

        object_key = file_url[len(base_url):].lstrip("/")
        try:
            client = _get_r2_client()
            client.delete_object(Bucket=settings.R2_BUCKET_NAME, Key=object_key)
            return True
        except Exception as exc:
            logger.error("R2 delete failed: %s", exc)
            return False

    @staticmethod
    async def upload_image(file: UploadFile, folder: str, filename: Optional[str] = None) -> Optional[str]:
        """Convenience wrapper — accepts images only."""
        return await StorageService.upload_file(file, folder, filename, allowed_types=ALLOWED_IMAGE_TYPES)

    @staticmethod
    async def upload_document(file: UploadFile, folder: str, filename: Optional[str] = None) -> Optional[str]:
        """Convenience wrapper — accepts documents only (PDF, DOC, DOCX)."""
        return await StorageService.upload_file(file, folder, filename, allowed_types=ALLOWED_DOCUMENT_TYPES)
