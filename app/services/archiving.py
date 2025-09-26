from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging
from sqlalchemy.orm import Session
from sqlalchemy import and_
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

from app.models.database_models import Job, Training, JobStatus, TrainingStatus
from app.database import get_db

logger = logging.getLogger(__name__)

class ArchivingService:
    """
    Service for handling auto-archiving of jobs and trainings.
    """
    
    @staticmethod
    async def check_and_archive_expired_jobs(db: Session) -> int:
        """
        Check for expired jobs and archive them.
        
        Args:
            db: Database session
            
        Returns:
            Number of jobs archived
        """
        current_date = datetime.now()
        
        logger.info(f"Checking for jobs with expiry date before {current_date}")
        
        # Query for active jobs that have passed their expiry date
        expired_jobs = db.query(Job).filter(
            and_(
                Job.status == JobStatus.ACTIVE,
                Job.expiry_date < current_date
            )
        ).all()
        
        archived_count = 0
        
        # Archive each expired job
        for job in expired_jobs:
            job.status = JobStatus.ARCHIVED
            job.updated_at = current_date
            archived_count += 1
            logger.debug(f"Archived job ID {job.id}: {job.title}")
        
        # Commit the changes
        if archived_count > 0:
            db.commit()
        
        logger.info(f"Archived {archived_count} expired jobs")
        
        return archived_count
    
    @staticmethod
    async def check_and_archive_expired_trainings(db: Session) -> int:
        """
        Check for expired trainings and archive them.
        
        Args:
            db: Database session
            
        Returns:
            Number of trainings archived
        """
        current_date = datetime.now()
        
        logger.info(f"Checking for trainings with expiry date before {current_date}")
        
        # Query for active trainings that have passed their expiry date
        expired_trainings = db.query(Training).filter(
            and_(
                Training.status == TrainingStatus.ACTIVE,
                Training.expiry_date < current_date
            )
        ).all()
        
        archived_count = 0
        
        # Archive each expired training
        for training in expired_trainings:
            training.status = TrainingStatus.ARCHIVED
            training.updated_at = current_date
            archived_count += 1
            logger.debug(f"Archived training ID {training.id}: {training.title}")
        
        # Commit the changes
        if archived_count > 0:
            db.commit()
        
        logger.info(f"Archived {archived_count} expired trainings")
        
        return archived_count
    
    @staticmethod
    async def get_archived_jobs(db: Session, skip: int = 0, limit: int = 100) -> List[Job]:
        """
        Get archived jobs.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of archived Job objects
        """
        return db.query(Job).filter(
            Job.status == JobStatus.ARCHIVED
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def get_archived_trainings(db: Session, skip: int = 0, limit: int = 100) -> List[Training]:
        """
        Get archived trainings.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of archived Training objects
        """
        return db.query(Training).filter(
            Training.status == TrainingStatus.ARCHIVED
        ).offset(skip).limit(limit).all()
    
    @staticmethod
    async def restore_job(db: Session, job_id: int) -> bool:
        """
        Restore an archived job to active status.
        
        Args:
            db: Database session
            job_id: ID of the job to restore
            
        Returns:
            True if job was restored, False if not found or not archived
        """
        job = db.query(Job).filter(
            and_(
                Job.id == job_id,
                Job.status == JobStatus.ARCHIVED
            )
        ).first()
        
        if job:
            job.status = JobStatus.ACTIVE
            job.updated_at = datetime.now()
            # Extend expiry date by 30 days from now
            job.expiry_date = datetime.now() + timedelta(days=30)
            db.commit()
            logger.info(f"Restored job ID {job_id}: {job.title}")
            return True
        
        return False
    
    @staticmethod
    async def restore_training(db: Session, training_id: int) -> bool:
        """
        Restore an archived training to active status.
        
        Args:
            db: Database session
            training_id: ID of the training to restore
            
        Returns:
            True if training was restored, False if not found or not archived
        """
        training = db.query(Training).filter(
            and_(
                Training.id == training_id,
                Training.status == TrainingStatus.ARCHIVED
            )
        ).first()
        
        if training:
            training.status = TrainingStatus.ACTIVE
            training.updated_at = datetime.now()
            # Extend expiry date by 30 days from now
            training.expiry_date = datetime.now() + timedelta(days=30)
            db.commit()
            logger.info(f"Restored training ID {training_id}: {training.title}")
            return True
        
        return False
    
    @staticmethod
    async def setup_scheduled_archiving(app) -> None:
        """
        Set up scheduled archiving tasks using APScheduler.
        
        Args:
            app: FastAPI application instance
        """
        scheduler = AsyncIOScheduler()
        
        # Schedule job archiving to run daily at midnight
        scheduler.add_job(
            ArchivingService._run_job_archiving,
            CronTrigger(hour=0, minute=0),
            id="archive_expired_jobs",
            name="Archive expired jobs",
            replace_existing=True
        )
        
        # Schedule training archiving to run daily at 1 AM
        scheduler.add_job(
            ArchivingService._run_training_archiving,
            CronTrigger(hour=1, minute=0),
            id="archive_expired_trainings",
            name="Archive expired trainings",
            replace_existing=True
        )
        
        # Start the scheduler
        scheduler.start()
        
        # Store scheduler in app state to prevent garbage collection
        app.state.scheduler = scheduler
        
        logger.info("Scheduled archiving tasks set up successfully")
    
    @staticmethod
    async def _run_job_archiving():
        """
        Background task to archive expired jobs.
        """
        db = None
        try:
            # Create a new database session
            db_generator = get_db()
            db = next(db_generator)
            
            # Run the archiving process
            archived_count = await ArchivingService.check_and_archive_expired_jobs(db)
            logger.info(f"Scheduled job archiving completed: {archived_count} jobs archived")
        except Exception as e:
            logger.error(f"Error in scheduled job archiving: {str(e)}")
        finally:
            # Ensure the database session is closed
            if db:
                db.close()
    
    @staticmethod
    async def _run_training_archiving():
        """
        Background task to archive expired trainings.
        """
        db = None
        try:
            # Create a new database session
            db_generator = get_db()
            db = next(db_generator)
            
            # Run the archiving process
            archived_count = await ArchivingService.check_and_archive_expired_trainings(db)
            logger.info(f"Scheduled training archiving completed: {archived_count} trainings archived")
        except Exception as e:
            logger.error(f"Error in scheduled training archiving: {str(e)}")
        finally:
            # Ensure the database session is closed
            if db:
                db.close()