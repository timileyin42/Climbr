from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import or_, func, desc

from app.models.database_models import (
    Training, TrainingApplication, Trainer, Skill,
    TrainingStatus, ApplicationStatus,
)
from app.repositories.base import BaseRepository


class TrainingRepository(BaseRepository[Training]):
    def __init__(self, db: Session):
        super().__init__(db, Training)

    def get_all(
        self, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None
    ) -> List[Training]:
        query = (
            self.db.query(
                Training,
                Trainer.provider_name.label("trainer_name"),
                func.count(TrainingApplication.id).label("applicant_count"),
            )
            .join(Trainer)
            .outerjoin(TrainingApplication)
            .filter(Training.status == TrainingStatus.ACTIVE)
            .group_by(Training.id, Trainer.provider_name)
        )

        if filters:
            if filters.get("delivery_method"):
                query = query.filter(
                    Training.delivery_method == filters["delivery_method"]
                )

            if filters.get("category"):
                query = query.filter(
                    Training.category.ilike(f"%{filters['category']}%")
                )

            if filters.get("location"):
                query = query.filter(
                    Training.location.ilike(f"%{filters['location']}%")
                )

            if filters.get("search"):
                term = f"%{filters['search']}%"
                query = query.filter(
                    or_(
                        Training.title.ilike(term),
                        Training.description.ilike(term),
                        Trainer.provider_name.ilike(term),
                    )
                )

            if filters.get("trainer_id"):
                query = query.filter(Training.trainer_id == filters["trainer_id"])

            if filters.get("cost_min"):
                query = query.filter(Training.cost >= filters["cost_min"])

            if filters.get("cost_max"):
                query = query.filter(Training.cost <= filters["cost_max"])

            if filters.get("start_date_after"):
                query = query.filter(
                    Training.start_date >= filters["start_date_after"]
                )

            if filters.get("start_date_before"):
                query = query.filter(
                    Training.start_date <= filters["start_date_before"]
                )

            if filters.get("skills"):
                skill_ids = filters["skills"]
                query = query.join(Training.skills).filter(Skill.id.in_(skill_ids))

        sort_by = filters.get("sort_by", "date") if filters else "date"
        if sort_by == "cost":
            query = query.order_by(Training.cost.asc())
        elif sort_by == "date":
            query = query.order_by(Training.start_date.asc())
        else:
            query = query.order_by(desc(Training.created_at))

        results = query.offset(skip).limit(limit).all()
        trainings = []
        for result in results:
            training = result[0]
            training.trainer_name = result[1]
            training.applicant_count = result[2] or 0
            trainings.append(training)
        return trainings

    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        query = self.db.query(Training).filter(
            Training.status == TrainingStatus.ACTIVE
        )

        if filters:
            if filters.get("delivery_method"):
                query = query.filter(
                    Training.delivery_method == filters["delivery_method"]
                )

            if filters.get("category"):
                query = query.filter(
                    Training.category.ilike(f"%{filters['category']}%")
                )

            if filters.get("location"):
                query = query.filter(
                    Training.location.ilike(f"%{filters['location']}%")
                )

            if filters.get("search"):
                term = f"%{filters['search']}%"
                query = query.join(Trainer).filter(
                    or_(
                        Training.title.ilike(term),
                        Training.description.ilike(term),
                        Trainer.provider_name.ilike(term),
                    )
                )

            if filters.get("trainer_id"):
                query = query.filter(Training.trainer_id == filters["trainer_id"])

            if filters.get("cost_min"):
                query = query.filter(Training.cost >= filters["cost_min"])

            if filters.get("cost_max"):
                query = query.filter(Training.cost <= filters["cost_max"])

            if filters.get("start_date_after"):
                query = query.filter(
                    Training.start_date >= filters["start_date_after"]
                )

            if filters.get("start_date_before"):
                query = query.filter(
                    Training.start_date <= filters["start_date_before"]
                )

            if filters.get("skills"):
                skill_ids = filters["skills"]
                query = (
                    query.join(Training.skills)
                    .filter(Skill.id.in_(skill_ids))
                    .group_by(Training.id)
                )

        return query.count()

    def get_by_id(self, training_id: int) -> Optional[Training]:
        result = (
            self.db.query(
                Training,
                Trainer.provider_name.label("trainer_name"),
                func.count(TrainingApplication.id).label("applicant_count"),
            )
            .join(Trainer)
            .outerjoin(TrainingApplication)
            .filter(Training.id == training_id)
            .group_by(Training.id, Trainer.provider_name)
            .first()
        )
        if not result:
            return None
        training = result[0]
        training.trainer_name = result[1]
        training.applicant_count = result[2] or 0
        return training

    def get_by_id_simple(self, training_id: int) -> Optional[Training]:
        return self.db.query(Training).filter(Training.id == training_id).first()

    def get_by_trainer(
        self,
        trainer_id: int,
        skip: int = 0,
        limit: int = 100,
        status: Optional[TrainingStatus] = None,
    ) -> List[Training]:
        query = self.db.query(Training).filter(Training.trainer_id == trainer_id)
        if status:
            query = query.filter(Training.status == status)
        return query.order_by(desc(Training.created_at)).offset(skip).limit(limit).all()

    def create(
        self, trainer_id: int, skill_ids: Optional[List[int]] = None, **data
    ) -> Training:
        training = Training(trainer_id=trainer_id, **data)
        self.db.add(training)
        self.db.flush()
        if skill_ids:
            skills = self.db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            training.skills = skills
        self.db.commit()
        self.db.refresh(training)
        return training

    def update(
        self, training: Training, skill_ids: Optional[List[int]] = None, **data
    ) -> Training:
        for key, value in data.items():
            setattr(training, key, value)
        if skill_ids is not None:
            skills = self.db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
            training.skills = skills
        self.db.commit()
        self.db.refresh(training)
        return training

    def delete(self, training: Training) -> None:
        self.db.delete(training)
        self.db.commit()

    def archive_expired(self) -> int:
        expired = (
            self.db.query(Training)
            .filter(
                Training.status == TrainingStatus.ACTIVE,
                Training.expiry_date < datetime.utcnow(),
            )
            .all()
        )
        count = 0
        for training in expired:
            training.status = TrainingStatus.ARCHIVED
            count += 1
        self.db.commit()
        return count

    def get_stats(self) -> Dict[str, int]:
        active = (
            self.db.query(func.count(Training.id))
            .filter(Training.status == TrainingStatus.ACTIVE)
            .scalar()
        )
        archived = (
            self.db.query(func.count(Training.id))
            .filter(Training.status == TrainingStatus.ARCHIVED)
            .scalar()
        )
        draft = (
            self.db.query(func.count(Training.id))
            .filter(Training.status == TrainingStatus.DRAFT)
            .scalar()
        )
        unpublished = (
            self.db.query(func.count(Training.id))
            .filter(Training.status == TrainingStatus.UNPUBLISHED)
            .scalar()
        )
        return {
            "active": active,
            "archived": archived,
            "draft": draft,
            "unpublished": unpublished,
            "total": active + archived + draft + unpublished,
        }


