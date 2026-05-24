from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Literal, Optional
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ────────────────────────────────────────────────────────────
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str  # no default — fails fast if missing

    # ── JWT ────────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str  # no default
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ───────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str = "http://localhost:3000,http://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── Email (Resend) ─────────────────────────────────────────────────────────
    RESEND_API_KEY: Optional[str] = None
    FROM_EMAIL: str = "no-reply@climbr.com"
    FROM_NAME: str = "Climbr Team"
    ADMIN_EMAIL: Optional[str] = None

    # ── Cloudflare R2 ─────────────────────────────────────────────────────────
    R2_ACCOUNT_ID: Optional[str] = None
    R2_ACCESS_KEY_ID: Optional[str] = None
    R2_SECRET_ACCESS_KEY: Optional[str] = None
    R2_BUCKET_NAME: Optional[str] = None
    R2_PUBLIC_URL: Optional[str] = None

    # ── Paystack ───────────────────────────────────────────────────────────────
    PAYSTACK_SECRET_KEY: Optional[str] = None
    PAYSTACK_PUBLIC_KEY: Optional[str] = None
    PAYSTACK_WEBHOOK_SECRET: Optional[str] = None

    # ── Firebase ───────────────────────────────────────────────────────────────
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_CREDENTIALS_JSON: Optional[str] = None

    # ── Admin bootstrap ────────────────────────────────────────────────────────
    ADMIN_PASSWORD: Optional[str] = None  # required in production (see validator)
    ADMIN_FIRST_NAME: str = "Admin"
    ADMIN_LAST_NAME: str = "User"

    # ── App ────────────────────────────────────────────────────────────────────
    APP_URL: str = "http://localhost:8000"
    FRONTEND_URL: str = "http://localhost:3000"

    # ── Validators ─────────────────────────────────────────────────────────────

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        weak = {"your-secret-key", "secret-key", "secret", "changeme", "password"}
        if v.lower() in weak:
            raise ValueError(
                "JWT_SECRET_KEY is set to an example/weak value. "
                "Generate a secure key: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long.")
        return v

    @model_validator(mode="after")
    def validate_production_vars(self) -> "Settings":
        if self.ENVIRONMENT == "production":
            required = {
                "RESEND_API_KEY": self.RESEND_API_KEY,
                "ADMIN_EMAIL": self.ADMIN_EMAIL,
                "ADMIN_PASSWORD": self.ADMIN_PASSWORD,
                "R2_ACCOUNT_ID": self.R2_ACCOUNT_ID,
                "R2_ACCESS_KEY_ID": self.R2_ACCESS_KEY_ID,
                "R2_SECRET_ACCESS_KEY": self.R2_SECRET_ACCESS_KEY,
                "R2_BUCKET_NAME": self.R2_BUCKET_NAME,
                "R2_PUBLIC_URL": self.R2_PUBLIC_URL,
                "PAYSTACK_SECRET_KEY": self.PAYSTACK_SECRET_KEY,
                "PAYSTACK_WEBHOOK_SECRET": self.PAYSTACK_WEBHOOK_SECRET,
                "FIREBASE_PROJECT_ID": self.FIREBASE_PROJECT_ID,
                "FIREBASE_CREDENTIALS_JSON": self.FIREBASE_CREDENTIALS_JSON,
            }
            missing = [k for k, v in required.items() if not v]
            if missing:
                raise ValueError(
                    f"Missing required environment variables for production: {', '.join(missing)}"
                )

            if "*" in self.CORS_ORIGINS:
                raise ValueError(
                    "CORS_ORIGINS cannot contain '*' in production. "
                    "Set explicit origins e.g. CORS_ORIGINS=https://app.climbr.com"
                )

        return self


def _load_settings() -> Settings:
    """Load settings, providing a helpful error if required vars are missing."""
    try:
        return Settings()
    except Exception as e:
        raise RuntimeError(
            f"Configuration error — check your .env file or environment variables.\n{e}"
        ) from e


settings = _load_settings()
