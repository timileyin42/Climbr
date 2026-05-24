from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.database_models import JobPricing, TrainingPricing
from app.repositories.base import BaseRepository


class JobPricingRepository(BaseRepository[JobPricing]):
    def __init__(self, db: Session):
        super().__init__(db, JobPricing)

    def get_job_packages(self, active_only: bool = True) -> List[JobPricing]:
        query = self.db.query(JobPricing)
        if active_only:
            query = query.filter(JobPricing.is_active == True)
        return query.order_by(JobPricing.quantity.asc()).all()

    def get_job_package_by_id(self, id: int) -> Optional[JobPricing]:
        return self.db.query(JobPricing).filter(JobPricing.id == id).first()

    def create_job_package(self, **data) -> JobPricing:
        pkg = JobPricing(**data)
        self.db.add(pkg)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def update_job_package(self, pkg: JobPricing, **data) -> JobPricing:
        for key, value in data.items():
            setattr(pkg, key, value)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def delete_job_package(self, pkg: JobPricing) -> None:
        self.db.delete(pkg)
        self.db.commit()


class TrainingPricingRepository(BaseRepository[TrainingPricing]):
    def __init__(self, db: Session):
        super().__init__(db, TrainingPricing)

    def get_training_packages(self, active_only: bool = True) -> List[TrainingPricing]:
        query = self.db.query(TrainingPricing)
        if active_only:
            query = query.filter(TrainingPricing.is_active == True)
        return query.order_by(TrainingPricing.quantity.asc()).all()

    def get_training_package_by_id(self, id: int) -> Optional[TrainingPricing]:
        return (
            self.db.query(TrainingPricing).filter(TrainingPricing.id == id).first()
        )

    def create_training_package(self, **data) -> TrainingPricing:
        pkg = TrainingPricing(**data)
        self.db.add(pkg)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def update_training_package(self, pkg: TrainingPricing, **data) -> TrainingPricing:
        for key, value in data.items():
            setattr(pkg, key, value)
        self.db.commit()
        self.db.refresh(pkg)
        return pkg

    def delete_training_package(self, pkg: TrainingPricing) -> None:
        self.db.delete(pkg)
        self.db.commit()
