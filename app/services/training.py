from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any

# Import models
from app.models.database_models import Training, TrainingApplication, Trainer, Talent, Skill, TrainingStatus, ApplicationStatus, DeliveryMethod

class TrainingService:
    @staticmethod
    def get_trainings(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None) -> List[Training]:
        """
        Get trainings with optional filtering, including trainer information and applicant count.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            
        Returns:
            List of Training objects with additional attributes
        """
        # Join with Trainer and TrainingApplication tables
        query = db.query(Training, Trainer.company_name.label('trainer_name'), 
                        func.count(TrainingApplication.id).label('applicant_count'))\
                  .join(Trainer)\
                  .outerjoin(TrainingApplication)\
                  .filter(Training.status == TrainingStatus.ACTIVE)\
                  .group_by(Training.id, Trainer.company_name)
        
        if filters:
            # Apply filters if provided
            if filters.get("delivery_method"):
                query = query.filter(Training.delivery_method == filters["delivery_method"])
            
            if filters.get("category"):
                query = query.filter(Training.category.ilike(f"%{filters['category']}%"))
            
            if filters.get("location"):
                query = query.filter(Training.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Training.title.ilike(search_term),
                        Training.description.ilike(search_term),
                        Trainer.company_name.ilike(search_term)
                    )
                )
            
            if filters.get("trainer_id"):
                query = query.filter(Training.trainer_id == filters["trainer_id"])
            
            if filters.get("cost_min"):
                query = query.filter(Training.cost >= filters["cost_min"])
            
            if filters.get("cost_max"):
                query = query.filter(Training.cost <= filters["cost_max"])
            
            if filters.get("start_date_after"):
                query = query.filter(Training.start_date >= filters["start_date_after"])
            
            if filters.get("start_date_before"):
                query = query.filter(Training.start_date <= filters["start_date_before"])
            
            if filters.get("skills"):
                # Filter by skills
                skill_ids = filters["skills"]
                query = query.join(Training.skills).filter(Skill.id.in_(skill_ids))
        
        # Apply sorting
        sort_by = filters.get("sort_by", "date") if filters else "date"
        if sort_by == "cost":
            query = query.order_by(Training.cost.asc())
        elif sort_by == "date":
            query = query.order_by(Training.start_date.asc())
        else:
            query = query.order_by(Training.created_at.desc())
        
        results = query.offset(skip).limit(limit).all()
        
        # Process results to add trainer_name and applicant_count to Training objects
        trainings = []
        for result in results:
            training = result[0]  # Training object
            training.trainer_name = result[1]  # trainer_name
            training.applicant_count = result[2] or 0  # applicant_count
            trainings.append(training)
        
        return trainings
    
    @staticmethod
    def get_trainings_count(db: Session, filters: Optional[Dict[str, Any]] = None) -> int:
        """
        Get count of trainings with optional filtering.
        
        Args:
            db: Database session
            filters: Optional filters
            
        Returns:
            Count of trainings
        """
        query = db.query(Training).filter(Training.status == TrainingStatus.ACTIVE)
        
        if filters:
            if filters.get("delivery_method"):
                query = query.filter(Training.delivery_method == filters["delivery_method"])
            
            if filters.get("category"):
                query = query.filter(Training.category.ilike(f"%{filters['category']}%"))
            
            if filters.get("location"):
                query = query.filter(Training.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("search"):
                search_term = f"%{filters['search']}%"
                query = query.join(Trainer).filter(
                    or_(
                        Training.title.ilike(search_term),
                        Training.description.ilike(search_term),
                        Trainer.company_name.ilike(search_term)
                    )
                )
            
            if filters.get("trainer_id"):
                query = query.filter(Training.trainer_id == filters["trainer_id"])
            
            if filters.get("cost_min"):
                query = query.filter(Training.cost >= filters["cost_min"])
            
            if filters.get("cost_max"):
                query = query.filter(Training.cost <= filters["cost_max"])
            
            if filters.get("start_date_after"):
                query = query.filter(Training.start_date >= filters["start_date_after"])
            
            if filters.get("start_date_before"):
                query = query.filter(Training.start_date <= filters["start_date_before"])
            
            if filters.get("skills"):
                skill_ids = filters["skills"]
                query = query.join(Training.skills).filter(Skill.id.in_(skill_ids)).group_by(Training.id)
        
        return query.count()
    
    @staticmethod
    def get_training_by_id(db: Session, training_id: int) -> Optional[Training]:
        """
        Get a training by ID with trainer information.
        
        Args:
            db: Database session
            training_id: Training ID
            
        Returns:
            Training object if found, None otherwise
        """
        result = db.query(Training, Trainer.company_name.label('trainer_name'), 
                         func.count(TrainingApplication.id).label('applicant_count'))\
                   .join(Trainer)\
                   .outerjoin(TrainingApplication)\
                   .filter(Training.id == training_id)\
                   .group_by(Training.id, Trainer.company_name)\
                   .first()
        
        if not result:
            return None
        
        training = result[0]  # Training object
        training.trainer_name = result[1]  # trainer_name
        training.applicant_count = result[2] or 0  # applicant_count
        
        return training
    
    @staticmethod
    def get_training_by_id_simple(db: Session, training_id: int) -> Optional[Training]:
        """
        Get a training by ID without additional information.
        
        Args:
            db: Database session
            training_id: Training ID
            
        Returns:
            Training object if found, None otherwise
        """
        return db.query(Training).filter(Training.id == training_id).first()
    
    @staticmethod
    def create_training(db: Session, trainer_id: int, training_data: dict, skill_ids: List[int] = None) -> Training:
        """
        Create a new training.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            training_data: Training data
            skill_ids: Optional list of skill IDs
            
        Returns:
            Created Training object
        """
        # Create training record
        training = Training(
            trainer_id=trainer_id,
            **training_data
        )
        
        db.add(training)
        db.flush()  # Flush to get the training ID
        
        # Add skills if provided
        if skill_ids:
            skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            training.skills = skills
        
        db.commit()
        db.refresh(training)
        
        return training
    
    @staticmethod
    def update_training(db: Session, training_id: int, training_data: dict, skill_ids: List[int] = None) -> Optional[Training]:
        """
        Update a training.
        
        Args:
            db: Database session
            training_id: Training ID
            training_data: Training data
            skill_ids: Optional list of skill IDs
            
        Returns:
            Updated Training object if found, None otherwise
        """
        training = db.query(Training).filter(Training.id == training_id).first()
        
        if not training:
            return None
        
        # Update training fields
        for key, value in training_data.items():
            setattr(training, key, value)
        
        # Update skills if provided
        if skill_ids is not None:
            skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            training.skills = skills
        
        db.commit()
        db.refresh(training)
        
        return training
    
    @staticmethod
    def delete_training(db: Session, training_id: int) -> bool:
        """
        Delete a training.
        
        Args:
            db: Database session
            training_id: Training ID
            
        Returns:
            True if training was deleted, False otherwise
        """
        training = db.query(Training).filter(Training.id == training_id).first()
        
        if not training:
            return False
        
        db.delete(training)
        db.commit()
        
        return True
    
    @staticmethod
    def apply_to_training(db: Session, training_id: int, talent_id: int, application_data: dict) -> Optional[TrainingApplication]:
        """
        Apply to a training.
        
        Args:
            db: Database session
            training_id: Training ID
            talent_id: Talent ID
            application_data: Application data
            
        Returns:
            Created TrainingApplication object if successful, None otherwise
        """
        # Check if training exists and is active
        training = db.query(Training).filter(
            Training.id == training_id,
            Training.status == TrainingStatus.ACTIVE,
            Training.expiry_date >= datetime.utcnow()
        ).first()
        
        if not training:
            return None
        
        # Check if talent has already applied to this training
        existing_application = db.query(TrainingApplication).filter(
            TrainingApplication.training_id == training_id,
            TrainingApplication.talent_id == talent_id
        ).first()
        
        if existing_application:
            return None
        
        # Create application
        application = TrainingApplication(
            training_id=training_id,
            talent_id=talent_id,
            **application_data
        )
        
        db.add(application)
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def get_training_applications(db: Session, training_id: int, skip: int = 0, limit: int = 100) -> List[TrainingApplication]:
        """
        Get applications for a training.
        
        Args:
            db: Database session
            training_id: Training ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of TrainingApplication objects
        """
        return db.query(TrainingApplication).filter(TrainingApplication.training_id == training_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_talent_training_applications(db: Session, talent_id: int, skip: int = 0, limit: int = 100) -> List[TrainingApplication]:
        """
        Get training applications by a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            
        Returns:
            List of TrainingApplication objects
        """
        return db.query(TrainingApplication).filter(TrainingApplication.talent_id == talent_id).offset(skip).limit(limit).all()
    
    @staticmethod
    def update_application_status(db: Session, application_id: int, status: ApplicationStatus) -> Optional[TrainingApplication]:
        """
        Update the status of a training application.
        
        Args:
            db: Database session
            application_id: Application ID
            status: New status
            
        Returns:
            Updated TrainingApplication object if found, None otherwise
        """
        application = db.query(TrainingApplication).filter(TrainingApplication.id == application_id).first()
        
        if not application:
            return None
        
        application.status = status
        application.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(application)
        
        return application
    
    @staticmethod
    def get_trainer_trainings(db: Session, trainer_id: int, skip: int = 0, limit: int = 100, status: Optional[TrainingStatus] = None) -> List[Training]:
        """
        Get trainings posted by a trainer.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            skip: Number of records to skip
            limit: Maximum number of records to return
            status: Optional status filter
            
        Returns:
            List of Training objects
        """
        query = db.query(Training).filter(Training.trainer_id == trainer_id)
        
        if status:
            query = query.filter(Training.status == status)
        
        return query.order_by(Training.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def archive_expired_trainings(db: Session) -> int:
        """
        Archive trainings that have passed their expiry date.
        
        Args:
            db: Database session
            
        Returns:
            Number of trainings archived
        """
        # Find active trainings that have expired
        expired_trainings = db.query(Training).filter(
            Training.status == TrainingStatus.ACTIVE,
            Training.expiry_date < datetime.utcnow()
        ).all()
        
        count = 0
        
        for training in expired_trainings:
            training.status = TrainingStatus.ARCHIVED
            count += 1
        
        db.commit()
        
        return count
    
    @staticmethod
    def get_training_stats(db: Session) -> dict:
        """
        Get training statistics.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with training statistics
        """
        total_active = db.query(func.count(Training.id)).filter(Training.status == TrainingStatus.ACTIVE).scalar()
        total_archived = db.query(func.count(Training.id)).filter(Training.status == TrainingStatus.ARCHIVED).scalar()
        total_draft = db.query(func.count(Training.id)).filter(Training.status == TrainingStatus.DRAFT).scalar()
        total_unpublished = db.query(func.count(Training.id)).filter(Training.status == TrainingStatus.UNPUBLISHED).scalar()
        
        return {
            "active": total_active,
            "archived": total_archived,
            "draft": total_draft,
            "unpublished": total_unpublished,
            "total": total_active + total_archived + total_draft + total_unpublished
        }