# iRxcruit Backend — Complete Codebase Audit

**Audit Date:** 2026-05-24  
**Auditor:** Automated full-codebase review  
**Scope:** All Python source files, migrations, tests, and configuration

---

## Section 1: Router & Endpoint Inventory

### Public Router (`app/routers/public.py`) — prefix: none, tags: `public`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| GET | `/` | No | None | Homepage welcome message |
| GET | `/jobs` | No | None | List active jobs with filters and pagination |
| GET | `/jobs/{job_id}` | No | None | Get specific job details |
| GET | `/jobs/recommended` | No | None | Get recommended (latest active) jobs |
| GET | `/trainings` | No | None | List active trainings with filters and pagination |
| GET | `/trainings/{training_id}` | No | None | Get specific training details |
| GET | `/trainings/recommended` | No | None | Get recommended (latest active) trainings |
| POST | `/contact` | No | None | Submit contact form |

### Auth Router (`app/routers/auth.py`) — prefix: `/auth`, tags: `auth`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| POST | `/auth/login` | No | None | Authenticate with email + password, returns JWT |
| POST | `/auth/register` | No | None | Register new user (talent, employer, or trainer) |
| POST | `/auth/verify-email` | No | None | Verify email using token from email link |
| POST | `/auth/resend-verification` | No | None | Resend email verification link |
| POST | `/auth/forgot-password` | No | None | Request password reset email |
| POST | `/auth/reset-password` | No | None | Reset password using token |
| GET | `/auth/google/login` | No | None | Get Google OAuth authorization URL |
| GET | `/auth/google/callback` | No | None | Handle Google OAuth callback and authenticate |

### Talent Router (`app/routers/talent.py`) — prefix: `/talent`, tags: `talent`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| POST | `/talent/signup` | No | None | **STUB** — returns dummy message, no DB ops |
| POST | `/talent/login` | No | None | **STUB** — returns hardcoded dummy token |
| GET | `/talent/profile` | Yes | talent | Get full talent profile with all sub-entities |
| PUT | `/talent/profile` | Yes | talent | Update talent profile basic fields and skills (first definition at line 72 is incomplete stub) |
| PUT | `/talent/profile` | Yes | talent | **DUPLICATE ROUTE** second definition at line 198 — the actual implementation |
| GET | `/talent/profile/skills` | Yes | talent | Get skills for current talent |
| GET | `/talent/skills` | Yes | talent | **DUPLICATE ROUTE** — first definition at line 92 (requires auth), second at line 161 (no auth required by dependency list) |
| GET | `/talent/skills` | No (by design) | None | Get all available skills with search/filter |
| POST | `/talent/profile/skills` | Yes | talent | Create/add a skill to talent |
| DELETE | `/talent/profile/skills/{skill_id}` | Yes | talent | Remove a skill from talent |
| PUT | `/talent/profile/skills` | Yes | talent | Replace all skills for talent (bulk update) |
| GET | `/talent/skills/by-category` | No | None | Get skills grouped by category |
| GET | `/talent/skills/categories` | No | None | Get list of unique skill categories |
| GET | `/talent/profile/education` | Yes | talent | List education entries |
| POST | `/talent/profile/education` | Yes | talent | Add education entry |
| GET | `/talent/profile/education/{id}` | Yes | talent | Get specific education entry |
| PUT | `/talent/profile/education/{id}` | Yes | talent | Update education entry |
| DELETE | `/talent/profile/education/{id}` | Yes | talent | Delete education entry |
| GET | `/talent/profile/certificates` | Yes | talent | List certificate entries |
| POST | `/talent/profile/certificates` | Yes | talent | Add certificate entry |
| GET | `/talent/profile/certificates/{id}` | Yes | talent | Get specific certificate entry |
| PUT | `/talent/profile/certificates/{id}` | Yes | talent | Update certificate entry |
| DELETE | `/talent/profile/certificates/{id}` | Yes | talent | Delete certificate entry |
| POST | `/talent/profile/certificates/{id}/upload` | Yes | talent | Upload certificate file to S3 |
| GET | `/talent/profile/work-experience` | Yes | talent | List work experience entries |
| POST | `/talent/profile/work-experience` | Yes | talent | Add work experience entry |
| GET | `/talent/profile/work-experience/{id}` | Yes | talent | Get specific work experience entry |
| PUT | `/talent/profile/work-experience/{id}` | Yes | talent | Update work experience entry |
| DELETE | `/talent/profile/work-experience/{id}` | Yes | talent | Delete work experience entry |
| GET | `/talent/profile/hobbies` | Yes | talent | List hobby entries |
| POST | `/talent/profile/hobbies` | Yes | talent | Add hobby entry |
| GET | `/talent/profile/hobbies/{id}` | Yes | talent | Get specific hobby entry |
| PUT | `/talent/profile/hobbies/{id}` | Yes | talent | Update hobby entry |
| DELETE | `/talent/profile/hobbies/{id}` | Yes | talent | Delete hobby entry |
| GET | `/talent/profile/languages` | Yes | talent | List language entries |
| POST | `/talent/profile/languages` | Yes | talent | Add language entry |
| GET | `/talent/profile/languages/{id}` | Yes | talent | Get specific language entry |
| PUT | `/talent/profile/languages/{id}` | Yes | talent | Update language entry |
| DELETE | `/talent/profile/languages/{id}` | Yes | talent | Delete language entry |
| POST | `/talent/profile/resume` | Yes | talent | Upload resume to S3 |
| POST | `/talent/profile/image/upload` | Yes | talent | Upload profile image to S3 |
| DELETE | `/talent/profile/image` | Yes | talent | Delete profile image from S3 |
| POST | `/talent/jobs/{job_id}/apply` | Yes | talent | Apply to a job |
| POST | `/talent/trainings/{training_id}/apply` | Yes | talent | Apply to a training |
| GET | `/talent/applications` | Yes | talent | Get all applications (jobs + trainings) with stats |
| GET | `/talent/applications/jobs` | Yes | talent | Get job applications (N+1 query pattern) |
| GET | `/talent/applications/trainings` | Yes | talent | Get training applications (N+1 query pattern) |
| DELETE | `/talent/applications/jobs/{id}` | Yes | talent | Withdraw a job application |
| DELETE | `/talent/applications/trainings/{id}` | Yes | talent | Withdraw a training application |
| GET | `/talent/saved-jobs` | Yes | talent | Get saved jobs |
| POST | `/talent/saved-jobs/{job_id}` | Yes | talent | Save a job |
| DELETE | `/talent/saved-jobs/{saved_job_id}` | Yes | talent | Remove a saved job |
| GET | `/talent/dashboard` | Yes | talent | Get dashboard statistics and featured jobs |
| PUT | `/talent/settings/profile` | Yes | talent | Update profile settings (name, email, phone, bio) |
| PUT | `/talent/settings/security/password` | Yes | talent | Change password |
| GET | `/talent/settings/notifications` | Yes | talent | Get notification preferences |
| PUT | `/talent/settings/notifications` | Yes | talent | Update notification preferences |

