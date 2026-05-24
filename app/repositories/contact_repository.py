from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database_models import ContactSubmission
from app.repositories.base import BaseRepository


class ContactRepository(BaseRepository[ContactSubmission]):
    def __init__(self, db: Session):
        super().__init__(db, ContactSubmission)

    def create(self, name: str, email: str, message: str) -> ContactSubmission:
        submission = ContactSubmission(name=name, email=email, message=message, is_read=False)
        self.db.add(submission)
        self.db.commit()
        self.db.refresh(submission)
        return submission

    def get_all(
        self, skip: int = 0, limit: int = 100, unread_only: bool = False
    ) -> List[ContactSubmission]:
        query = self.db.query(ContactSubmission)
        if unread_only:
            query = query.filter(ContactSubmission.is_read == False)
        return (
            query.order_by(ContactSubmission.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, id: int) -> Optional[ContactSubmission]:
        return (
            self.db.query(ContactSubmission)
            .filter(ContactSubmission.id == id)
            .first()
        )

    def mark_read(self, submission: ContactSubmission) -> ContactSubmission:
        submission.is_read = True
        self.db.commit()
        self.db.refresh(submission)
        return submission

    def delete(self, submission: ContactSubmission) -> None:
        self.db.delete(submission)
        self.db.commit()
