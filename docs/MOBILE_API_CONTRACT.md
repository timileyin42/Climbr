# Climbr Mobile API Contract

Base URL: `https://api.climbr.com` (production) / `http://localhost:8000` (dev)

All authenticated endpoints require `Authorization: Bearer <jwt_token>` header.

All list responses include a `pagination` object:
```json
{ "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 } }
```

---

## System

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | No | Welcome message |
| GET | `/health` | No | `{"status": "ok", "environment": "..."}` |
| GET | `/version` | No | `{"version": "1.0.0", "api": "Climbr API"}` |

---

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | No | Email/password login → JWT |
| POST | `/auth/register` | No | Register new account |
| POST | `/auth/firebase` | No | Firebase ID token sign-in/signup |
| POST | `/auth/verify-email` | No | Verify email with token |
| POST | `/auth/resend-verification` | No | Resend verification email |
| POST | `/auth/forgot-password` | No | Send password-reset email |
| POST | `/auth/reset-password` | No | Reset password with token |
| GET | `/auth/me` | Yes | Current user base profile |

### POST `/auth/login`
```json
// Request (form-data): username, password
// Response:
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### POST `/auth/firebase`
```json
// Request:
{ "id_token": "<firebase-id-token>", "user_type": "talent" }
// Response:
{ "access_token": "eyJ...", "token_type": "bearer" }
```

### GET `/auth/me`
```json
{
  "id": 1,
  "email": "user@example.com",
  "user_type": "talent",
  "is_active": true,
  "is_verified": true,
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## Public — Jobs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/jobs` | No | List active jobs (paginated, filterable) |
| GET | `/jobs/{id}` | No | Job detail |
| GET | `/jobs/recommended` | No | AI-scored recommendations (optional talent_id) |

### GET `/jobs` query params
- `page`, `limit` (default 1, 20)
- `search` (title/description text search)
- `location`, `job_type`, `industry`, `experience_level`
- `salary_min`, `salary_max`

---

## Public — Trainings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/trainings` | No | List active trainings (paginated) |
| GET | `/trainings/{id}` | No | Training detail |
| GET | `/trainings/recommended` | No | Recommended trainings (optional talent_id) |

---

## Talent

All `/talent/*` endpoints require `user_type=talent` JWT.

### Profile
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/profile` | Full profile with sub-entities |
| PUT | `/talent/profile` | Update basic info |
| POST | `/talent/profile/image/upload` | Upload profile photo (multipart) |
| POST | `/talent/profile/resume` | Upload resume PDF/DOCX |

### Profile sub-entities (Education, Work, Skills, etc.)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/talent/profile/education` | Add education entry |
| PUT | `/talent/profile/education/{id}` | Update |
| DELETE | `/talent/profile/education/{id}` | Delete |
| POST | `/talent/profile/work-experience` | Add work experience |
| PUT | `/talent/profile/work-experience/{id}` | Update |
| DELETE | `/talent/profile/work-experience/{id}` | Delete |
| POST | `/talent/profile/skills` | Add skills |
| DELETE | `/talent/profile/skills/{id}` | Remove skill |
| POST | `/talent/profile/languages` | Add language |
| DELETE | `/talent/profile/languages/{id}` | Remove |
| POST | `/talent/profile/certificates` | Add certificate |
| PUT | `/talent/profile/certificates/{id}` | Update |
| DELETE | `/talent/profile/certificates/{id}` | Delete |
| POST | `/talent/profile/certificates/{id}/upload` | Upload certificate file |

### Job Applications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/applications/jobs` | My job applications |
| DELETE | `/talent/applications/jobs/{id}` | Withdraw application |

### Training Applications
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/applications/trainings` | My training applications |
| DELETE | `/talent/applications/trainings/{id}` | Withdraw |

### Saved Jobs (swipe/bookmark)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/saved-jobs` | List saved jobs |
| POST | `/talent/saved-jobs/{job_id}` | Save a job (idempotent) |
| DELETE | `/talent/saved-jobs/{job_id}` | Unsave a job |

### Saved Trainings (swipe/bookmark)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/saved-trainings` | List saved trainings |
| POST | `/talent/saved-trainings/{training_id}` | Save a training |
| DELETE | `/talent/saved-trainings/{training_id}` | Unsave |

### Dashboard
| Method | Path | Description |
|--------|------|-------------|
| GET | `/talent/dashboard` | Stats: applications, saved, profile completion |

---

## Employer

All `/employer/*` require `user_type=employer` JWT.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/employer/info` | Pricing packages |
| POST | `/employer/purchase` | Init Paystack payment for job credits |
| POST | `/employer/confirm-payment` | Verify payment by reference |
| GET | `/employer/credits` | Current job credits |
| POST | `/employer/jobs` | Create job posting (costs 1 credit) |
| GET | `/employer/jobs` | List my jobs |
| GET | `/employer/jobs/{id}` | Job detail |
| PUT | `/employer/jobs/{id}` | Update job |
| POST | `/employer/jobs/{id}/renew` | Renew for 30 more days (1 credit) |
| POST | `/employer/jobs/{id}/image` | Upload job image |
| GET | `/employer/jobs/{id}/applicants` | Paginated applicant list |
| POST | `/employer/jobs/{id}/applicants/{aid}/accept` | Accept applicant |
| POST | `/employer/jobs/{id}/applicants/{aid}/shortlist` | Shortlist |
| POST | `/employer/jobs/{id}/applicants/{aid}/reject` | Reject |

### Purchase flow (Paystack)
1. `POST /employer/purchase` with `{"package_id": 1}` → get `authorization_url` + `reference`
2. Redirect user to `authorization_url` in WebView
3. On return, `POST /employer/confirm-payment` with `{"reference": "climbr_xxx"}` → credits added

---

## Trainer

All `/trainer/*` require `user_type=trainer` JWT. Same structure as Employer for purchase/confirm/credits.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/trainer/info` | Training pricing packages |
| POST | `/trainer/purchase` | Init Paystack payment |
| POST | `/trainer/confirm-payment` | Verify + credit |
| GET | `/trainer/credits` | Current training credits |
| POST | `/trainer/trainings` | Create training (1 credit) |
| GET | `/trainer/trainings` | List my trainings |
| GET | `/trainer/trainings/{id}` | Detail |
| PUT | `/trainer/trainings/{id}` | Update |
| POST | `/trainer/trainings/{id}/renew` | Renew (1 credit) |
| POST | `/trainer/trainings/{id}/image` | Upload image |
| GET | `/trainer/trainings/{id}/applicants` | Applicants list |
| POST | `/trainer/trainings/{id}/applicants/{aid}/accept` | Accept |
| POST | `/trainer/trainings/{id}/applicants/{aid}/shortlist` | Shortlist |
| POST | `/trainer/trainings/{id}/applicants/{aid}/reject` | Reject |

---

## Payments (webhooks)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/payments/webhook/paystack` | Paystack signature | Webhook receiver — do not call from app |

---

## Contact

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/contact` | No | Submit contact form |

Request: `{"name": "...", "email": "...", "message": "..."}`

---

## Caching

All `GET` responses include an `ETag` header.
Send `If-None-Match: "<etag>"` to receive `304 Not Modified` when content is unchanged.

---

## Error responses

All errors follow:
```json
{ "detail": "Human-readable error message" }
```

Unhandled server errors include `request_id` for support tracing:
```json
{ "detail": "An unexpected error occurred.", "request_id": "uuid-here" }
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request / validation error |
| 401 | Missing or invalid JWT |
| 403 | Forbidden (wrong user type or unverified email) |
| 404 | Resource not found |
| 413 | File too large |
| 415 | Unsupported media type (file upload) |
| 422 | Request body validation error |
| 429 | Rate limit exceeded (200 req/min) |
| 500 | Internal server error |
