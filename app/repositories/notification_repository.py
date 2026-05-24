from typing import Optional
from sqlalchemy.orm import Session

from app.models.database_models import NotificationSettings
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[NotificationSettings]):
    def __init__(self, db: Session):
        super().__init__(db, NotificationSettings)

    def get_by_user_id(self, user_id: int) -> Optional[NotificationSettings]:
        return (
            self.db.query(NotificationSettings)
            .filter(NotificationSettings.user_id == user_id)
            .first()
        )

    def create_defaults(self, user_id: int) -> NotificationSettings:
        settings = NotificationSettings(
            user_id=user_id,
            job_updates_in_app=True,
            job_updates_email=True,
            training_alerts_in_app=True,
            training_alerts_email=True,
            application_status_updates_in_app=True,
            application_status_updates_email=True,
            saved_job_training_reminders_in_app=True,
            saved_job_training_reminders_email=False,
            system_notifications_in_app=True,
            system_notifications_email=True,
        )
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update(self, settings: NotificationSettings, **data) -> NotificationSettings:
        for key, value in data.items():
            setattr(settings, key, value)
        self.db.commit()
        self.db.refresh(settings)
        return settings