### Employer Router (`app/routers/employer.py`) — prefix: `/employer`, tags: `employer`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| GET | `/employer/info` | No | None | Get employer benefits and pricing info |
| POST | `/employer/signup` | No | None | **STUB** — returns dummy message, no DB ops |
| POST | `/employer/login` | No | None | **STUB** — returns hardcoded dummy token |
| POST | `/employer/purchase` | Yes | employer | Create Stripe payment intent for job credits |
| POST | `/employer/confirm-payment` | Yes | employer | Confirm payment and credit employer account |
| GET | `/employer/credits` | Yes | employer | Get current job posting credit balance |
| POST | `/employer/jobs` | Yes | employer | Create job posting (costs 1 credit) |
| POST | `/employer/jobs/{job_id}/image` | Yes | employer | **BROKEN** — references `current_user` which is not in scope |
| GET | `/employer/jobs` | Yes | employer | List all jobs by this employer |
| GET | `/employer/jobs/{job_id}` | Yes | employer | Get specific job by employer |
| PUT | `/employer/jobs/{job_id}` | Yes | employer | Update job posting |
| GET | `/employer/jobs/{job_id}/applicants` | Yes | employer | Get applicants for a job |
| POST | `/employer/jobs/{job_id}/applicants/{id}/accept` | Yes | employer | Accept applicant (sets SHORTLISTED, not ACCEPTED) |
| POST | `/employer/jobs/{job_id}/applicants/{id}/reject` | Yes | employer | Reject applicant |
| POST | `/employer/jobs/{job_id}/renew` | Yes | employer | Renew job posting for 30 more days |

### Trainer Router (`app/routers/trainer.py`) — prefix: `/trainer`, tags: `trainer`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| GET | `/trainer/info` | No | None | Get trainer benefits and pricing info |
| POST | `/trainer/signup` | No | None | **STUB** — returns dummy message, no DB ops |
| POST | `/trainer/login` | No | None | **STUB** — returns hardcoded dummy token |
| POST | `/trainer/purchase` | Yes | trainer | Create Stripe payment intent for training credits |
| POST | `/trainer/confirm-payment` | Yes | trainer | Confirm payment and credit trainer account |
| GET | `/trainer/credits` | Yes | trainer | Get current training posting credit balance |
| POST | `/trainer/trainings` | Yes | trainer | Create training posting (costs 1 credit) |
| POST | `/trainer/trainings/{id}/image` | Yes | trainer | Upload training image to S3 |
| GET | `/trainer/trainings` | Yes | trainer | List all trainings by this trainer |
| GET | `/trainer/trainings/{id}` | Yes | trainer | Get specific training by trainer |
| PUT | `/trainer/trainings/{id}` | Yes | trainer | Update training posting |
| GET | `/trainer/trainings/{id}/applicants` | Yes | trainer | Get applicants for a training |
| POST | `/trainer/trainings/{id}/applicants/{id}/accept` | Yes | trainer | Accept applicant (sets SHORTLISTED, not ACCEPTED) |
| POST | `/trainer/trainings/{id}/applicants/{id}/reject` | Yes | trainer | Reject applicant |
| POST | `/trainer/trainings/{id}/renew` | Yes | trainer | Renew training posting for 30 more days |

### Admin Router (`app/routers/admin.py`) — prefix: `/admin`, tags: `admin`

| Method | Path | Auth Required | Role Required | Description |
|--------|------|--------------|---------------|-------------|
| POST | `/admin/login` | No | None | Admin login endpoint |
| POST | `/admin/admins` | Yes | admin | Create new admin user |
| GET | `/admin/admins` | Yes | admin | List all admin users |
| GET | `/admin/dashboard` | Yes | admin | Dashboard overview statistics |
| GET | `/admin/talents` | Yes | admin | List talents with filters |
| PUT | `/admin/talents/{id}/disable` | Yes | admin | Disable a talent account |
| DELETE | `/admin/talents/{id}` | Yes | admin | Delete a talent account |
| GET | `/admin/employers` | Yes | admin | List employers with filters |
| POST | `/admin/employers` | Yes | admin | Create employer account |
| PUT | `/admin/employers/{id}/disable` | Yes | admin | Disable an employer account |
| DELETE | `/admin/employers/{id}` | Yes | admin | Delete an employer account |
| GET | `/admin/trainers` | Yes | admin | List trainers with filters |
| POST | `/admin/trainers` | Yes | admin | Create trainer account |
| PUT | `/admin/trainers/{id}/disable` | Yes | admin | Disable a trainer account |
| DELETE | `/admin/trainers/{id}` | Yes | admin | Delete a trainer account |
| GET | `/admin/jobs` | Yes | admin | List all jobs with filters |
| PUT | `/admin/jobs/{id}/unpublish` | Yes | admin | Unpublish (archive) a job |
| DELETE | `/admin/jobs/{id}` | Yes | admin | Delete a job |
| GET | `/admin/trainings` | Yes | admin | List all trainings with filters |
| PUT | `/admin/trainings/{id}/unpublish` | Yes | admin | Unpublish (archive) a training |
| DELETE | `/admin/trainings/{id}` | Yes | admin | Delete a training |
| GET | `/admin/payments` | Yes | admin | List all payments |
| PUT | `/admin/pricing/jobs` | Yes | admin | Update job pricing package |
| PUT | `/admin/pricing/trainings` | Yes | admin | Update training pricing package |
| GET | `/admin/reports/talents` | Yes | admin | Export talents CSV/report |
| GET | `/admin/reports/employers` | Yes | admin | Export employers CSV/report |
| GET | `/admin/reports/trainers` | Yes | admin | Export trainers CSV/report |
| GET | `/admin/reports/jobs` | Yes | admin | Export jobs CSV/report |
| GET | `/admin/reports/trainings` | Yes | admin | Export trainings CSV/report |
| GET | `/admin/reports/payments` | Yes | admin | Export payments CSV/report |

---

## Section 2: SQLAlchemy Model Inventory

All models are defined in `app/models/database_models.py`.

### Association Tables (many-to-many)

| Table | Columns | Notes |
|-------|---------|-------|
| `talent_skills` | `talent_id → talents.id`, `skill_id → skills.id` | No primary key, no unique constraint on pair |
| `job_skills` | `job_id → jobs.id`, `skill_id → skills.id` | No primary key, no unique constraint on pair |
| `training_skills` | `training_id → trainings.id`, `skill_id → skills.id` | No primary key, no unique constraint on pair |

### Enum Types

| Enum | Values |
|------|--------|
| `UserType` | `talent`, `employer`, `trainer`, `admin` |
| `JobType` | `full_time`, `part_time`, `contract`, `internship`, `apprenticeship` |
| `JobStatus` | `active`, `archived`, `draft`, `unpublished` |
| `TrainingStatus` | `active`, `archived`, `draft`, `unpublished` |
| `DeliveryMethod` | `online`, `in_person`, `hybrid` |
| `ApplicationStatus` | `pending`, `in_review`, `shortlisted`, `accepted`, `rejected`, `withdrawn` |

### `users` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `email` | String | unique, index | |
| `hashed_password` | String | nullable | Nullable — OAuth users may have random password |
| `user_type` | Enum(UserType) | | |
| `is_active` | Boolean | default=True | |
| `is_verified` | Boolean | default=False | |
| `verification_token` | String | nullable | Plain string token stored in DB |
| `verification_token_expires` | DateTime | nullable | |
| `password_reset_token` | String | nullable | Plain string token stored in DB |
| `password_reset_expires` | DateTime | nullable | |
| `google_id` | String | nullable, unique | |
| `created_at` | DateTime(tz) | server_default=now | |
| `updated_at` | DateTime(tz) | onupdate=now | |

