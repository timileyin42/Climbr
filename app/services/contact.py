from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import BackgroundTasks
import os

from app.models.database_models import ContactSubmission
from app.services.email import EmailService
from app.repositories.contact_repository import ContactRepository


class ContactService:
    @staticmethod
    async def create_contact_submission(
        db: Session,
        name: str,
        email: str,
        message: str,
        background_tasks: BackgroundTasks = None,
    ) -> ContactSubmission:
        repo = ContactRepository(db)
        contact_submission = repo.create(name=name, email=email, message=message)

        if background_tasks:
            admin_email = os.getenv("ADMIN_EMAIL", "admin@climbr.com")
            await EmailService.send_email(
                background_tasks=background_tasks,
                to_email=admin_email,
                subject=f"New Contact Form Submission from {name}",
                template_name="contact_notification.html",
                template_data={
                    "name": name,
                    "email": email,
                    "message": message,
                    "submission_id": contact_submission.id,
                    "submitted_at": contact_submission.created_at,
                },
            )

        return contact_submission

    @staticmethod
    def get_contact_submissions(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        unread_only: bool = False,
    ) -> List[ContactSubmission]:
        repo = ContactRepository(db)
        return repo.get_all(skip=skip, limit=limit, unread_only=unread_only)

    @staticmethod
    def get_contact_submission_by_id(
        db: Session, submission_id: int
    ) -> Optional[ContactSubmission]:
        repo = ContactRepository(db)
        return repo.get_by_id(submission_id)

    @staticmethod
    def mark_as_read(
        db: Session, submission_id: int
    ) -> Optional[ContactSubmission]:
        repo = ContactRepository(db)
        submission = repo.get_by_id(submission_id)
        if not submission:
            return None
        return repo.mark_read(submission)

    @staticmethod
    def delete_contact_submission(db: Session, submission_id: int) -> bool:
        repo = ContactRepository(db)
        submission = repo.get_by_id(submission_id)
        if not submission:
            return False
        repo.delete(submission)
        return True
