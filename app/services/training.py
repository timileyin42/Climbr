from sqlalchemy.orm import Session
from datetime import datetime
from typing import List, Optional, Dict, Any

from app.models.database_models import (
    Training, TrainingApplication, TrainingStatus, ApplicationStatus,
)
from app.repositories.training_repository import TrainingRepository, TrainingApplicationRepository


class TrainingService:
    @staticmethod
    def get_trainings(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Training]:
        repo = TrainingRepository(db)
        return repo.get_all(skip=skip, limit=limit, filters=filters)

    @staticmethod
    def get_trainings_count(
        db: Session, filters: Optional[Dict[str, Any]] = None
    ) -> int:
        repo = TrainingRepository(db)
        return repo.count(filters=filters)

    @staticmethod
    def get_training_by_id(db: Session, training_id: int) -> Optional[Training]:
        repo = TrainingRepository(db)
        return repo.get_by_id(training_id)

    @staticmethod
    def get_training_by_id_simple(
        db: Session, training_id: int
    ) -> Optional[Training]:
        repo = TrainingRepository(db)
        return repo.get_by_id_simple(training_id)

    @staticmethod
    def create_training(
        db: Session,
        trainer_id: int,
        training_data: dict,
        skill_ids: List[int] = None,
    ) -> Training:
        repo = TrainingRepository(db)
        return repo.create(trainer_id=trainer_id, skill_ids=skill_ids, **training_data)

    @staticmethod
    def update_training(
        db: Session,
        training_id: int,
        training_data: dict,
        skill_ids: List[int] = None,
    ) -> Optional[Training]:
        repo = TrainingRepository(db)
        training = repo.get_by_id_simple(training_id)
        if not training:
            return None
        return repo.update(training, skill_ids=skill_ids, **training_data)

    @staticmethod
    def delete_training(db: Session, training_id: int) -> bool:
        repo = TrainingRepository(db)
        training = repo.get_by_id_simple(training_id)
        if not training:
            return False
        repo.delete(training)
        return True

    @staticmethod
    def apply_to_training(
        db: Session, training_id: int, talent_id: int, application_data: dict
    ) -> Optional[TrainingApplication]:
        training_repo = TrainingRepository(db)
        training = training_repo.get_by_id_simple(training_id)
        if not training:
            return None
        if training.status != TrainingStatus.ACTIVE:
            return None
        if training.expiry_date and training.expiry_date < datetime.utcnow():
            return None

        app_repo = TrainingApplicationRepository(db)
        if app_repo.already_applied(training_id, talent_id):
            return None

        return app_repo.create(
            training_id=training_id,
            talent_id=talent_id,
            motivation=application_data.get("motivation"),
        )

    @staticmethod
    def get_training_applications(
        db: Session, training_id: int, skip: int = 0, limit: int = 100
    ) -> List[TrainingApplication]:
        repo = TrainingApplicationRepository(db)
        return repo.get_by_training(training_id, skip=skip, limit=limit)

    @staticmethod
    def get_talent_training_applications(
        db: Session, talent_id: int, skip: int = 0, limit: int = 100
    ) -> List[TrainingApplication]:
        repo = TrainingApplicationRepository(db)
        return repo.get_by_talent(talent_id, skip=skip, limit=limit)

    @staticmethod
    def update_application_status(
        db: Session, application_id: int, status: ApplicationStatus
    ) -> Optional[TrainingApplication]:
        repo = TrainingApplicationRepository(db)
        application = repo.get_by_id(application_id)
        if not application:
            return None
        return repo.update_status(application, status)

    @staticmethod
    def get_trainer_trainings(
        db: Session,
        trainer_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TrainingStatus] = None,
    ) -> List[Training]:
        repo = TrainingRepository(db)
        return repo.get_by_trainer(trainer_id, skip=skip, limit=limit, status=status)

    @staticmethod
    def archive_expired_trainings(db: Session) -> int:
        repo = TrainingRepository(db)
        return repo.archive_expired()

    @staticmethod
    def update_training_status(db: Session, training_id: int, status) -> Optional[Training]:
        repo = TrainingRepository(db)
        training = repo.get_by_id(training_id)
        if not training:
            return None
        return repo.update(training, status=status)

    @staticmethod
    def get_training_stats(db: Session) -> dict:
        repo = TrainingRepository(db)
        return repo.get_stats()