Relationships: `talent` (1:1), `employer` (1:1), `trainer` (1:1), `admin` (1:1), `notification_settings` (1:1)

### `talents` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `user_id` | Integer | FK → users.id | Not unique-constrained |
| `first_name` | String | | |
| `last_name` | String | | |
| `phone` | String | | |
| `date_of_birth` | DateTime | | |
| `bio` | Text | | |
| `location` | String | | |
| `student_id` | String | nullable | |
| `resume_url` | String | nullable | |
| `profile_image_url` | String | nullable | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

Relationships: `user`, `skills` (M2M), `job_applications`, `training_applications`, `education`, `certificates`, `work_experiences`, `hobbies`, `languages`, `saved_jobs`

### `employers` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `user_id` | Integer | FK → users.id | Not unique-constrained |
| `company_name` | String | | |
| `contact_name` | String | | |
| `phone` | String | | |
| `website` | String | nullable | |
| `industry` | String | | |
| `company_size` | String | nullable | |
| `logo_url` | String | nullable | |
| `description` | Text | nullable | |
| `location` | String | | |
| `is_verified` | Boolean | default=False | |
| `job_credits` | Integer | default=0 | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

Relationships: `user`, `jobs`, `payments`

**Migration drift:** `job_credits` column is in the ORM model but **not present in any migration file**. The initial migration for `employers` does not include this column.

### `trainers` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `user_id` | Integer | FK → users.id | Not unique-constrained |
| `provider_name` | String | | |
| `contact_name` | String | | |
| `phone` | String | | |
| `website` | String | nullable | |
| `industry` | String | | |
| `logo_url` | String | nullable | |
| `description` | Text | nullable | |
| `location` | String | | |
| `is_verified` | Boolean | default=False | |
| `training_credits` | Integer | default=0 | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

Relationships: `user`, `trainings`, `payments`

**Migration drift:** `training_credits` column is in the ORM model but **not present in any migration file**.

### `admins` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `user_id` | Integer | FK → users.id | |
| `first_name` | String | | |
| `last_name` | String | | |
| `role` | String | default="admin" | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

Relationships: `user`

### `jobs` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `employer_id` | Integer | FK → employers.id | |
| `title` | String | | |
| `description` | Text | | |
| `industry` | String | | Added in migration dc9ccc04ae01 |
| `location` | String | | |
| `salary_min` | Float | nullable | |
| `salary_max` | Float | nullable | |
| `job_type` | Enum(JobType) | | |
| `experience_level` | String | nullable | Added in migration dc9ccc04ae01 |
| `company_size` | String | nullable | Added in migration dc9ccc04ae01 |
| `status` | Enum(JobStatus) | default=ACTIVE | |
| `expiry_date` | DateTime | default=now+30d | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |
| `image_url` | String | nullable | |
| `highlights` | Text | nullable | JSON string; no schema enforcement |

Relationships: `employer`, `skills` (M2M), `applications`

### `job_applications` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `job_id` | Integer | FK → jobs.id | |
| `talent_id` | Integer | FK → talents.id | |
| `cover_letter` | Text | nullable | |
| `status` | Enum(ApplicationStatus) | default=PENDING | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

**Missing constraint:** No unique constraint on `(job_id, talent_id)` pair — duplicate applications can theoretically occur despite application-level checks.

### `trainings` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `trainer_id` | Integer | FK → trainers.id | |
| `title` | String | | |
| `description` | Text | | |
| `category` | String | nullable | Added in migration add_training_fields |
| `location` | String | nullable | |
| `cost` | Float | nullable | |
| `start_date` | DateTime | | |
| `end_date` | DateTime | nullable | |
| `delivery_method` | Enum(DeliveryMethod) | | |
| `status` | Enum(TrainingStatus) | default=ACTIVE | |
| `expiry_date` | DateTime | default=now+30d | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |
| `image_url` | String | nullable | |
| `highlights` | Text | nullable | JSON string; no schema enforcement |

Relationships: `trainer`, `skills` (M2M), `applications`

### `training_applications` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `training_id` | Integer | FK → trainings.id | |
| `talent_id` | Integer | FK → talents.id | |
| `motivation` | Text | nullable | |
| `status` | Enum(ApplicationStatus) | default=PENDING | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

**Missing constraint:** No unique constraint on `(training_id, talent_id)` pair.

### `saved_jobs` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `job_id` | Integer | FK → jobs.id | |
| `talent_id` | Integer | FK → talents.id | |
| `created_at` | DateTime(tz) | server_default | |

**Missing constraint:** No unique constraint on `(job_id, talent_id)` pair.

### `payments` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `employer_id` | Integer | FK → employers.id, nullable | |
| `trainer_id` | Integer | FK → trainers.id, nullable | |
| `amount` | Float | | |
| `currency` | String | default="GBP" | |
| `payment_method` | String | | |
| `transaction_id` | String | unique | |
| `status` | String | | Free-text; no enum validation |
| `package_name` | String | | |
| `package_quantity` | Integer | | |
| `created_at` | DateTime(tz) | server_default | |

**Design flaw:** `status` is a plain String column with no enum constraint; valid values are undocumented. `payment_id` field referenced in admin router does not match the model's column name `transaction_id`.

### `job_pricing` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `name` | String | | |
| `quantity` | Integer | | |
| `price` | Float | | |
| `currency` | String | default="GBP" | |
| `is_active` | Boolean | default=True | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

### `training_pricing` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `name` | String | | |
| `quantity` | Integer | | |
| `price` | Float | | |
| `currency` | String | default="GBP" | |
| `is_active` | Boolean | default=True | |
| `created_at` | DateTime(tz) | server_default | |
| `updated_at` | DateTime(tz) | onupdate | |

### `contact_submissions` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `name` | String | | |
| `email` | String | | No format validation at DB level |
| `message` | Text | | |
| `is_read` | Boolean | default=False | |
| `created_at` | DateTime(tz) | server_default | |

### `education` Table

| Column | Type | Constraints | Notes |
|--------|------|------------|-------|
| `id` | Integer | PK, index | |
| `talent_id` | Integer | FK → talents.id | |
| `institution` | String | | |
| `degree` | String | | |
| `field_of_study` | String | nullable | |
| `start_date` | DateTime | nullable | |
| `end_date` | DateTime | nullable | |
| `is_current` | Boolean | default=False | |
| `description` | Text | nullable | |
| `created_at` / `updated_at` | DateTime(tz) | server_default / onupdate | |

### `certificates`, `work_experiences`, `hobbies`, `languages` Tables

All follow the same pattern: `id`, `talent_id` (FK), category-specific columns, `created_at`, `updated_at`. No notable additional constraints.

### `skills` Table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | Integer | PK, index |
| `name` | String | unique, index |
| `category` | String | nullable |
| `created_at` | DateTime(tz) | server_default |

### `notification_settings` Table

