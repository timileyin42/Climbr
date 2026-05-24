import asyncio
import logging
from typing import Optional

from app.worker import celery_app

logger = logging.getLogger(__name__)


def _run(coro):
    """Run an async coroutine from a sync Celery task."""
    return asyncio.get_event_loop().run_until_complete(coro)


# ---------------------------------------------------------------------------
# Job-match notification task
# ---------------------------------------------------------------------------

@celery_app.task(name="notify_new_job_matches", bind=True, max_retries=3)
def notify_new_job_matches(self, job_id: int):
    """
    Triggered after a new job is posted.
    Finds all talents whose skills overlap with the job's required skills,
    then sends in-app, push, and email notifications based on each
    talent's NotificationSettings preferences.
    """
    from app.database import SessionLocal
    from app.models.database_models import (
        Job, JobStatus, Talent, DeviceToken, Notification,
        NotificationType, talent_skills, job_skills,
    )
    from sqlalchemy import select

    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job or job.status != JobStatus.ACTIVE:
            return

        job_skill_ids = {s.id for s in job.skills}
        if not job_skill_ids:
            # No skills on the job — notify all active talents
            talents = db.query(Talent).join(Talent.user).filter(
                Talent.user.has(is_active=True, is_verified=True)
            ).all()
        else:
            # Only talents who share at least one skill with the job
            from sqlalchemy import exists
            talents = (
                db.query(Talent)
                .join(Talent.user)
                .filter(
                    Talent.user.has(is_active=True, is_verified=True),
                    exists().where(
                        (talent_skills.c.talent_id == Talent.id) &
                        (talent_skills.c.skill_id.in_(job_skill_ids))
                    )
                )
                .all()
            )

        company_name = job.employer.company_name if job.employer else "A company"
        notif_title = f"New job match: {job.title}"
        notif_body = f"{company_name} is hiring — matches your skills"

        db_notifications = []
        push_tokens = []
        email_targets = []

        for talent in talents:
            user = talent.user
            prefs = user.notification_settings

            wants_in_app = (prefs is None) or prefs.job_updates_in_app
            wants_push = wants_in_app
            wants_email = (prefs is None) or prefs.job_updates_email

            if wants_in_app:
                db_notifications.append(Notification(
                    user_id=user.id,
                    type=NotificationType.JOB_MATCH,
                    title=notif_title,
                    body=notif_body,
                    data={"job_id": job.id, "employer_id": job.employer_id},
                ))

            if wants_push:
                tokens = [dt.token for dt in talent.device_tokens]
                push_tokens.extend(tokens)

            if wants_email:
                email_targets.append((user.email, talent.first_name or "there"))

        # Bulk-insert in-app notifications
        if db_notifications:
            db.bulk_save_objects(db_notifications)
            db.commit()

        # Push notifications (multicast)
        if push_tokens:
            _run(_send_push_batch(push_tokens, notif_title, notif_body, {"job_id": str(job_id)}))

        # Emails (fire individual tasks)
        for email, first_name in email_targets:
            send_job_match_email.delay(email, first_name, job_id, job.title, company_name)

        logger.info(
            "notify_new_job_matches: job=%d in_app=%d push=%d email=%d",
            job_id, len(db_notifications), len(push_tokens), len(email_targets),
        )

    except Exception as exc:
        db.rollback()
        logger.exception("notify_new_job_matches failed for job %d: %s", job_id, exc)
        raise self.retry(exc=exc, countdown=60)
    finally:
        db.close()


async def _send_push_batch(tokens: list, title: str, body: str, data: dict):
    from app.services.push import send_push_multicast
    await send_push_multicast(tokens, title, body, data)


# ---------------------------------------------------------------------------
# Job-match email task
# ---------------------------------------------------------------------------

