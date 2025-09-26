from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

# Import models
from app.models.database_models import Job, JobApplication, Employer, Talent, Skill, JobStatus, ApplicationStatus

class JobService:
    @staticmethod
    def get_jobs(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None) -> List[Job]:
        """
        Get jobs with optional filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            
        Returns:
            List of Job objects
        """
        query = db.query(Job, Employer.company_name.label('employer_name'), 
                         func.count(JobApplication.id).label('applicant_count'))\
                    .join(Employer)\
                    .outerjoin(JobApplication)\
                    .filter(Job.status == JobStatus.ACTIVE)\
                    .group_by(Job.id, Employer.company_name)
        
        if filters:
            # Apply filters if provided
            if filters.get("job_type"):
                query = query.filter(Job.job_type == filters["job_type"])
            
            if filters.get("location"):
                query = query.filter(Job.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("industry"):
                query = query.filter(Job.industry.ilike(f"%{filters['industry']}%"))
            
            if filters.get("experience_level"):
                query = query.filter(Job.experience_level == filters["experience_level"])
            
            if filters.get("company_size"):
                query = query.filter(Job.company_size == filters["company_size"])
            
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Job.title.ilike(search_term),
                        Job.description.ilike(search_term),
                        Employer.company_name.ilike(search_term)
                    )
                )
            
            if filters.get("employer_id"):
                query = query.filter(Job.employer_id == filters["employer_id"])
            
            if filters.get("salary_min"):
                query = query.filter(Job.salary_max >= filters["salary_min"])
            
            if filters.get("salary_max"):
                query = query.filter(Job.salary_min <= filters["salary_max"])
            
            if filters.get("skills"):
                # Filter by skills
                skill_ids = filters["skills"]
                query = query.join(Job.skills).filter(Skill.id.in_(skill_ids)).group_by(Job.id)
            
            if filters.get("date_posted"):
                date_filter = filters["date_posted"]
                now = datetime.utcnow()
                if date_filter == "recent":
                    query = query.filter(Job.created_at >= now - timedelta(days=3))
                elif date_filter == "week":
                    query = query.filter(Job.created_at >= now - timedelta(days=7))
                elif date_filter == "month":
                    query = query.filter(Job.created_at >= now - timedelta(days=30))
        
        # Apply sorting
        sort_by = filters.get("sort_by", "date") if filters else "date"
        if sort_by == "salary":
            query = query.order_by(desc(Job.salary_max))
        elif sort_by == "relevance":
            # For now, use creation date for relevance
            query = query.order_by(desc(Job.created_at))
        else:  # default to date
            query = query.order_by(desc(Job.created_at))
        
        results = query.offset(skip).limit(limit).all()
        
        # Convert results to Job objects with additional attributes
        jobs = []
        for result in results:
            job = result[0]  # Job object
            job.employer_name = result[1]  # employer_name
            job.applicant_count = result[2] or 0  # applicant_count
            jobs.append(job)
        
        return jobs
    
    @staticmethod
    def get_jobs_count(db: Session, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Get total count of jobs with optional filtering.
        
        Args:
            db: Database session
            filters: Optional filters
            
        Returns:
            Total count of jobs
        """
        query = db.query(Job).join(Employer).filter(Job.status == JobStatus.ACTIVE)
        
        if filters:
            # Apply same filters as get_jobs
            if filters.get("job_type"):
                query = query.filter(Job.job_type == filters["job_type"])
            
            if filters.get("location"):
                query = query.filter(Job.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("industry"):
                query = query.filter(Job.industry.ilike(f"%{filters['industry']}%"))
            
            if filters.get("experience_level"):
                query = query.filter(Job.experience_level == filters["experience_level"])
            
            if filters.get("company_size"):
                query = query.filter(Job.company_size == filters["company_size"])
            
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Job.title.ilike(search_term),
                        Job.description.ilike(search_term),
                        Employer.company_name.ilike(search_term)
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
                query = query.join(Job.skills).filter(Skill.id.in_(skill_ids)).group_by(Job.id)
            
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
    
    @staticmethod
    def get_job_by_id(db: Session, job_id: int) -> Optional[Job]:
        """
        Get a job by ID with employer information.
        
        Args:
            db: Database session
            job_id: Job ID
            
        Returns:
            Job object if found, None otherwise
        """
        result = db.query(Job, Employer.company_name.label('employer_name'), 
                         func.count(JobApplication.id).label('applicant_count'))\
                   .join(Employer)\
                   .outerjoin(JobApplication)\
                   .filter(Job.id == job_id)\
                   .group_by(Job.id, Employer.company_name)\
                   .first()
        
        if not result:
            return None
        
        job = result[0]  # Job object
        job.employer_name = result[1]  # employer_name
        job.applicant_count = result[2] or 0  # applicant_count
        
        return job
    
    @staticmethod
    def get_job_by_id_simple(db: Session, job_id: int) -> Optional[Job]:
        """
        Get a job by ID without additional information.
        
        Args:
            db: Database session
            job_id: Job ID
            
        Returns:
            Job object if found, None otherwise
        """
        return db.query(Job).filter(Job.id == job_id).first()
    
    @staticmethod
    def create_job(db: Session, employer_id: int, job_data: dict, skill_ids: List[int] = None) -> Job:
        """
        Create a new job.
        
        Args:
            db: Database session
            employer_id: Employer ID
            job_data: Job data
            skill_ids: Optional list of skill IDs
            
        Returns:
            Created Job object
        """
        # Create job record
        job = Job(
            employer_id=employer_id,
            **job_data
        )
        
        db.add(job)
        db.flush()  # Flush to get the job ID
        
        # Add skills if provided
        if skill_ids:
            skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            job.skills = skills
        
        db.commit()
        db.refresh(job)
        
        return job
    
    @staticmethod
    def update_job(db: Session, job_id: int, job_data: dict, skill_ids: List[int] = None) -> Optional[Job]:
        """
        Update a job.
        
        Args:
            db: Database session
            job_id: Job ID
            job_data: Job data
            skill_ids: Optional list of skill IDs
            
        Returns:
            Updated Job object if found, None otherwise
        """
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            return None
        
        # Update job fields
        for key, value in job_data.items():
            setattr(job, key, value)
        
        # Update skills if provided
        if skill_ids is not None:
            skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            job.skills = skills
        
        db.commit()
        db.refresh(job)
        
        return job
    
    @staticmethod
    def delete_job(db: Session, job_id: int) -> bool:
        """
        Delete a job.
        
        Args:
            db: Database session
            job_id: Job ID
            
        Returns:
            True if job was deleted, False otherwise
        """
        job = db.query(Job).filter(Job.id == job_id).first()
        
        if not job:
            return False
        
        db.delete(job)
        db.commit()
        
        return True
    
    @staticmethod
    def apply_to_job(db: Session, job_id: int, talent_id: int, application_data: dict) -> Optional[JobApplication]:
        """
        Apply to a job.
        
        Args:
            db: Database session
            job_id: Job ID
            talent_id: Talent ID
            application_data: Application data
            
        Returns:
            Created JobApplication object if successful, None otherwise
        """
        # Check if job exists and is active
        job = db.query(Job).filter(
            Job.id == job_id,
            Job.status == JobStatus.ACTIVE,
            Job.expiry_date >= datetime.utcnow()
        ).first()
        
        if not job:
            return None
        
        # Check if talent has already applied to this job
        existing_application = db.query(JobApplication).filter(
            JobApplication.job_id == job_id,
            JobApplication.talent_id == talent_id
        ).first()
        
        if existing_application:
            return None
        
        # Create application
        application = JobApplication(
            job_id=job_id,
            talent_id=talent_id,
            **application_data
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def get_job_applications(db: Session, job_id: int, skip: int = 0, limit: int = 100) -> List[JobApplication]:
        """
        Get applications for a job.
        
        Args:
            db: Database session
            job_id: Job ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of JobApplication objects
        """
        return db.query(JobApplication).filter(JobApplication.job_id == job_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_talent_applications(db: Session, talent_id: int, skip: int = 0, limit: int = 100) -> List[JobApplication]:
        """
        Get applications by a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of JobApplication objects
        """
        return db.query(JobApplication).filter(JobApplication.talent_id == talent_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_application_status(db: Session, application_id: int, status: ApplicationStatus) -> Optional[JobApplication]:
        """
        Update the status of a job application.
        
        Args:
            db: Database session
            application_id: Application ID
            status: New status
            
        Returns:
            Updated JobApplication object if found, None otherwise
        """
        application = db.query(JobApplication).filter(JobApplication.id == application_id).first()
        
        if not application:
            return None
        
        application.status = status
        application.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def get_employer_jobs(db: Session, employer_id: int, skip: int = 0, limit: int = 100, status: Optional[JobStatus] = None) -> List[Job]:
        """
        Get jobs posted by an employer.
        
        Args:
            db: Database session
            employer_id: Employer ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Optional status filter
            
        Returns:
            List of Job objects
        """
        query = db.query(Job).filter(Job.employer_id == employer_id)
        
        if status:
            query = query.filter(Job.status == status)
        
        return query.order_by(Job.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def archive_expired_jobs(db: Session) -> int:
        """
        Archive jobs that have passed their expiry date.
        
        Args:
            db: Database session
            
        Returns:
            Number of jobs archived
        """
        # Find active jobs that have expired
        expired_jobs = db.query(Job).filter(
            Job.status == JobStatus.ACTIVE,
            Job.expiry_date < datetime.utcnow()
        ).all()
        
        count = 0
        
        for job in expired_jobs:
            job.status = JobStatus.ARCHIVED
            count += 1
        
        db.commit()
        
        return count
    
    @staticmethod
    def get_job_stats(db: Session) -> dict:
        """
        Get job statistics.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with job statistics
        """
        total_active = db.query(func.count(Job.id)).filter(Job.status == JobStatus.ACTIVE).scalar()
        total_archived = db.query(func.count(Job.id)).filter(Job.status == JobStatus.ARCHIVED).scalar()
        total_draft = db.query(func.count(Job.id)).filter(Job.status == JobStatus.DRAFT).scalar()
        total_unpublished = db.query(func.count(Job.id)).filter(Job.status == JobStatus.UNPUBLISHED).scalar()
        
        return {
            "active": total_active,
            "archived": total_archived,
            "draft": total_draft,
            "unpublished": total_unpublished,
            "total": total_active + total_archived + total_draft + total_unpublished
        }