| Column | Type | Constraints |
|--------|------|------------|
| `id` | Integer | PK, index |
| `user_id` | Integer | FK → users.id, unique |
| 10 Boolean columns | Boolean | job/training/application/reminder/system × in_app+email |
| `created_at` / `updated_at` | DateTime(tz) | |

---

## Section 3: Service Module Inventory

### `app/services/auth.py` — `AuthService` (static class)

| Function | Description |
|----------|-------------|
| `verify_password(plain, hashed)` | Verifies bcrypt password hash |
| `get_password_hash(password)` | Hashes a plaintext password with bcrypt |
| `get_user_by_email(db, email)` | Looks up a User by email |
| `authenticate_user(db, email, password)` | Authenticates email+password, returns User or None |
| `create_user_token(user)` | Creates JWT access token dict for a user |
| `create_talent(db, email, password, data)` | Creates User + Talent records |
| `create_employer(db, email, password, data)` | Creates User + Employer records |
| `create_trainer(db, email, password, data)` | Creates User + Trainer records |
| `create_admin(db, email, password, data)` | Creates User + Admin records |

**Note:** `create_user()` method is referenced in `admin.py` (line 351 and 497) but **does not exist** in `AuthService`.

### `app/services/user.py` — `UserService` (static class)

| Function | Description |
|----------|-------------|
| `get_skills / get_skill_by_id / get_all_skills / get_skills_by_category / get_skill_categories` | Skill lookup and filtering |
| `create_skill(db, skill_data)` | Create or return existing skill by name |
| `add_skill_to_talent / remove_skill_from_talent / update_talent_skills` | Manage talent–skill associations |
| `get_education_entries / get_education_by_id / create_education / update_education / delete_education` | CRUD for education entries |
| `get_certificates / get_certificate_by_id / create_certificate / update_certificate / delete_certificate` | CRUD for certificate entries |
| `get_work_experiences / get_work_experience_by_id / create_work_experience / update_work_experience / delete_work_experience` | CRUD for work experience entries |
| `get_hobbies / get_hobby_by_id / create_hobby / update_hobby / delete_hobby` | CRUD for hobby entries |
| `get_languages / get_language_by_id / create_language / update_language / delete_language` | CRUD for language entries |
| `get_talents / get_talent_by_id / get_talent_by_email / update_talent / disable_talent / delete_talent` | Talent management |
| `get_employers / get_employer_by_id / get_employer_by_email / update_employer / disable_employer / delete_employer` | Employer management |
| `get_trainers / get_trainer_by_id / get_trainer_by_email / update_trainer / disable_trainer / delete_trainer` | Trainer management |
| `get_user_stats(db)` | Returns counts of each user type |
| `get_saved_jobs / get_saved_job_by_id / create_saved_job / delete_saved_job / is_job_saved` | Saved job management |
| `get_notification_settings / create_default_notification_settings / update_notification_settings / format_notification_settings_response` | Notification preference management |

### `app/services/job.py` — `JobService` (static class)

| Function | Description |
|----------|-------------|
| `get_jobs(db, skip, limit, filters)` | Paginated job list with employer name and applicant count |
| `get_jobs_count(db, filters)` | Total count of jobs matching filters |
| `get_job_by_id(db, job_id)` | Get job with employer info and applicant count |
| `get_job_by_id_simple(db, job_id)` | Get job without additional joins |
| `create_job(db, employer_id, job_data, skill_ids)` | Create a new job posting |
| `update_job(db, job_id, job_data, skill_ids)` | Update a job posting |
| `delete_job(db, job_id)` | Delete a job |
| `apply_to_job(db, job_id, talent_id, data)` | Create job application |
| `get_job_applications(db, job_id, skip, limit)` | Get applications for a job |
| `get_talent_applications(db, talent_id, skip, limit)` | Get applications by a talent |
| `update_application_status(db, application_id, status)` | Update application status |
| `get_employer_jobs(db, employer_id, skip, limit, status)` | Get jobs by employer |
| `archive_expired_jobs(db)` | Archive jobs past expiry date |
| `get_job_stats(db)` | Get job count statistics by status |
| `update_job_status(db, job_id, status)` | **Missing** — called in admin.py but not defined in this service |

### `app/services/training.py` — `TrainingService` (static class)

| Function | Description |
|----------|-------------|
| `get_trainings(db, skip, limit, filters)` | Paginated training list with trainer name and applicant count |
| `get_trainings_count(db, filters)` | Count of trainings matching filters |
| `get_training_by_id(db, training_id)` | Get training with trainer info and applicant count |
| `get_training_by_id_simple(db, training_id)` | Get training without additional joins |
| `create_training(db, trainer_id, data, skill_ids)` | Create a new training posting |
| `update_training(db, training_id, data, skill_ids)` | Update a training posting |
| `delete_training(db, training_id)` | Delete a training |
| `apply_to_training(db, training_id, talent_id, data)` | Create training application |
| `get_training_applications(db, training_id, skip, limit)` | Get applications for a training |
| `get_talent_training_applications(db, talent_id, skip, limit)` | Get training applications by a talent |
| `update_application_status(db, application_id, status)` | Update training application status |
| `get_trainer_trainings(db, trainer_id, skip, limit, status)` | Get trainings by trainer |
| `archive_expired_trainings(db)` | Archive trainings past expiry date |
| `get_training_stats(db)` | Get training count statistics by status |
| `update_training_status(db, training_id, status)` | **Missing** — called in admin.py but not defined in this service |

### `app/services/payment.py` — `PaymentService` (static class)

| Function | Description |
|----------|-------------|
| `create_payment_intent(amount, currency, customer_email, metadata)` | Creates Stripe PaymentIntent |
| `get_payment_status(payment_id)` | Retrieves PaymentIntent status from Stripe |
| `refund_payment(payment_id, amount)` | Refunds a Stripe payment |
| `get_payments(db, skip, limit, filters)` | **Missing** — called in admin.py but not defined |

### `app/services/pricing.py` — `PricingService` (static class)

| Function | Description |
|----------|-------------|
| `get_job_pricing_packages(db, active_only)` | List job pricing packages |
| `get_job_pricing_package_by_id(db, package_id)` | Get one job pricing package by ID |
| `get_job_pricing_by_id(db, pricing_id)` | Duplicate of above with different parameter name |
| `create_job_pricing / update_job_pricing / delete_job_pricing` | Job pricing CRUD |
| `get_training_pricing_packages(db, active_only)` | List training pricing packages |
| `get_training_pricing_package_by_id / get_training_pricing_by_id` | Get training pricing package (two differently-named methods doing the same thing) |
| `create_training_pricing / update_training_pricing / delete_training_pricing` | Training pricing CRUD |

### `app/services/email.py` — `EmailService` (static class)

| Function | Description |
|----------|-------------|
| `send_email(background_tasks, to, subject, template, data)` | Queues email as background task |
| `_send_email_task(to, subject, template, data)` | Sends email via Resend API using httpx |
| `send_welcome_email(background_tasks, to, name)` | Send onboarding welcome email |
| `send_verification_email(to, link)` | Send email verification link (bypasses background_tasks) |
| `send_password_reset_email(to, link)` | Send password reset link (bypasses background_tasks) |
| `send_application_confirmation(background_tasks, to, name, title, is_job)` | Send application submitted confirmation |
| `send_application_status_update(background_tasks, to, name, title, is_job)` | Send application status change notification |

