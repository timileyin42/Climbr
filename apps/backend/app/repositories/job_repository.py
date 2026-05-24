from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc

from app.models.database_models import Job, JobApplication, Employer, Skill, JobStatus
from app.repositories.base import BaseRepository


class JobRepository(BaseRepository[Job]):
    def __init__(self, db: Session):
        super().__init__(db, Job)

    def get_all(
        self, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ) -> List[Job]:
        query = (
            self.db.query(
                Job,
                Employer.company_name.label("employer_name"),
                func.count(JobApplication.id).label("applicant_count"),
            )
            .join(Employer)
            .outerjoin(JobApplication)
            .filter(Job.status == JobStatus.ACTIVE)
            .group_by(Job.id, Employer.company_name)
        )

        if filters:
            if filters.get("job_type"):
                query = query.filter(Job.job_type == filters["job_type"])

            if filters.get("location"):
                query = query.filter(Job.location.ilike(f"%{filters['location']}%"))

            if filters.get("industry"):
                query = query.filter(Job.industry.ilike(f"%{filters['industry']}%"))

            if filters.get("experience_level"):
                query = query.filter(
                    Job.experience_level == filters["experience_level"]
                )

            if filters.get("company_size"):
                query = query.filter(Job.company_size == filters["company_size"])

            if filters.get("search"):
                term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Job.title.ilike(term),
                        Job.description.ilike(term),
                        Employer.company_name.ilike(term),
                    )
                )

            if filters.get("employer_id"):
                query = query.filter(Job.employer_id == filters["employer_id"])

            if filters.get("salary_min"):
                query = query.filter(Job.salary_max >= filters["salary_min"])

            if filters.get("salary_max"):
                query = query.filter(Job.salary_min <= filters["salary_max"])

            if filters.get("skills"):
                skill_ids = filters["skills"]
                query = query.join(Job.skills).filter(Skill.id.in_(skill_ids))

            if filters.get("date_posted"):
                date_filter = filters["date_posted"]
                now = datetime.utcnow()
                if date_filter == "recent":
                    query = query.filter(Job.created_at >= now - timedelta(days=3))
                elif date_filter == "week":
                    query = query.filter(Job.created_at >= now - timedelta(days=7))
                elif date_filter == "month":
                    query = query.filter(Job.created_at >= now - timedelta(days=30))

        sort_by = filters.get("sort_by", "date") if filters else "date"
        if sort_by == "salary":
            query = query.order_by(desc(Job.salary_max))
        else:
            query = query.order_by(desc(Job.created_at))

        results = query.offset(skip).limit(limit).all()
        jobs = []
        for result in results:
            job = result[0]
            job.employer_name = result[1]
            job.applicant_count = result[2] or 0
            jobs.append(job)
        return jobs

    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = (
            self.db.query(Job)
            .join(Employer)
            .filter(Job.status == JobStatus.ACTIVE)
        )

        if filters:
            if filters.get("job_type"):
                query = query.filter(Job.job_type == filters["job_type"])

            if filters.get("location"):
                query = query.filter(Job.location.ilike(f"%{filters['location']}%"))

            if filters.get("industry"):
                query = query.filter(Job.industry.ilike(f"%{filters['industry']}%"))

            if filters.get("experience_level"):
                query = query.filter(
                    Job.experience_level == filters["experience_level"]
                )

            if filters.get("company_size"):
                query = query.filter(Job.company_size == filters["company_size"])

            if filters.get("search"):
                term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Job.title.ilike(term),
                        Job.description.ilike(term),
                        Employer.company_name.ilike(term),
                    )
                )

            if filters.get("employer_id"):
                query = query.filter(Job.employer_id == filters["employer_id"])

            if filters.get("salary_min"):
                query = query.filter(Job.salary_max >= filters["salary_min"])

            if filters.get("salary_max"):
                query = query.filter(Job.salary_min <= filters["salary_max"])

            if filters.get("skills"):
                skill_ids = filters["skills"]
                query = (
                    query.join(Job.skills)
                    .filter(Skill.id.in_(skill_ids))
                    .group_by(Job.id)
                )

            if filters.get("date_posted"):
                date_filter = filters["date_posted"]
                now = datetime.utcnow()
                if date_filter == "recent":
                    query = query.filter(Job.created_at >= now - timedelta(days=3))
                elif date_filter == "week":
                    query = query.filter(Job.created_at >= now - timedelta(days=7))
                elif date_filter == "month":
                    query = query.filter(Job.created_at >= now - timedelta(days=30))

        return query.count()

    def get_by_id(self, job_id: int) -> Optional[Job]:
        result = (
            self.db.query(
                Job,
                Employer.company_name.label("employer_name"),
                func.count(JobApplication.id).label("applicant_count"),
            )
            .join(Employer)
            .outerjoin(JobApplication)
            .filter(Job.id == job_id)
            .group_by(Job.id, Employer.company_name)
            .first()
        )
        if not result:
            return None
        job = result[0]
        job.employer_name = result[1]
        job.applicant_count = result[2] or 0
        return job

    def get_by_id_simple(self, job_id: int) -> Optional[Job]:
        return self.db.query(Job).filter(Job.id == job_id).first()

    def get_by_employer(
        self,
        employer_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[JobStatus] = None,
    ) -> List[Job]:
        query = self.db.query(Job).filter(Job.employer_id == employer_id)
        if status:
            query = query.filter(Job.status == status)
        return query.order_by(desc(Job.created_at)).offset(skip).limit(limit).all()

    def create(self, employer_id: int, skill_ids: Optional[List[int]] = None, **data) -> Job:
        job = Job(employer_id=employer_id, **data)
        self.db.add(job)
        self.db.flush()
        if skill_ids:
            skills = self.db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            job.skills = skills
        self.db.commit()
        self.db.refresh(job)
        return job

    def update(self, job: Job, skill_ids: Optional[List[int]] = None, **data) -> Job:
        for key, value in data.items():
            setattr(job, key, value)
        if skill_ids is not None:
            skills = self.db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            job.skills = skills
        self.db.commit()
        self.db.refresh(job)
        return job

    def delete(self, job: Job) -> None:
        self.db.delete(job)
        self.db.commit()

    def archive_expired(self) -> int:
        expired_jobs = (
            self.db.query(Job)
            .filter(Job.status == JobStatus.ACTIVE, Job.expiry_date < datetime.utcnow())
            .all()
        )
        count = 0
        for job in expired_jobs:
            job.status = JobStatus.ARCHIVED
            count += 1
        self.db.commit()
        return count

    def get_stats(self) -> Dict[str, int]:
        active = (
            self.db.query(func.count(Job.id))
            .filter(Job.status == JobStatus.ACTIVE)
            .scalar()
        )
        archived = (
            self.db.query(func.count(Job.id))
            .filter(Job.status == JobStatus.ARCHIVED)
            .scalar()
        )
        draft = (
            self.db.query(func.count(Job.id))
            .filter(Job.status == JobStatus.DRAFT)
            .scalar()
        )
        unpublished = (
            self.db.query(func.count(Job.id))
            .filter(Job.status == JobStatus.UNPUBLISHED)
            .scalar()
        )
        return {
            "active": active,
            "archived": archived,
            "draft": draft,
            "unpublished": unpublished,
            "total": active + archived + draft + unpublished,
        }
