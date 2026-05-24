# Climbr Backend API

FastAPI backend for the Climbr career platform — connects talent with jobs and training programs.

---

## System Architecture

```mermaid
graph TB
    subgraph Clients
        Mobile["📱 Flutter Mobile"]
        Web["🌐 Web App"]
    end

    subgraph Climbr API ["Climbr API  (FastAPI)"]
        GW["Rate Limiter\nslowapi 200 req/min"]
        MW["Middleware\nETag · Security Headers · Request-ID"]
        Router["Routers\n/auth · /talent · /employer\n/trainer · /admin · /public\n/payments"]
        Services["Services\nauth · storage · email\npayment · firebase · verification"]
        Repos["Repository Layer\nBaseRepository[T]\n15 typed repos"]
    end

    subgraph Storage ["External Services"]
        PG[("PostgreSQL 16")]
        R2["☁️ Cloudflare R2\nFile Storage"]
        Resend["✉️ Resend\nTransactional Email"]
        Paystack["💳 Paystack\nPayments (NGN)"]
        Firebase["🔥 Firebase Admin\nGoogle Sign-in"]
    end

    Mobile -->|HTTPS + JWT| GW
    Web -->|HTTPS + JWT| GW
    GW --> MW
    MW --> Router
    Router --> Services
    Services --> Repos
    Repos --> PG
    Services --> R2
    Services --> Resend
    Services --> Paystack
    Services --> Firebase
    Paystack -->|Webhook HMAC-SHA512| Router
```

---

## Auth Flows

```mermaid
sequenceDiagram
    participant App
    participant API
    participant DB
    participant Firebase

    Note over App,Firebase: Email / Password flow
    App->>API: POST /auth/register {email, password, user_type}
    API->>DB: create user (argon2id hash)
    API->>App: 201 — sends verification email
    App->>API: POST /auth/verify-email {token}
    API->>DB: SHA-256 token match → is_verified=true
    App->>API: POST /auth/login {username, password}
    API->>DB: fetch user, verify argon2id/bcrypt
    API->>App: {access_token, token_type}

    Note over App,Firebase: Firebase Google Sign-in flow
    App->>Firebase: Google sign-in (client SDK)
    Firebase->>App: Firebase ID token
    App->>API: POST /auth/firebase {id_token, user_type}
    API->>Firebase: verify_id_token()
    Firebase->>API: {uid, email, name}
    API->>DB: upsert user (firebase_uid, is_verified=true)
    API->>App: {access_token, token_type}
```

---

## Payment Flow (Paystack)

```mermaid
sequenceDiagram
    participant App
    participant API
    participant Paystack

    App->>API: POST /employer/purchase {package_id}
    API->>Paystack: POST /transaction/initialize
    Paystack->>API: {authorization_url, reference}
    API->>App: {authorization_url, reference}

    App->>Paystack: Open authorization_url (WebView)
    Paystack->>App: Redirect on completion

    App->>API: POST /employer/confirm-payment {reference}
    API->>Paystack: GET /transaction/verify/{reference}
    Paystack->>API: {status: success, amount}
    API->>App: credits added

    Note over Paystack,API: Async webhook (backup)
    Paystack->>API: POST /payments/webhook/paystack
    API->>API: HMAC-SHA512 verify signature
    API->>API: charge.success → credit employer/trainer
```

---

## Data Model

```mermaid
erDiagram
    User {
        int id
        string email
        string hashed_password
        string firebase_uid
        enum user_type
        bool is_active
        bool is_verified
    }
    Talent {
        int id
        int user_id
        string first_name
        string last_name
        string bio
        string resume_url
        string profile_image_url
    }
    Employer {
        int id
        int user_id
        string company_name
        int job_credits
    }
    Trainer {
        int id
        int user_id
        string name
        int training_credits
    }
    Job {
        int id
        int employer_id
        string title
        enum status
        date expires_at
    }
    Training {
        int id
        int trainer_id
        string title
        enum status
        date expires_at
    }
    JobApplication {
        int id
        int job_id
        int talent_id
        enum status
    }
    TrainingApplication {
        int id
        int training_id
        int talent_id
        enum status
    }
    SavedJob {
        int id
        int job_id
        int talent_id
    }
    SavedTraining {
        int id
        int training_id
        int talent_id
    }
    Payment {
        int id
        string reference
        enum status
        decimal amount_ngn
    }

    User ||--o| Talent : "has"
    User ||--o| Employer : "has"
    User ||--o| Trainer : "has"
    Employer ||--o{ Job : "posts"
    Trainer ||--o{ Training : "posts"
    Talent ||--o{ JobApplication : "submits"
    Talent ||--o{ TrainingApplication : "submits"
    Talent ||--o{ SavedJob : "saves"
    Talent ||--o{ SavedTraining : "saves"
    Job ||--o{ JobApplication : "receives"
    Training ||--o{ TrainingApplication : "receives"
    Employer ||--o{ Payment : "makes"
    Trainer ||--o{ Payment : "makes"
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Framework | FastAPI + Uvicorn |
| Database | PostgreSQL 16, SQLAlchemy 2.x, Alembic |
| Auth | PyJWT (HS256), Argon2id, Firebase Admin SDK |
| Storage | Cloudflare R2 (boto3 S3-compatible) |
| Email | Resend SDK |
| Payments | Paystack (NGN) |
| Rate limiting | slowapi (200 req/min) |
| File validation | Built-in file signature checks, Pillow (EXIF strip) |
| Testing | pytest + pytest-asyncio + httpx |

---

## Quick start (Docker)

```bash
cp .env.example .env   # fill in secrets
docker-compose up --build
```

API at `http://localhost:8000` — interactive docs at `/docs`.

