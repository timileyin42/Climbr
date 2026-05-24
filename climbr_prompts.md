# Climbr — Claude Code Project Prompts

> Two-phase build. Run **Phase 1** first in the backend repo. Only start **Phase 2** when Phase 1 is green (all tests passing, deployed to staging, OpenAPI schema stable).

---

## 📌 Phase 1 — Backend: Finish, Rename, Harden, Test

**Paste this into Claude Code from inside the cloned `iRxcruit-Backend` repo.**

---

You are working on a FastAPI backend for a career platform that connects young African talent with jobs and training programs. The product has four user roles: **Talent**, **Employer**, **Trainer**, and **Admin**. The codebase already exists — your job is to finish, rename, secure, and verify it end-to-end so a Flutter mobile client can safely consume it.

### Context you must read FIRST, before writing any code

1. Read `README.md` in full.
2. Walk the directory tree and read every file under `app/` — routers, services, models, dependencies, templates, `main.py`, `database.py`, `init_db.py`.
3. Read `alembic/env.py` and every file under `alembic/versions/`.
4. Read `requirements.txt`, `.env.example`, `run.py`, `create_dirs.py`, and the two root-level test files.
5. Read everything under `tests/`.
6. After reading, produce a written audit in `AUDIT.md` at the repo root containing:
   - Inventory of every router and the endpoints it exposes (method + path + auth requirement + role required).
   - List of every SQLAlchemy model and its relationships.
   - List of every service module and its public functions.
   - Anything that looks incomplete, broken, insecure, or inconsistent — be ruthless and specific (file + line number).
   - Any TODO / FIXME / commented-out code.
   - Dependencies in `requirements.txt` that are outdated or have known CVEs.

**Do not start coding until the audit is written and I have reviewed it. Stop and wait.**

### Rename: iRxcruit → Climbr

Once I approve the audit, do a complete project-wide rename. Be exhaustive — this is the first thing reviewers will spot if you miss spots.

- All occurrences of `iRxcruit`, `irxcruit`, `IRXCRUIT`, `iRXcruit`, `Irxcruit` → `Climbr` / `climbr` / `CLIMBR` matching the original casing.
- `irxcruit.db` → `climbr.db`.
- Email defaults: `iRxcruit Team` → `Climbr Team`, `no-reply@yourdomain.com` stays as a placeholder but update any hardcoded references.
- Update `README.md` title, tagline, all setup commands, all example URLs.
- Update every email template under `app/templates/` — subject lines, body copy, footer branding.
- Rename the alembic database URL default in `alembic.ini` and `alembic/env.py`.
- Update the FastAPI app `title` and `description` in `app/main.py` so `/docs` renders as **Climbr API**.
- Update the package metadata, `.env.example` defaults, and any logger names.
- Grep the entire repo for the old name as a final check before you say you're done — paste the grep output showing zero matches.

### Backend completion + hardening checklist

Work through these in order. For each, write the code, run it, then update `PROGRESS.md` with what you did.

1. **Dependencies**
   - Pin every dependency in `requirements.txt` to a specific version.
   - Run `pip install -r requirements.txt` in a fresh venv and confirm it resolves cleanly.
   - Add `requirements-dev.txt` with pytest, pytest-cov, pytest-asyncio, httpx, ruff, black, mypy.

2. **Config & secrets**
   - Move all config into a single `app/config.py` using `pydantic-settings` (`BaseSettings`).
   - Validate required env vars at startup — fail fast with a clear error if any are missing in production mode.
   - Ensure `JWT_SECRET_KEY` rejects the literal example string.
   - Add an `ENVIRONMENT` var (`development` / `staging` / `production`) and use it to gate debug behavior.

3. **Database & migrations**
   - Confirm every model in `app/models/database_models.py` has a corresponding migration.
   - Add a fresh migration if anything has drifted.
   - Add indexes on all foreign keys and on any field used in a `WHERE` clause inside service queries.
   - Add unique constraints where they're implied by the business logic (emails, etc.).
   - Confirm `alembic upgrade head` and `alembic downgrade base` both run clean on a fresh database.

4. **Authentication**
   - Audit the JWT implementation: confirm tokens are signed with HS256 or better, expire correctly, and the refresh flow rotates tokens.
   - Hash passwords with `bcrypt` or `argon2` — never plaintext or SHA-anything.
   - Add rate limiting on `/auth/login`, `/auth/register`, `/auth/forgot-password` using `slowapi`.
   - Add a `POST /auth/logout` that blacklists the refresh token (use a small Redis cache or a DB table — pick the simpler one and document why).
   - Confirm Google OAuth flow works end-to-end with a real `GOOGLE_CLIENT_ID` placeholder.

5. **Authorization**
   - Audit every router. Every endpoint must declare its role requirement via an explicit dependency — never assume.
   - Write a `require_role(*roles)` dependency if one doesn't exist cleanly and apply it.
   - Add a test that hits each protected endpoint with the wrong role and confirms `403`.

