import hashlib
import logging
import uuid

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.config import settings
from app.routers import talent, employer, trainer, admin, public, auth, payments, messages, profile_views
from app.setup import setup_directories
from app.services.archiving import ArchivingService

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

directories = setup_directories()

# ── Rate limiter ───────────────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address, default_limits=["200/minute"])

app = FastAPI(
    title="Climbr API",
    description="API for Climbr - Career Platform connecting young African talent with job opportunities and training programs",
    version="1.0.1",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# ── CORS — custom middleware so headers are set on ALL responses including
#    errors. Starlette's CORSMiddleware strips headers on 400/500 which leaves
#    the browser with no Access-Control-Allow-Origin and blocks everything.
# ──────────────────────────────────────────────────────────────────────────────
_CORS_METHODS = "DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT"
_CORS_MAX_AGE = "600"


@app.middleware("http")
async def cors_middleware(request: Request, call_next):
    origin = request.headers.get("origin", "")
    allowed = origin in settings.cors_origins_list

    # Short-circuit OPTIONS preflight — never reach the route handler
    if request.method == "OPTIONS":
        headers = {
            "Access-Control-Allow-Origin": origin if allowed else "",
            "Access-Control-Allow-Methods": _CORS_METHODS,
            "Access-Control-Allow-Headers": request.headers.get(
                "access-control-request-headers", "*"
            ),
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": _CORS_MAX_AGE,
            "Vary": "Origin",
        }
        return Response(status_code=200, headers=headers)

    response = await call_next(request)

    if allowed:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Vary"] = "Origin"

    return response


# ── ETag middleware for GET list responses ─────────────────────────────────────
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


# ── Request-ID + Security-Headers middleware ───────────────────────────────────
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


# ── Global exception handler ───────────────────────────────────────────────────
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


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(public.router, tags=["public"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(talent.router, prefix="/talent", tags=["talent"])
app.include_router(employer.router, prefix="/employer", tags=["employer"])
app.include_router(trainer.router, prefix="/trainer", tags=["trainer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])
app.include_router(payments.router, prefix="/payments", tags=["payments"])
app.include_router(messages.router, prefix="/messages", tags=["messages"])
app.include_router(profile_views.router, tags=["profile-views"])


# ── Lifecycle ──────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup_event():
    logger.info("Starting up Climbr API (env=%s)", settings.ENVIRONMENT)
    logger.info("Templates directory: %s", directories["templates_dir"])
    logger.info("CORS allowed origins: %s", settings.cors_origins_list)
    await ArchivingService.setup_scheduled_archiving(app)


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down Climbr API")
    if hasattr(app.state, "scheduler"):
        try:
            app.state.scheduler.shutdown()
        except Exception:
            pass


@app.get("/", tags=["root"])
async def root():
    return {
        "message": "Welcome to Climbr API - Because building your future shouldn't feel like rocket science."
    }


@app.get("/health", tags=["system"])
async def health():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "cors_origins": settings.cors_origins_list,
    }


@app.get("/version", tags=["system"])
async def version():
    return {"version": "1.0.0", "api": "Climbr API"}