### `app/services/verification.py` — `VerificationService` (static class)

| Function | Description |
|----------|-------------|
| `generate_token()` | Generate a `secrets.token_urlsafe(32)` token |
| `create_verification_token(db, user)` | Store verification token in DB with 24hr expiry |
| `verify_email(db, token)` | Validate token, mark user as verified |
| `send_verification_email(db, user, base_url)` | Create token and send verification email |
| `create_password_reset_token(db, user)` | Store reset token in DB with 1hr expiry |
| `verify_password_reset_token(db, token)` | Validate reset token, return associated user |
| `send_password_reset_email(db, user, base_url)` | Create token and send password reset email |
| `reset_password(db, token, new_password, auth_service)` | Validate token and update hashed password |

**Note:** `send_verification_email` in `auth.py` (router) passes `background_tasks` as third positional arg, but `VerificationService.send_verification_email` signature is `(db, user, base_url)` — the 3-arg form is used correctly. However, `resend_verification_email` endpoint calls `VerificationService.send_verification_email(db, user, base_url)` (3 args, correct), while the register endpoint calls `VerificationService.send_verification_email(db, user, base_url, background_tasks)` (4 args, which will fail at runtime).

### `app/services/storage.py` — `StorageService` (static class)

| Function | Description |
|----------|-------------|
| `get_s3_client()` | Create and return a boto3 S3 client |
| `get_gcs_client()` | Create and return a GCS client |
| `upload_file(file, folder, filename)` | Upload file to S3 or GCS based on config |
| `_upload_to_s3(object_key, content, content_type)` | Upload bytes to S3 |
| `_upload_to_gcs(object_key, content, content_type)` | Upload bytes to GCS (makes blob public) |
| `delete_file(file_url)` | Delete file from S3 or GCS by URL |
| `_delete_from_s3(file_url)` | Delete from S3 by URL parsing |
| `_delete_from_gcs(file_url)` | Delete from GCS by URL parsing |
| `generate_presigned_url(object_key, expiration)` | Generate S3 presigned or GCS signed URL |

### `app/services/oauth.py` — `OAuthService` (static class)

| Function | Description |
|----------|-------------|
| `get_google_auth_url(state)` | Build Google OAuth authorization URL |
| `exchange_code_for_token(code)` | Exchange OAuth code for access token |
| `get_google_user_info(access_token)` | Fetch user profile from Google |
| `authenticate_google_user(db, auth_service, code)` | Authenticate existing user via Google |
| `register_google_user(db, auth_service, code, user_type)` | Register new user via Google (creates User only, no role profile) |

### `app/services/contact.py` — `ContactService` (static class)

| Function | Description |
|----------|-------------|
| `create_contact_submission(db, name, email, message, background_tasks)` | Store contact form and notify admin |
| `get_contact_submissions(db, skip, limit, unread_only)` | List submissions with optional unread filter |
| `get_contact_submission_by_id(db, submission_id)` | Get one submission by ID |
| `mark_as_read(db, submission_id)` | Mark submission as read |
| `delete_contact_submission(db, submission_id)` | Delete a submission |

### `app/services/pricing.py`, `app/services/reporting.py`, `app/services/archiving.py`

Already described above. `ReportingService` methods accept pre-fetched lists as arguments; `ArchivingService` runs scheduled jobs via APScheduler.

### `app/services/circuit_breaker.py` — `StripeCircuitBreaker`

Wraps Stripe API calls with the `circuitbreaker` library. Provides `create_payment_intent`, `retrieve_payment_intent`, `create_customer`, `create_subscription`, and `handle_circuit_open`.

### `app/services/async_email.py` — `AsyncEmailService`

Wrapper using `ThreadPoolExecutor` for background email sending; delegates to `EmailService`. Provides `send_email_async`, `send_verification_email_async`, `send_welcome_email_async`, `send_password_reset_email_async`, `send_application_confirmation_async`, `send_bulk_emails_async`, and `shutdown`.

---

## Section 4: Issues — Incomplete, Broken, Insecure, Inconsistent

### 4.1 Security Vulnerabilities

**SEC-1 — Wildcard CORS in production**
`app/main.py:32` — `allow_origins=["*"]` with `allow_credentials=True`. A wildcard origin cannot be combined with credentials in the CORS spec (browsers will block it), and allowing all origins is inappropriate for a production API. The comment even acknowledges this should be updated.

**SEC-2 — Hardcoded fallback JWT secret**
`app/dependencies/auth.py:20` — `SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key")`. If `JWT_SECRET_KEY` is not set in the environment, the server starts with a trivially guessable key. Any token signed with this key can be forged.

**SEC-3 — Hardcoded admin password fallback**
`app/init_db.py:43-44` — `admin_password = os.getenv("ADMIN_PASSWORD", "adminpassword")`. If the env variable is absent, the admin account is created with the password `adminpassword`.

**SEC-4 — Hardcoded database credentials**
`app/database.py:11` — `DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/irxcruit")`. Hardcoded credentials in source code.

**SEC-5 — Password reset and verification tokens stored as plaintext in DB**
`app/models/database_models.py:80-83` — `verification_token` and `password_reset_token` are stored as plain strings. An attacker with read access to the database can immediately use these tokens. They should be stored as hashes.

**SEC-6 — URL-encoded query parameters for sensitive tokens**
`app/routers/auth.py:93,157` — `token: str` is a query parameter in `verify-email` and `reset-password`. Tokens in URLs are logged by web servers, CDNs, proxies, and browser history. These should be in the request body (POST body).

**SEC-7 — `resend_verification` endpoint leaks user existence**
`app/routers/auth.py:114-115` — Returns HTTP 404 if the email is not found. The `forgot-password` endpoint correctly hides this (lines 143-155), but `resend-verification` does not apply the same treatment.

**SEC-8 — Unguarded admin stub endpoint**
`app/routers/employer.py:50-60` and `app/routers/trainer.py:50-60` — `/employer/signup` and `/trainer/signup`, and `/employer/login` and `/trainer/login` are unauthenticated stubs that return hardcoded `dummy_token` values. They are accessible by any caller and should be removed or disabled.

**SEC-9 — `upload_file` signature mismatch in `talent.py` profile image upload**
`app/routers/talent.py:752-756` — Calls `StorageService.upload_file(file=profile_image, filename=unique_filename, content_type=profile_image.content_type)` with `content_type` as a keyword arg. The `StorageService.upload_file` signature is `(file, folder, filename=None)` — it does not accept a `content_type` argument. This will raise a `TypeError` at runtime.

**SEC-10 — No Stripe webhook signature verification**
Neither `employer.py` nor `trainer.py` implement a webhook endpoint for Stripe events. The confirm-payment endpoints (`/employer/confirm-payment`, `/trainer/confirm-payment`) poll Stripe on the client's request — meaning a client can claim any `payment_intent_id` and the server checks it. There is no protection against a client confirming someone else's payment or a replayed/crafted payment intent ID.

**SEC-11 — Google OAuth state parameter not validated**
`app/routers/auth.py:200-205` — The `state` parameter received in the OAuth callback is parsed but the random token portion is never validated against a stored nonce/session. This leaves the callback vulnerable to CSRF attacks.

