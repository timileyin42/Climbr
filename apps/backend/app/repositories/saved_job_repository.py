from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database_models import SavedJob
from app.repositories.base import BaseRepository


class SavedJobRepository(BaseRepository[SavedJob]):
    def __init__(self, db: Session):
        super().__init__(db, SavedJob)

    def get_by_talent(
        self, talent_id: int, skip: int = 0, limit: int = 100
    ) -> List[SavedJob]:
        return (
            self.db.query(SavedJob)
            .filter(SavedJob.talent_id == talent_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_id(self, id: int, talent_id: int) -> Optional[SavedJob]:
        return (
            self.db.query(SavedJob)
            .filter(SavedJob.id == id, SavedJob.talent_id == talent_id)
            .first()
        )

    def is_saved(self, job_id: int, talent_id: int) -> bool:
        return (
            self.db.query(SavedJob)
            .filter(SavedJob.job_id == job_id, SavedJob.talent_id == talent_id)
            .first()
        ) is not None

    def save(self, job_id: int, talent_id: int) -> SavedJob:
        saved_job = SavedJob(job_id=job_id, talent_id=talent_id)
        self.db.add(saved_job)
        self.db.commit()
        self.db.refresh(saved_job)
        return saved_job

    def unsave(self, saved_job: SavedJob) -> None:
        self.db.delete(saved_job)
        self.db.commit()