---

## Local development

**Prerequisites**: Python 3.11+, PostgreSQL 16, `libmagic` (`brew install libmagic` on macOS)

```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

---

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET_KEY` | Yes | ≥32 chars, not a known-weak value |
| `JWT_ALGORITHM` | No | Default `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default `30` |
| `RESEND_API_KEY` | Yes (prod) | Resend transactional email key |
| `FROM_EMAIL` | No | Default `no-reply@climbr.com` |
| `FROM_NAME` | No | Default `Climbr` |
| `ADMIN_EMAIL` | No | Contact-form notification recipient |
| `R2_ACCOUNT_ID` | Yes (uploads) | Cloudflare account ID |
| `R2_ACCESS_KEY_ID` | Yes (uploads) | R2 access key |
| `R2_SECRET_ACCESS_KEY` | Yes (uploads) | R2 secret key |
| `R2_BUCKET_NAME` | Yes (uploads) | R2 bucket |
| `R2_PUBLIC_URL` | Yes (uploads) | Public base URL for uploaded files |
| `PAYSTACK_SECRET_KEY` | Yes (payments) | Paystack secret key |
| `PAYSTACK_WEBHOOK_SECRET` | Yes (payments) | Paystack webhook signing secret |
| `FIREBASE_CREDENTIALS_JSON` | Yes (Google sign-in) | Service account JSON string |
| `ENVIRONMENT` | No | `development` or `production` |
| `ADMIN_PASSWORD` | Yes (prod) | Admin account bootstrap password |

No defaults for secrets — missing required vars cause a fast-fail on startup.

---

## Tests

```bash
python -m pytest tests/ -v
```

39 tests, 0 failures. All external services (R2, Resend, Paystack, Firebase) are mocked.

---

## API reference

See [MOBILE_API_CONTRACT.md](MOBILE_API_CONTRACT.md) for the complete endpoint reference.

| Prefix | Auth | Description |
|--------|------|-------------|
| `/auth` | Mixed | Login, register, Firebase sign-in, email verify, password reset |
| `/jobs` | Public | Browse and filter jobs |
| `/trainings` | Public | Browse and filter trainings |
| `/talent/*` | talent JWT | Profile, applications, saved jobs/trainings, dashboard |
| `/employer/*` | employer JWT | Post jobs, manage applicants, Paystack credits |
| `/trainer/*` | trainer JWT | Post trainings, manage applicants, Paystack credits |
| `/payments/webhook/paystack` | Paystack sig | Webhook receiver (do not call from app) |
| `/contact` | Public | Contact form |
| `/health`, `/version` | Public | Health check, version |

---

## Database migrations

```bash
alembic upgrade head          # apply all
alembic downgrade -1          # roll back one
alembic revision --autogenerate -m "description"   # new migration
```

Migrations live in `alembic/versions/` (linear chain f001–f008).

---

## Project structure

```
app/
├── main.py              # App factory, middleware, rate limiter
├── config.py            # pydantic-settings, fast-fail on missing secrets
├── database.py          # SQLAlchemy engine + session
├── dependencies/auth.py # JWT decode, get_current_user
├── models/              # SQLAlchemy ORM + Pydantic schemas
├── repositories/        # BaseRepository[T] + 15 typed repos
├── routers/             # auth · talent · employer · trainer · admin · public · payments
└── services/            # auth · storage · email · payment · firebase · verification · contact
alembic/versions/        # f001–f008 migrations
tests/                   # 39 tests (pytest + httpx, all services mocked)
docker-compose.yml
MOBILE_API_CONTRACT.md
PROGRESS.md
openapi.json
```