**SEC-12 — File upload type validated only by MIME type header (client-controlled)**
`app/routers/talent.py:636-643`, `app/routers/employer.py:222-228` — File type validation uses only `content_type` from the HTTP header, which is client-controlled. A malicious user can upload any file with a spoofed content type.

**SEC-13 — `get_current_user` does not enforce email verification**
`app/dependencies/auth.py:115-155` — The `get_current_user` dependency does not check `is_verified`. Most role-specific endpoints use `get_current_talent/employer/trainer/admin` which in turn use `get_current_user`, so an unverified user who logs in (the login endpoint does block unverified users) can still access resources if their token was obtained before verification was enforced. The `get_current_verified_user` dependency exists but is not used anywhere.

### 4.2 Incomplete Implementations (Stubs)

**INC-1 — `/talent/signup` is a no-op stub**
`app/routers/talent.py:20-24` — Returns `{"message": "Talent account created successfully"}` without any database operations. Registration should be done through `/auth/register`.

**INC-2 — `/talent/login` returns a hardcoded dummy token**
`app/routers/talent.py:26-30` — Returns `{"message": "Login successful", "access_token": "dummy_token"}`. This is a functional security stub that any caller can use to appear logged in (though it will fail JWT validation later).

**INC-3 — `/employer/signup` and `/employer/login` are stubs**
`app/routers/employer.py:50-60` — Same pattern as talent.

**INC-4 — `/trainer/signup` and `/trainer/login` are stubs**
`app/routers/trainer.py:50-60` — Same pattern.

**INC-5 — `PUT /talent/profile` first definition at line 72 is empty**
`app/routers/talent.py:72-78` — The first `update_profile` function body ends after `talent_id = current_talent.id` with no `return` statement. FastAPI returns `null` (HTTP 200). The actual implementation begins at line 198 as a duplicate route name. FastAPI will use the last definition for routing, but the presence of two `@router.put("/profile")` decorators is likely to cause confusion with OpenAPI spec generation.

**INC-6 — Resume upload does not update the database**
`app/routers/talent.py:658-662` — After uploading to S3, the code has a commented-out block that would update `talent.resume_url` in the database. The URL is never persisted.

**INC-7 — `ReportingService` methods take pre-fetched lists, but admin router calls them with DB + keyword args**
`app/routers/admin.py:910-916` — The admin calls `ReportingService.generate_talents_report(db, format=format, start_date=..., end_date=...)`. But `ReportingService.generate_talents_report` only accepts `(talents: List[Dict])` with no `db`, `format`, `start_date`, or `end_date` parameters. This will raise a `TypeError` at runtime for all six report endpoints. The reporting service is entirely disconnected from its callers.

**INC-8 — `PaymentService.get_payments` is missing**
`app/routers/admin.py:798` — Calls `PaymentService.get_payments(db, skip=skip, limit=limit, filters=filters)`, but this method does not exist in `app/services/payment.py`. The admin payments endpoint will crash at runtime.

**INC-9 — `JobService.update_job_status` is missing**
`app/routers/admin.py:623` — Calls `JobService.update_job_status(db, job_id, JobStatus.ARCHIVED)`, but this method is not defined in `app/services/job.py`. The admin unpublish job endpoint will crash at runtime.

**INC-10 — `TrainingService.update_training_status` is missing**
`app/routers/admin.py:726` — Calls `TrainingService.update_training_status(db, training_id, TrainingStatus.ARCHIVED)`, but this method is not defined in `app/services/training.py`. The admin unpublish training endpoint will crash at runtime.

**INC-11 — `AuthService.create_user` is missing**
`app/routers/admin.py:351, 497` — Both `create_employer` and `create_trainer` admin endpoints call `AuthService.create_user(db, employer_data)` / `AuthService.create_user(db, trainer_data)`, but this method does not exist in `AuthService`. These admin creation endpoints will crash at runtime.

**INC-12 — Google OAuth registration creates User only, not role profile**
`app/services/oauth.py:223-234` — `register_google_user` creates a `User` record but never creates the corresponding `Talent`, `Employer`, or `Trainer` profile record. Any subsequent authenticated request will fail with "profile not found" from `get_current_talent/employer/trainer`.

**INC-13 — `admin.py` dashboard revenue is hardcoded zero**
`app/routers/admin.py:159` — `total_revenue = 0  # TODO: Implement revenue calculation from payment records`.

**INC-14 — Recommended jobs/trainings ignore `talent_id` parameter**
`app/routers/public.py:193-208` and `app/routers/public.py:229-244` — Both branches (with and without `talent_id`) execute exactly the same query. Personalization is not implemented.

**INC-15 — `async_email_service` calls `EmailService.send_email` synchronously**
`app/services/async_email.py:44-50` — `_send_email_sync` calls `self.email_service.send_email(...)`. But `EmailService.send_email` is an `async` static method requiring `background_tasks` as the first argument. Calling it synchronously without arguments will raise a `TypeError`.

### 4.3 Broken Code (NameErrors, ImportErrors, Logic Bugs)

**BRK-1 — `current_user` is undefined in employer image upload**
`app/routers/employer.py:231, 248` — The endpoint uses `current_user.user_type.value` and `current_user.id` but `current_user` is never declared in the function signature. The dependency is `current_employer: Employer = Depends(get_current_employer)`. This will raise a `NameError` at runtime.

**BRK-2 — `app/routers/admin.py` imports non-existent `payment_models`**
`app/routers/admin.py:12` — `from app.models.payment_models import Payment`. The file `app/models/payment_models.py` does not exist. The `Payment` model is defined in `app/models/database_models.py`. This import error will prevent the entire admin router from loading, crashing the application at startup.

**BRK-3 — `app/routers/employer.py` imports non-existent `user_service`**
`app/routers/employer.py:9` — `from app.services.user_service import UserService`. The file is named `app/services/user.py`, not `user_service.py`. This import error will crash the application at startup.

**BRK-4 — `app/routers/employer.py` imports non-existent Pydantic models**
`app/routers/employer.py:13` — `from app.models.user_models import EmployerSignup, EmployerLogin, EmployerOut`. Neither `EmployerSignup` nor `EmployerLogin` are defined in `user_models.py`. This will cause an `ImportError` at startup.

**BRK-5 — `trainer.py` renew endpoint references `training.expires_at`**
`app/routers/trainer.py:454` — `training.expires_at = datetime.utcnow() + timedelta(days=30)`. The Training model column is `expiry_date`, not `expires_at`. Setting a non-existent attribute on a SQLAlchemy model does not raise an error at write time but also does not persist to the database. Same bug in `employer.py:453`.

**BRK-6 — `accept_applicant` sets status to `SHORTLISTED`, not `ACCEPTED`**
`app/routers/employer.py:381` and `app/routers/trainer.py:382` — The endpoint is named "accept" but calls `update_application_status(db, applicant_id, ApplicationStatus.SHORTLISTED)`. The response message says `"status": "accepted"` while the actual DB status is `shortlisted`. This mismatch in behavior and messaging is misleading.

