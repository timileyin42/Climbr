from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.models.database_models import Job, JobApplication, JobStatus, ApplicationStatus
from app.repositories.job_repository import JobRepository
from app.repositories.job_application_repository import JobApplicationRepository


class JobService:
    @staticmethod
    def get_jobs(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Job]:
        repo = JobRepository(db)
        return repo.get_all(skip=skip, limit=limit, filters=filters)

    @staticmethod
    def get_jobs_count(db: Session, filters: Optional[Dict[str, Any]] = None) -> int:
        repo = JobRepository(db)
        return repo.count(filters=filters)

    @staticmethod
    def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
        repo = JobRepository(db)
        return repo.get_by_id(job_id)

    @staticmethod
    def get_job_by_id_simple(db: Session, job_id: int) -> Optional[Job]:
        repo = JobRepository(db)
        return repo.get_by_id_simple(job_id)

    @staticmethod
    def create_job(
        db: Session,
        employer_id: int,
        job_data: dict,
        skill_ids: List[int] = None,
    ) -> Job:
        repo = JobRepository(db)
        return repo.create(employer_id=employer_id, skill_ids=skill_ids, **job_data)

    @staticmethod
    def update_job(
        db: Session,
        job_id: int,
        job_data: dict,
        skill_ids: List[int] = None,
    ) -> Optional[Job]:
        repo = JobRepository(db)
        job = repo.get_by_id_simple(job_id)
        if not job:
            return None
        return repo.update(job, skill_ids=skill_ids, **job_data)

    @staticmethod
    def delete_job(db: Session, job_id: int) -> bool:
        repo = JobRepository(db)
        job = repo.get_by_id_simple(job_id)
        if not job:
            return False
        repo.delete(job)
        return True

    @staticmethod
    def apply_to_job(
        db: Session, job_id: int, talent_id: int, application_data: dict
    ) -> Optional[JobApplication]:
        job_repo = JobRepository(db)
        job = job_repo.get_by_id_simple(job_id)
        if not job:
            return None
        if job.status != JobStatus.ACTIVE:
            return None
        if job.expiry_date and job.expiry_date < datetime.utcnow():
            return None

        app_repo = JobApplicationRepository(db)
        if app_repo.already_applied(job_id, talent_id):
            return None

        return app_repo.create(
            job_id=job_id,
            talent_id=talent_id,
            cover_letter=application_data.get("cover_letter"),
        )

    @staticmethod
    def get_job_applications(
        db: Session, job_id: int, skip: int = 0, limit: int = 100
    ) -> List[JobApplication]:
        repo = JobApplicationRepository(db)
        return repo.get_by_job(job_id, skip=skip, limit=limit)

    @staticmethod
    def get_talent_applications(
        db: Session, talent_id: int, skip: int = 0, limit: int = 100
    ) -> List[JobApplication]:
        repo = JobApplicationRepository(db)
        return repo.get_by_talent(talent_id, skip=skip, limit=limit)

    @staticmethod
    def update_application_status(
        db: Session, application_id: int, status: ApplicationStatus
    ) -> Optional[JobApplication]:
        repo = JobApplicationRepository(db)
        application = repo.get_by_id(application_id)
        if not application:
            return None
        return repo.update_status(application, status)

    @staticmethod
    def get_employer_jobs(
        db: Session,
        employer_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[JobStatus] = None,
    ) -> List[Job]:
        repo = JobRepository(db)
        return repo.get_by_employer(employer_id, skip=skip, limit=limit, status=status)

    @staticmethod
    def archive_expired_jobs(db: Session) -> int:
        repo = JobRepository(db)
        return repo.archive_expired()

    @staticmethod
    def get_job_stats(db: Session) -> dict:
        repo = JobRepository(db)
        return repo.get_stats()
