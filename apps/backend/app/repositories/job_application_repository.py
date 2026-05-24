from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database_models import JobApplication, ApplicationStatus
from app.repositories.base import BaseRepository


class JobApplicationRepository(BaseRepository[JobApplication]):
    def __init__(self, db: Session):
        super().__init__(db, JobApplication)

    def get_by_id(self, id: int) -> Optional[JobApplication]:
        return (
            self.db.query(JobApplication).filter(JobApplication.id == id).first()
        )

    def get_by_job(
        self, job_id: int, skip: int = 0, limit: int = 100
    ) -> List[JobApplication]:
        return (
            self.db.query(JobApplication)
            .filter(JobApplication.job_id == job_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_talent(
        self, talent_id: int, skip: int = 0, limit: int = 100
    ) -> List[JobApplication]:
        return (
            self.db.query(JobApplication)
            .filter(JobApplication.talent_id == talent_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_talent(self, talent_id: int) -> int:
        return (
            self.db.query(JobApplication)
            .filter(JobApplication.talent_id == talent_id)
            .count()
        )

    def already_applied(self, job_id: int, talent_id: int) -> bool:
        return (
            self.db.query(JobApplication)
            .filter(
                JobApplication.job_id == job_id,
                JobApplication.talent_id == talent_id,
            )
            .first()
        ) is not None

    def create(
        self,
        job_id: int,
        talent_id: int,
        cover_letter: Optional[str] = None,
    ) -> JobApplication:
        application = JobApplication(
            job_id=job_id,
            talent_id=talent_id,
            cover_letter=cover_letter,
        )
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def update_status(
        self, application: JobApplication, status: ApplicationStatus
    ) -> JobApplication:
        application.status = status
        self.db.commit()
        self.db.refresh(application)
        return application

    def delete(self, application: JobApplication) -> None:
        self.db.delete(application)
        self.db.commit()