6. **Input validation**
   - Every request body must be a Pydantic model. Every query param must be typed. Every path param must be typed.
   - Add field validators for email format, password strength (≥8 chars, mixed case, digit), phone numbers, URLs.
   - Reject any payload over a sensible size limit (1 MB JSON, 10 MB file uploads — configurable).

7. **File uploads**
   - Confirm S3 and GCS adapters work with mocked credentials.
   - Validate file MIME type and extension on upload — whitelist only.
   - Strip EXIF from uploaded images.
   - Generate signed URLs for downloads, never serve files directly.

8. **Payments (Stripe)**
   - Confirm the payment flow creates a Stripe PaymentIntent, returns the client_secret, and verifies via webhook.
   - Add the webhook endpoint with signature verification.
   - Mark a job/training as `paid_at` only after webhook confirmation, never on client callback.
   - Idempotency keys on every Stripe call.

9. **Email**
   - Confirm Resend integration works with a placeholder API key (mock in tests).
   - Every transactional email template renders without missing variables — write a test that loads each template with sample data.
   - Add a fallback plain-text version for every HTML email.

10. **Errors & logging**
    - Global exception handler that returns a consistent JSON shape: `{"error": {"code": "...", "message": "...", "details": {...}}}`.
    - Structured JSON logging (use `python-json-logger`).
    - Request ID middleware — generate or accept `X-Request-ID` and include it in every log line and error response.
    - Never leak stack traces in production responses.

11. **CORS & security headers**
    - CORS configured via env var, locked to specific origins in production.
    - Add security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, `Referrer-Policy`.

12. **Mobile-friendly API surface**
    - All list endpoints support pagination (`?page=N&limit=N`, default limit 20, max 100). Response shape: `{"items": [...], "page": N, "limit": N, "total": N, "has_more": bool}`.
    - Add `If-Modified-Since` / `ETag` support on read-heavy endpoints (jobs list, trainings list) so the mobile app can cache.
    - Add a `GET /health` endpoint (no auth) returning `{"status": "ok", "version": "...", "db": "ok"}`.
    - Add a `GET /version` endpoint returning git commit SHA + build time.
    - Add a `GET /me` endpoint returning the current user's full profile in a single response (mobile apps hate N+1 round trips).
    - For the **swipe UX**, add `POST /talent/jobs/{id}/save`, `POST /talent/jobs/{id}/skip`, `POST /talent/trainings/{id}/save`, `POST /talent/trainings/{id}/skip` — and ensure the recommendation endpoints exclude already-skipped items.

13. **OpenAPI**
    - Confirm `/docs` renders cleanly. Every endpoint has a `summary`, `description`, response model, and example response.
    - Tag endpoints by domain (`auth`, `talent`, `employer`, `trainer`, `admin`, `public`) so the Flutter client can be generated cleanly.
    - Export the OpenAPI schema to `openapi.json` at the repo root after every change — this is the contract the mobile app will consume.

### Testing — this is non-negotiable

Write a comprehensive test suite using `pytest` + `httpx.AsyncClient` against the FastAPI app.

- **Unit tests** for every service function. Mock external calls (Stripe, Resend, S3, GCS, Google OAuth).
- **Integration tests** for every router. For each endpoint, test:
  - Happy path (correct payload, correct role, correct response shape).
  - Unauthorized (no token).
  - Forbidden (wrong role).
  - Validation failure (bad payload).
  - Not found.
  - Conflict where relevant (duplicate email, etc.).
- **Fixtures**: a `conftest.py` with reusable fixtures for a test client, a fresh test database (use SQLite in-memory or a transactional rollback pattern), and one user per role with valid JWTs.
- **Coverage**: target ≥85% on `app/services/` and ≥75% overall. Run `pytest --cov=app --cov-report=term-missing` and paste the output in `PROGRESS.md`.
- **No flaky tests.** No `time.sleep`. No real network calls.

### Deliverables for Phase 1

When you believe Phase 1 is complete:

1. `AUDIT.md` (already written before coding).
2. `PROGRESS.md` documenting every change, with a checkbox list matching the items above.
3. Full grep for old name → zero matches.
4. `pytest` → all green.
5. `pytest --cov=app` → coverage report meeting the targets.
6. `alembic upgrade head` on a fresh DB → clean.
7. `uvicorn app.main:app` boots without warnings.
8. `openapi.json` exported at repo root.
9. A `MOBILE_API_CONTRACT.md` at repo root summarizing for the Flutter dev: base URL pattern, auth header format, token refresh flow, pagination shape, error shape, all role-gated endpoint groups, and the swipe endpoints. This is what Phase 2 will consume.

### Rules of engagement

- Do not invent features that aren't in the existing codebase or in this prompt.
- Do not change the public API shape unless the audit flags it as broken or unsafe — and in that case, document the change in `MOBILE_API_CONTRACT.md`.
- If you hit a decision point that's genuinely ambiguous, stop and ask. Don't guess on auth, payments, or data shape.
- Commit in small, logically-scoped commits with clear messages. Don't do one giant "finish backend" commit.

Begin with the audit. Stop after writing `AUDIT.md` and wait for my review.

