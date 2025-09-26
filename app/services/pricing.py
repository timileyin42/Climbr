from sqlalchemy.orm import Session
from typing import List, Optional

# Import models
from app.models.database_models import JobPricing, TrainingPricing

class PricingService:
    @staticmethod
    def get_job_pricing_packages(db: Session, active_only: bool = True) -> List[JobPricing]:
        """
        Get job pricing packages.
        
        Args:
            db: Database session
            active_only: If True, only return active packages
            
        Returns:
            List of JobPricing objects
        """
        query = db.query(JobPricing)
        
        if active_only:
            query = query.filter(JobPricing.is_active == True)
        
        return query.order_by(JobPricing.quantity.asc()).all()
    
    @staticmethod
    def get_job_pricing_package_by_id(db: Session, package_id: int) -> Optional[JobPricing]:
        """
        Get a specific job pricing package by ID.
        
        Args:
            db: Database session
            package_id: ID of the pricing package
            
        Returns:
            JobPricing object or None if not found
        """
        return db.query(JobPricing).filter(JobPricing.id == package_id).first()
    
    @staticmethod
    def get_training_pricing_package_by_id(db: Session, package_id: int) -> Optional[TrainingPricing]:
        """
        Get a specific training pricing package by ID.
        
        Args:
            db: Database session
            package_id: ID of the pricing package
            
        Returns:
            TrainingPricing object or None if not found
        """
        return db.query(TrainingPricing).filter(TrainingPricing.id == package_id).first()
    
    @staticmethod
    def get_job_pricing_by_id(db: Session, pricing_id: int) -> Optional[JobPricing]:
        """
        Get a job pricing package by ID.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            
        Returns:
            JobPricing object if found, None otherwise
        """
        return db.query(JobPricing).filter(JobPricing.id == pricing_id).first()
    
    @staticmethod
    def create_job_pricing(db: Session, name: str, quantity: int, price: float, currency: str = "GBP") -> JobPricing:
        """
        Create a new job pricing package.
        
        Args:
            db: Database session
            name: Package name
            quantity: Number of jobs included
            price: Package price
            currency: Currency code (default: GBP)
            
        Returns:
            Created JobPricing object
        """
        # Create job pricing record
        job_pricing = JobPricing(
            name=name,
            quantity=quantity,
            price=price,
            currency=currency,
            is_active=True
        )
        
        db.add(job_pricing)
        db.commit()
        db.refresh(job_pricing)
        
        return job_pricing
    
    @staticmethod
    def update_job_pricing(db: Session, pricing_id: int, pricing_data: dict) -> Optional[JobPricing]:
        """
        Update a job pricing package.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            pricing_data: Pricing data
            
        Returns:
            Updated JobPricing object if found, None otherwise
        """
        pricing = db.query(JobPricing).filter(JobPricing.id == pricing_id).first()
        
        if not pricing:
            return None
        
        # Update pricing fields
        for key, value in pricing_data.items():
            setattr(pricing, key, value)
        
        db.commit()
        db.refresh(pricing)
        
        return pricing
    
    @staticmethod
    def delete_job_pricing(db: Session, pricing_id: int) -> bool:
        """
        Delete a job pricing package.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            
        Returns:
            True if pricing was deleted, False otherwise
        """
        pricing = db.query(JobPricing).filter(JobPricing.id == pricing_id).first()
        
        if not pricing:
            return False
        
        db.delete(pricing)
        db.commit()
        
        return True
    
    @staticmethod
    def get_training_pricing_packages(db: Session, active_only: bool = True) -> List[TrainingPricing]:
        """
        Get training pricing packages.
        
        Args:
            db: Database session
            active_only: If True, only return active packages
            
        Returns:
            List of TrainingPricing objects
        """
        query = db.query(TrainingPricing)
        
        if active_only:
            query = query.filter(TrainingPricing.is_active == True)
        
        return query.order_by(TrainingPricing.quantity.asc()).all()
    
    @staticmethod
    def get_training_pricing_by_id(db: Session, pricing_id: int) -> Optional[TrainingPricing]:
        """
        Get a training pricing package by ID.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            
        Returns:
            TrainingPricing object if found, None otherwise
        """
        return db.query(TrainingPricing).filter(TrainingPricing.id == pricing_id).first()
    
    @staticmethod
    def create_training_pricing(db: Session, name: str, quantity: int, price: float, currency: str = "GBP") -> TrainingPricing:
        """
        Create a new training pricing package.
        
        Args:
            db: Database session
            name: Package name
            quantity: Number of trainings included
            price: Package price
            currency: Currency code (default: GBP)
            
        Returns:
            Created TrainingPricing object
        """
        # Create training pricing record
        training_pricing = TrainingPricing(
            name=name,
            quantity=quantity,
            price=price,
            currency=currency,
            is_active=True
        )
        
        db.add(training_pricing)
        db.commit()
        db.refresh(training_pricing)
        
        return training_pricing
    
    @staticmethod
    def update_training_pricing(db: Session, pricing_id: int, pricing_data: dict) -> Optional[TrainingPricing]:
        """
        Update a training pricing package.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            pricing_data: Pricing data
            
        Returns:
            Updated TrainingPricing object if found, None otherwise
        """
        pricing = db.query(TrainingPricing).filter(TrainingPricing.id == pricing_id).first()
        
        if not pricing:
            return None
        
        # Update pricing fields
        for key, value in pricing_data.items():
            setattr(pricing, key, value)
        
        db.commit()
        db.refresh(pricing)
        
        return pricing
    
    @staticmethod
    def delete_training_pricing(db: Session, pricing_id: int) -> bool:
        """
        Delete a training pricing package.
        
        Args:
            db: Database session
            pricing_id: Pricing ID
            
        Returns:
            True if pricing was deleted, False otherwise
        """
        pricing = db.query(TrainingPricing).filter(TrainingPricing.id == pricing_id).first()
        
        if not pricing:
            return False
        
        db.delete(pricing)
        db.commit()
        
        return True