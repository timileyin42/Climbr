from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Environment ────────────────────────────────────────────────────────────
    ENVIRONMENT: str

    # ── Database ───────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT ────────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── CORS ───────────────────────────────────────────────────────────────────
    CORS_ORIGINS: str

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    # ── Email (Resend) ─────────────────────────────────────────────────────────
    RESEND_API_KEY: str
    FROM_EMAIL: str
    FROM_NAME: str
    ADMIN_EMAIL: str

    # ── Cloudflare R2 ─────────────────────────────────────────────────────────
    R2_ACCOUNT_ID: str
    R2_ACCESS_KEY_ID: str
    R2_SECRET_ACCESS_KEY: str
    R2_BUCKET_NAME: str
    R2_PUBLIC_URL: str

    # ── Paystack ───────────────────────────────────────────────────────────────
    PAYSTACK_SECRET_KEY: str
    PAYSTACK_PUBLIC_KEY: Optional[str] = None
    PAYSTACK_WEBHOOK_SECRET: str

    # ── Firebase ───────────────────────────────────────────────────────────────
    FIREBASE_PROJECT_ID: str
    FIREBASE_CREDENTIALS_JSON: str

    # ── Google AI (Gemini — free tier) ────────────────────────────────────────
    GOOGLE_AI_API_KEY: Optional[str] = None

    # ── Redis / Celery ────────────────────────────────────────────────────────
    REDIS_URL: Optional[str] = None

    # ── Admin bootstrap ────────────────────────────────────────────────────────
    ADMIN_PASSWORD: str
    ADMIN_FIRST_NAME: str
    ADMIN_LAST_NAME: str

    # ── App ────────────────────────────────────────────────────────────────────
    APP_URL: str
    FRONTEND_URL: str

    # ── Validators ─────────────────────────────────────────────────────────────

    @field_validator("JWT_SECRET_KEY")
    @classmethod
    def validate_jwt_secret(cls, v: str) -> str:
        weak = {"your-secret-key", "secret-key", "secret", "changeme", "password"}
        if v.lower() in weak:
            raise ValueError(
                "JWT_SECRET_KEY is set to a weak example value. "
                "Generate one: python -c \"import secrets; print(secrets.token_hex(32))\""
            )
        if len(v) < 32:
            raise ValueError("JWT_SECRET_KEY must be at least 32 characters long.")
        return v

    @model_validator(mode="after")
    def validate_cors(self) -> "Settings":
        if "*" in self.CORS_ORIGINS:
            raise ValueError(
                "CORS_ORIGINS cannot contain '*'. "
                "Set explicit origins e.g. CORS_ORIGINS=https://app.climbr.com,http://localhost:5173"
            )
        return self


def _load_settings() -> Settings:
    try:
        return Settings()
    except Exception as e:
        raise RuntimeError(
            f"Configuration error — check your .env file or environment variables.\n{e}"
        ) from e


settings = _load_settings()