@celery_app.task(name="send_job_match_email", bind=True, max_retries=3)
def send_job_match_email(
    self,
    to_email: str,
    first_name: str,
    job_id: int,
    job_title: str,
    company_name: str,
):
    """Send a job-match email to a single talent."""
    from app.config import settings
    import resend

    if not settings.RESEND_API_KEY:
        return

    resend.api_key = settings.RESEND_API_KEY
    job_url = f"{settings.FRONTEND_URL}/jobs/{job_id}"

    html = f"""
    <p>Hi {first_name},</p>
    <p>A new job that matches your skills was just posted:</p>
    <p><strong>{job_title}</strong> at <strong>{company_name}</strong></p>
    <p><a href="{job_url}">View job &rarr;</a></p>
    <p>— The Climbr Team</p>
    """

    try:
        resend.Emails.send({
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [to_email],
            "subject": f"New job match: {job_title} at {company_name}",
            "html": html,
        })
    except Exception as exc:
        logger.warning("send_job_match_email failed for %s: %s", to_email, exc)
        raise self.retry(exc=exc, countdown=120)


# ---------------------------------------------------------------------------
# Application status update notification task
# ---------------------------------------------------------------------------

@celery_app.task(name="notify_application_status_update")
def notify_application_status_update(
    talent_user_id: int,
    talent_email: str,
    first_name: str,
    job_title: str,
    new_status: str,
    job_id: int,
):
    """
    Called when an employer accepts / shortlists / rejects an applicant.
    Sends in-app + push + email based on talent's preferences.
    """
    from app.database import SessionLocal
    from app.models.database_models import (
        User, DeviceToken, Notification, NotificationType,
    )

    status_labels = {
        "shortlisted": "You've been shortlisted",
        "accepted": "Congratulations — you've been accepted",
        "rejected": "Application update",
        "in_review": "Your application is under review",
    }
    title = status_labels.get(new_status, "Application update")
    body = f"{job_title}: {title.lower()}"

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == talent_user_id).first()
        if not user:
            return

        prefs = user.notification_settings
        wants_in_app = (prefs is None) or prefs.application_status_updates_in_app
        wants_email = (prefs is None) or prefs.application_status_updates_email

        if wants_in_app:
            notif = Notification(
                user_id=user.id,
                type=NotificationType.APPLICATION_UPDATE,
                title=title,
                body=body,
                data={"job_id": job_id, "status": new_status},
            )
            db.add(notif)

            # Push
            tokens = [dt.token for dt in user.talent.device_tokens] if user.talent else []
            if tokens:
                _run(_send_push_batch(tokens, title, body, {"job_id": str(job_id), "status": new_status}))

        db.commit()

        if wants_email:
            _send_application_status_email(talent_email, first_name, job_title, new_status, job_id)

    except Exception as exc:
        db.rollback()
        logger.exception("notify_application_status_update failed: %s", exc)
    finally:
        db.close()


def _send_application_status_email(email, first_name, job_title, status, job_id):
    from app.config import settings
    import resend

    if not settings.RESEND_API_KEY:
        return

    resend.api_key = settings.RESEND_API_KEY
    messages = {
        "shortlisted": f"Great news! You've been shortlisted for <strong>{job_title}</strong>.",
        "accepted": f"Congratulations! You've been accepted for <strong>{job_title}</strong>.",
        "rejected": f"Thank you for applying to <strong>{job_title}</strong>. Unfortunately, you were not selected at this time.",
        "in_review": f"Your application for <strong>{job_title}</strong> is now under review.",
    }
    message = messages.get(status, f"Your application for <strong>{job_title}</strong> has been updated.")

    html = f"""
    <p>Hi {first_name},</p>
    <p>{message}</p>
    <p><a href="{settings.FRONTEND_URL}/talent/applications">View your applications &rarr;</a></p>
    <p>— The Climbr Team</p>
    """

    try:
        resend.Emails.send({
            "from": f"{settings.FROM_NAME} <{settings.FROM_EMAIL}>",
            "to": [email],
            "subject": f"Application update: {job_title}",
            "html": html,
        })
    except Exception as exc:
        logger.warning("Application status email failed for %s: %s", email, exc)