**BRK-7 — `get_all_applications` UNION query uses string column name**
`app/routers/talent.py:972` — `.order_by(desc('created_at'))`. Using a string column name in `order_by` after a `union_all` is unreliable across SQL dialects and may produce incorrect ordering or an error.

**BRK-8 — `get_all_applications` references `Trainer.company_name` which does not exist**
`app/routers/talent.py:930` — The query labels `Trainer.company_name` for training applications. But the `Trainer` model has `provider_name`, not `company_name`. This will raise a column-not-found error at runtime.

**BRK-9 — Unreachable code in `payment.py`**
`app/services/payment.py:80-90` — After `return` and inside an `except` clause, there is a second `logger.error(...)` and `return {...}` block at lines 80-90. The `return` at line 72 exits the `try` block, and the second `except` at line 85 is syntactically unreachable — it appears to be leftover from an edit. Python will interpret this as part of the same `try` block structure, meaning `except Exception` appears twice, which is a logic error.

**BRK-10 — Admin `get_all_talents` uses raw SQL fragment with `db.text()`**
`app/routers/admin.py:203-206` — `db.text("talents.first_name ILIKE :name OR talents.last_name ILIKE :name")` is used inside `filter()` on a Query object. This pattern is deprecated in SQLAlchemy 2.0 and may silently fail or raise a compile error. The same pattern appears in `get_all_employers` (line 299) and `get_all_trainers` (lines 443, 449).

**BRK-11 — `test_public_routes.py` tests fail on response shape**
`tests/test_public_routes.py:93, 98` — `test_get_homepage` asserts `response.json()["message"] == "Welcome to iRxcruit API"` but the actual message is `"Welcome to iRxcruit - You bring the potential..."`. `test_get_jobs` asserts `isinstance(response.json(), list)` but the endpoint returns `{"jobs": [...], "pagination": {...}}` (a dict). Both tests will fail.

**BRK-12 — `JobListing` Pydantic model missing `industry` field**
`app/models/job_models.py:67-84` — `JobListing` does not include the `industry` field, but the `Job` ORM model has it and it is part of the public job listing response. The `model_validate` call in public.py will silently drop it.

**BRK-13 — `admin.py` AdminOut called with non-existent `user_type` and `updated_at` fields**
`app/routers/admin.py:118-128` — `AdminOut(id=user.id, ..., user_type=user.user_type, ..., updated_at=user.updated_at, ...)`. The `AdminOut` Pydantic model only defines `id`, `email`, `is_active`, `created_at`, `first_name`, `last_name` — there is no `user_type` or `updated_at` field defined in `AdminOut`. Pydantic v2 will ignore extra fields by default but this is still incorrect usage.

**BRK-14 — `update_job_pricing` in admin calls `pricing_data.dict(exclude={"package_id"})` but `JobPricingUpdate` has no `package_id` field**
`app/routers/admin.py:833-836` — `PricingService.update_job_pricing(db, pricing_data.package_id, pricing_data.dict(exclude={"package_id"}))`. The `JobPricingUpdate` Pydantic model (from `job_models.py`) has fields `plan_name`, `price`, `job_count`, `description` — none named `package_id`. Accessing `.package_id` will raise an `AttributeError`.

### 4.4 Data Model Issues

**DM-1 — `employers` migration missing `job_credits` column**
The `employers` table migration (`398068dc3f6a`) does not include `job_credits INTEGER DEFAULT 0`. The ORM model defines it. Running `alembic upgrade head` will create a table without this column; inserting an Employer will succeed (SQLAlchemy uses the Python default), but any SQL query filtering or ordering by `job_credits` will fail.

**DM-2 — `trainers` migration missing `training_credits` column**
Same as DM-1 for the `training_credits` column in the `trainers` table.

**DM-3 — `ApplicationStatus` enum mismatch between initial migration and ORM model**
The initial migration (`398068dc3f6a:line 242`) creates the `applicationstatus` enum with values `PENDING, ACCEPTED, REJECTED, WITHDRAWN`. The ORM model defines: `PENDING, IN_REVIEW, SHORTLISTED, ACCEPTED, REJECTED, WITHDRAWN`. The values `IN_REVIEW` and `SHORTLISTED` do not exist in the database enum. Any code that sets `ApplicationStatus.IN_REVIEW` or `ApplicationStatus.SHORTLISTED` will fail with a database constraint violation on PostgreSQL.

**DM-4 — `job_applications` and `training_applications` missing unique constraints**
No unique index on `(job_id, talent_id)` in `job_applications` or `(training_id, talent_id)` in `training_applications`. Duplicate applications cannot happen within a single request due to application-level checks, but concurrent requests or direct DB access can create duplicates.

**DM-5 — `saved_jobs` missing unique constraint**
No unique index on `(job_id, talent_id)`. The `UserService.create_saved_job` handles duplicates in code but the database does not enforce uniqueness.

**DM-6 — Many-to-many association tables missing primary keys and unique constraints**
`talent_skills`, `job_skills`, `training_skills` have no primary key and no unique constraint on their column pairs. Duplicate rows can be inserted.

**DM-7 — `hashed_password` column is nullable but `NOT NULL` in spirit**
`app/models/database_models.py:76` — SQLAlchemy allows `hashed_password = None`. For Google OAuth users, a random password is generated, so this is technically always filled, but the schema does not enforce it.

**DM-8 — `TrainingCreate` uses `date` type but ORM model uses `DateTime`**
`app/models/training_models.py:31` — `start_date: date` and `end_date: Optional[date]` in `TrainingCreate`. The ORM model stores `DateTime`. When passing `date` objects to SQLAlchemy columns typed as `DateTime`, this can produce implicit conversions that drop time components, or raise a validation error depending on the DB driver.

**DM-9 — Branches in migration tree (non-linear history)**
The migration graph has a non-linear branch: `398068dc3f6a` → `dc9ccc04ae01` and `398068dc3f6a` → `add_notification_settings`, both then merged by `ae700d95ab2d`. While this is a valid Alembic pattern, the branch at `dc9ccc04ae01` also becomes the parent of `add_training_fields`, meaning `add_training_fields` is not in the merge. A full upgrade from scratch may not include `add_training_fields` in all scenarios depending on Alembic's ordering.

### 4.5 API Inconsistencies

**API-1 — Jobs pagination style inconsistent between `/jobs` and `/trainings`**
`/jobs` uses `page` + `limit` parameters (router-level); `/trainings` uses `skip` + `limit`. This produces different pagination response shapes and different UX.

**API-2 — `/talent/applications/jobs` total count is based on the post-filter list, not DB count**
`app/routers/talent.py:1056-1059` — `"total": len(formatted_applications)`. The applications are already paginated via `skip`/`limit` in the service call. The total returned is the page size, not the total count in the database. Same issue in `/talent/applications/trainings`.

**API-3 — Admin reports return a serialized CSV string as JSON payload**
`app/routers/admin.py:918` — `return {"message": "Talents report exported", "report": report_data}`. `report_data` is a CSV string embedded in JSON. There is no `Content-Disposition` header, no `Response` object with `media_type="text/csv"`. This is unusable as a real download endpoint.

**API-4 — Response models are inconsistently applied**
Admin user list endpoints (`GET /admin/talents`, `/admin/employers`, `/admin/trainers`) declare `response_model=List[TalentOut]` etc., but query `User` objects and return them directly. `TalentOut` inherits from `TalentBase` which has `first_name` and `last_name` — fields on `Talent`, not on `User`. This will cause Pydantic validation errors at runtime.