class TrainingApplicationRepository(BaseRepository[TrainingApplication]):
    def __init__(self, db: Session):
        super().__init__(db, TrainingApplication)

    def get_by_id(self, id: int) -> Optional[TrainingApplication]:
        return (
            self.db.query(TrainingApplication)
            .filter(TrainingApplication.id == id)
            .first()
        )

    def get_by_training(
        self, training_id: int, skip: int = 0, limit: int = 100
    ) -> List[TrainingApplication]:
        return (
            self.db.query(TrainingApplication)
            .filter(TrainingApplication.training_id == training_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_talent(
        self, talent_id: int, skip: int = 0, limit: int = 100
    ) -> List[TrainingApplication]:
        return (
            self.db.query(TrainingApplication)
            .filter(TrainingApplication.talent_id == talent_id)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def count_by_talent(self, talent_id: int) -> int:
        return (
            self.db.query(TrainingApplication)
            .filter(TrainingApplication.talent_id == talent_id)
            .count()
        )

    def already_applied(self, training_id: int, talent_id: int) -> bool:
        return (
            self.db.query(TrainingApplication)
            .filter(
                TrainingApplication.training_id == training_id,
                TrainingApplication.talent_id == talent_id,
            )
            .first()
        ) is not None

    def create(
        self,
        training_id: int,
        talent_id: int,
        motivation: Optional[str] = None,
    ) -> TrainingApplication:
        application = TrainingApplication(
            training_id=training_id,
            talent_id=talent_id,
            motivation=motivation,
        )
        self.db.add(application)
        self.db.commit()
        self.db.refresh(application)
        return application

    def update_status(
        self, application: TrainingApplication, status: ApplicationStatus
    ) -> TrainingApplication:
        application.status = status
        self.db.commit()
        self.db.refresh(application)
        return application

    def delete(self, application: TrainingApplication) -> None:
        self.db.delete(application)
        self.db.commit()
