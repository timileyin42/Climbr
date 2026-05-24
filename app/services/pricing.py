from sqlalchemy.orm import Session
from typing import List, Optional

from app.models.database_models import JobPricing, TrainingPricing
from app.repositories.pricing_repository import JobPricingRepository, TrainingPricingRepository


class PricingService:
    # ------------------------------------------------------------------
    # Job pricing
    # ------------------------------------------------------------------

    @staticmethod
    def get_job_pricing_packages(db: Session, active_only: bool = True) -> List[JobPricing]:
        repo = JobPricingRepository(db)
        return repo.get_job_packages(active_only=active_only)

    @staticmethod
    def get_job_pricing_package_by_id(
        db: Session, package_id: int
    ) -> Optional[JobPricing]:
        repo = JobPricingRepository(db)
        return repo.get_job_package_by_id(package_id)

    @staticmethod
    def get_job_pricing_by_id(db: Session, pricing_id: int) -> Optional[JobPricing]:
        repo = JobPricingRepository(db)
        return repo.get_job_package_by_id(pricing_id)

    @staticmethod
    def create_job_pricing(
        db: Session,
        name: str,
        quantity: int,
        price: float,
        currency: str = "GBP",
    ) -> JobPricing:
        repo = JobPricingRepository(db)
        return repo.create_job_package(
            name=name, quantity=quantity, price=price, currency=currency, is_active=True
        )

    @staticmethod
    def update_job_pricing(
        db: Session, pricing_id: int, pricing_data: dict
    ) -> Optional[JobPricing]:
        repo = JobPricingRepository(db)
        pkg = repo.get_job_package_by_id(pricing_id)
        if not pkg:
            return None
        return repo.update_job_package(pkg, **pricing_data)

    @staticmethod
    def delete_job_pricing(db: Session, pricing_id: int) -> bool:
        repo = JobPricingRepository(db)
        pkg = repo.get_job_package_by_id(pricing_id)
        if not pkg:
            return False
        repo.delete_job_package(pkg)
        return True

    # ------------------------------------------------------------------
    # Training pricing
    # ------------------------------------------------------------------

    @staticmethod
    def get_training_pricing_packages(
        db: Session, active_only: bool = True
    ) -> List[TrainingPricing]:
        repo = TrainingPricingRepository(db)
        return repo.get_training_packages(active_only=active_only)

    @staticmethod
    def get_training_pricing_package_by_id(
        db: Session, package_id: int
    ) -> Optional[TrainingPricing]:
        repo = TrainingPricingRepository(db)
        return repo.get_training_package_by_id(package_id)

    @staticmethod
    def get_training_pricing_by_id(
        db: Session, pricing_id: int
    ) -> Optional[TrainingPricing]:
        repo = TrainingPricingRepository(db)
        return repo.get_training_package_by_id(pricing_id)

    @staticmethod
    def create_training_pricing(
        db: Session,
        name: str,
        quantity: int,
        price: float,
        currency: str = "GBP",
    ) -> TrainingPricing:
        repo = TrainingPricingRepository(db)
        return repo.create_training_package(
            name=name, quantity=quantity, price=price, currency=currency, is_active=True
        )

    @staticmethod
    def update_training_pricing(
        db: Session, pricing_id: int, pricing_data: dict
    ) -> Optional[TrainingPricing]:
        repo = TrainingPricingRepository(db)
        pkg = repo.get_training_package_by_id(pricing_id)
        if not pkg:
            return None
        return repo.update_training_package(pkg, **pricing_data)

    @staticmethod
    def delete_training_pricing(db: Session, pricing_id: int) -> bool:
        repo = TrainingPricingRepository(db)
        pkg = repo.get_training_package_by_id(pricing_id)
        if not pkg:
            return False
        repo.delete_training_package(pkg)
        return True