**API-5 — `/auth/register` sends verification email with incorrect signature**
`app/routers/auth.py:85` — `await VerificationService.send_verification_email(db, user, base_url, background_tasks)`. The `VerificationService.send_verification_email` method accepts exactly 3 arguments `(db, user, base_url)` and calling it with 4 will raise a `TypeError`.

**API-6 — Admin `PUT /pricing/jobs` endpoint will fail at attribute access**
`app/routers/admin.py:834` — `pricing_data.package_id` — `JobPricingUpdate` has no `package_id` attribute. This raises `AttributeError` on every call.

**API-7 — `/employer/jobs` and `/trainer/trainings` return raw ORM objects**
`app/routers/employer.py:268-273` and `app/routers/trainer.py:269-273` — `JobService.get_employer_jobs` and `TrainingService.get_trainer_trainings` return plain ORM objects without setting computed attributes like `employer_name` / `applicant_count`. FastAPI will serialize them, but fields like `employer_name` will be absent, potentially breaking frontend expectations.

---

## Section 5: TODO / FIXME / Commented-out Code

| File | Line | Type | Content |
|------|------|------|---------|
| `app/routers/talent.py` | 23 | comment | `# This will be implemented with database operations later` |
| `app/routers/talent.py` | 29 | comment | `# This will be implemented with authentication later` |
| `app/routers/talent.py` | 208-211 | comment | `# Note: This is a simplified version. In a real implementation...` |
| `app/routers/talent.py` | 659-662 | commented code | Full block to update `talent.resume_url` after upload is commented out |
| `app/routers/talent.py` | 684-685 | comment | `# No need to check user type as get_current_talent already ensures this` |
| `app/routers/talent.py` | 1272 | comment | `# Get featured jobs (this would typically be jobs recommended for the talent)` |
| `app/routers/employer.py` | 17 | commented import | `# from app.models.job_models import JobCreate, JobOut, JobApplicant` |
| `app/routers/employer.py` | 53-54 | comment | `# This will be implemented with database operations later` |
| `app/routers/employer.py` | 58-60 | comment | `# This will be implemented with authentication later` |
| `app/routers/trainer.py` | 16-18 | commented import | `# from app.models.user_models import TrainerCreate, TrainerOut, Trainer` |
| `app/routers/trainer.py` | 51-52 | comment | `# This will be implemented with database operations later` |
| `app/routers/trainer.py` | 57-60 | comment | `# This will be implemented with authentication later` |
| `app/routers/admin.py` | 159 | TODO comment | `# TODO: Implement revenue calculation from payment records` |
| `app/routers/public.py` | 195-208 | comment | `# This could be enhanced with ML algorithms in the future` |
| `app/routers/public.py` | 229-244 | comment | `# This could be enhanced with ML algorithms in the future` |
| `app/main.py` | 33 | comment | `# Update this with your frontend URL in production` |
| `app/services/oauth.py` | 165-168 | comment | `# In a real application, you would redirect to a page to complete profile` |
| `app/services/storage.py` | 71 | comment | `# Make sure to set GOOGLE_APPLICATION_CREDENTIALS env var or run in GCP` |
| `app/routers/talent.py` | 227 | comment | `# Note: Education and certificates are handled by their respective endpoints` |

---

## Section 6: Dependencies

All versions are pinned in `requirements.txt`. Current date is 2026-05-24; the versions below were current approximately mid-2023. All packages are significantly outdated.

### Known CVE Risks and Critical Outdated Packages

| Package | Pinned Version | Current (approx.) | Risk Notes |
|---------|---------------|-------------------|------------|
| `fastapi` | 0.95.1 | 0.115.x+ | Multiple security and bug fixes since 0.95.x. CORS handling improvements. |
| `uvicorn` | 0.22.0 | 0.32.x+ | Bug fixes including potential DoS via slow requests. |
| `python-jose` | 3.3.0 | 3.3.0 (stale) | **CVE-2024-33663**: ECDSA algorithm confusion attack. Also lacks active maintenance. Consider replacing with `PyJWT` (already also in requirements). |
| `passlib` | 1.7.4 | 1.7.4 (stale) | No updates since 2020. Bcrypt support depends on `bcrypt` version; compatibility issues with bcrypt >= 4.0. |
| `python-multipart` | 0.0.6 | 0.0.12+ | **CVE-2024-24762**: Denial of service via malformed multipart form data. **Upgrade immediately.** |
| `sqlalchemy` | 2.0.12 | 2.0.36+ | Multiple bug fixes since 2.0.12. |
| `alembic` | 1.10.4 | 1.13.x+ | Bug fixes. |
| `psycopg2-binary` | 2.9.6 | 2.9.10+ | Bug fixes. |
| `stripe` | 5.4.0 | 11.x+ | Major version jump; API compatibility may be broken. Stripe v5 is very old. |
| `boto3` | 1.28.38 | 1.35.x+ | AWS SDK updates; older versions may lack support for newer S3 features/security. |
| `google-cloud-storage` | 2.13.0 | 2.18.x+ | Bug fixes. |
| `httpx` | 0.24.1 | 0.28.x+ | Security and HTTP/2 fixes. Note: **`httpx==0.24.1` is listed twice** in requirements.txt (lines 30 and 35). |
| `pyjwt` | 2.6.0 | 2.9.x+ | Bug fixes. Redundant alongside `python-jose`. |
| `jinja2` | 3.1.2 | 3.1.5+ | **CVE-2024-34064**: Potential sandbox escape with async environment. Upgrade to 3.1.4+. |
| `apscheduler` | 3.10.1 | 3.10.4+ | Bug fixes. |
| `slowapi` | 0.1.9 | 0.1.9 | Rate limiting is imported but **never actually applied to any route in the codebase**. |
| `circuitbreaker` | 1.4.0 | 2.0.0+ | Major version with breaking changes available. |
| `pandas` | 2.0.1 | 2.2.x+ | Used in requirements but **never imported in any application code**. It is an unused dependency with a large install footprint. |
| `loguru` | 0.7.0 | 0.7.2+ | Listed in requirements but the application uses Python's built-in `logging` module exclusively. Unused dependency. |

### Structural Dependency Issues

- **Duplicate package**: `httpx==0.24.1` appears at both line 30 and line 35 in `requirements.txt`.
- **Two JWT libraries**: Both `python-jose` and `PyJWT` are installed. The application uses `python-jose`. `PyJWT` is unused.
- **Unused packages**: `pandas`, `loguru`, and `slowapi` are installed but never used in application code.
- **`resend` SDK missing**: The email service uses the Resend REST API directly via `httpx`. An official `resend` Python SDK exists but is not listed as a dependency.
- **`bcrypt` not explicitly pinned**: `passlib[bcrypt]` compatibility with bcrypt >= 4.0 requires explicit version pinning. This is not present.
- **`pytest-asyncio` missing**: The test suite has no async tests currently, but the application is async-first. Any future async tests will require this package.

---

*End of audit. All issues above should be resolved before this codebase is deployed to any environment with real user data or production traffic.*
