import hashlib
import logging
import uuid

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import talent, employer, trainer, admin, public, auth, payments
from app.setup import setup_directories
from app.services.archiving import ArchivingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

directories = setup_directories()

# ── Rate limiter (attach before app routes) ────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Climbr API",
    description="API for Climbr - Career Platform connecting young African talent with job opportunities and training programs",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ──────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── ETag middleware for GET list responses ────────────────────────────────
@app.middleware("http")
async def etag_middleware(request: Request, call_next):
    response = await call_next(request)
    if (
        request.method == "GET"
        and response.status_code == 200
        and response.headers.get("content-type", "").startswith("application/json")
    ):
        body = b""
        async for chunk in response.body_iterator:
            body += chunk
        etag = f'"{hashlib.md5(body).hexdigest()}"'
        if request.headers.get("if-none-match") == etag:
            return Response(status_code=304, headers={"ETag": etag})
        response = Response(
            content=body,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.media_type,
        )
        response.headers["ETag"] = etag
    return response


# ── Request-ID + Security-Headers middleware ──────────────────────────────
@app.middleware("http")
async def add_request_id_and_security_headers(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = request_id

    response = await call_next(request)

    response.headers["X-Request-ID"] = request_id
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    if settings.ENVIRONMENT == "production":
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"

    return response


# ── Global exception handler ──────────────────────────────────────────────
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    request_id = getattr(request.state, "request_id", "unknown")
    logger.exception("Unhandled exception [request_id=%s]: %s", request_id, exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An unexpected error occurred. Please try again later.",
            "request_id": request_id,
        },
    )


# ── Routers ────────────────────────────────────────────────────────────────
app.include_router(public.router, tags=["public"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(talent.router, prefix="/talent", tags=["talent"])
app.include_router(employer.router, prefix="/employer", tags=["employer"])
app.include_router(trainer.router, prefix="/trainer", tags=["trainer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])


# ── Lifecycle ─────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Climbr API (env=%s)", settings.ENVIRONMENT)
    logger.info("Templates directory: %s", directories["templates_dir"])
    await ArchivingService.setup_scheduled_archiving(app)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Climbr API")
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown()


@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Climbr API - Because building your future shouldn't feel like rocket science."
    }


@app.get("/health", tags=["system"])
async def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}


@app.get("/version", tags=["system"])
async def version():
    return {"version": "1.0.0", "api": "Climbr API"}
