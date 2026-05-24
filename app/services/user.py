from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any

from app.models.database_models import (
    User, Talent, Employer, Trainer, Admin,
    Education, Certificate, WorkExperience, Hobby, Language,
    SavedJob, Job, Skill, NotificationSettings,
)
from app.models.job_models import SavedJobOut
from app.models.user_models import SkillCreate
from app.repositories.talent_repository import TalentRepository
from app.repositories.skill_repository import SkillRepository
from app.repositories.employer_repository import EmployerRepository
from app.repositories.trainer_repository import TrainerRepository
from app.repositories.user_repository import UserRepository
from app.repositories.saved_job_repository import SavedJobRepository
from app.repositories.notification_repository import NotificationRepository


class UserService:
    # ------------------------------------------------------------------
    # Skill methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_skills(db: Session, talent_id: int) -> List[Skill]:
        repo = TalentRepository(db)
        return repo.get_skills(talent_id)

    @staticmethod
    def get_skill_by_id(db: Session, skill_id: int) -> Optional[Skill]:
        repo = SkillRepository(db)
        return repo.get_by_id(skill_id)

    @staticmethod
    def get_all_skills(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Skill]:
        repo = SkillRepository(db)
        return repo.get_all_with_filters(skip=skip, limit=limit, category=category, search=search)

    @staticmethod
    def get_skills_by_category(db: Session) -> Dict[str, List[Skill]]:
        repo = SkillRepository(db)
        return repo.get_skills_by_category_grouped()

    @staticmethod
    def get_skill_categories(db: Session) -> List[str]:
        repo = SkillRepository(db)
        return repo.get_categories()

    @staticmethod
    def create_skill(db: Session, skill_data: SkillCreate) -> Skill:
        repo = SkillRepository(db)
        return repo.get_or_create(name=skill_data.name, category=skill_data.category)

    @staticmethod
    def add_skill_to_talent(db: Session, talent_id: int, skill_id: int) -> bool:
        repo = TalentRepository(db)
        return repo.add_skill(talent_id, skill_id)

    @staticmethod
    def remove_skill_from_talent(db: Session, talent_id: int, skill_id: int) -> bool:
        repo = TalentRepository(db)
        return repo.remove_skill(talent_id, skill_id)

    @staticmethod
    def update_talent_skills(db: Session, talent_id: int, skill_ids: List[int]) -> bool:
        repo = TalentRepository(db)
        return repo.set_skills(talent_id, skill_ids)

    # ------------------------------------------------------------------
    # Education methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_education_entries(db: Session, talent_id: int) -> List[Education]:
        repo = TalentRepository(db)
        return repo.get_education(talent_id)

    @staticmethod
    def get_education_by_id(
        db: Session, education_id: int, talent_id: int
    ) -> Optional[Education]:
        repo = TalentRepository(db)
        return repo.get_education_by_id(education_id, talent_id)

    @staticmethod
    def create_education(db: Session, talent_id: int, education_data: dict) -> Education:
        repo = TalentRepository(db)
        return repo.create_education(talent_id, **education_data)

    @staticmethod
    def update_education(
        db: Session, education_id: int, talent_id: int, education_data: dict
    ) -> Optional[Education]:
        repo = TalentRepository(db)
        entry = repo.get_education_by_id(education_id, talent_id)
        if not entry:
            return None
        return repo.update_education(entry, **education_data)

    @staticmethod
    def delete_education(db: Session, education_id: int, talent_id: int) -> bool:
        repo = TalentRepository(db)
        entry = repo.get_education_by_id(education_id, talent_id)
        if not entry:
            return False
        repo.delete_education(entry)
        return True

    # ------------------------------------------------------------------
    # Certificate methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_certificates(db: Session, talent_id: int) -> List[Certificate]:
        repo = TalentRepository(db)
        return repo.get_certificates(talent_id)

    @staticmethod
    def get_certificate_by_id(
        db: Session, certificate_id: int, talent_id: int
    ) -> Optional[Certificate]:
        repo = TalentRepository(db)
        return repo.get_certificate_by_id(certificate_id, talent_id)

    @staticmethod
    def create_certificate(
        db: Session, talent_id: int, certificate_data: dict
    ) -> Certificate:
        repo = TalentRepository(db)
        return repo.create_certificate(talent_id, **certificate_data)

    @staticmethod
    def update_certificate(
        db: Session, certificate_id: int, talent_id: int, certificate_data: dict
    ) -> Optional[Certificate]:
        repo = TalentRepository(db)
        entry = repo.get_certificate_by_id(certificate_id, talent_id)
        if not entry:
            return None
        return repo.update_certificate(entry, **certificate_data)

    @staticmethod
    def delete_certificate(db: Session, certificate_id: int, talent_id: int) -> bool:
        repo = TalentRepository(db)
        entry = repo.get_certificate_by_id(certificate_id, talent_id)
        if not entry:
            return False
        repo.delete_certificate(entry)
        return True

    # ------------------------------------------------------------------
    # WorkExperience methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_work_experiences(db: Session, talent_id: int) -> List[WorkExperience]:
        repo = TalentRepository(db)
        return repo.get_work_experiences(talent_id)

    @staticmethod
    def get_work_experience_by_id(
        db: Session, work_experience_id: int, talent_id: int
    ) -> Optional[WorkExperience]:
        repo = TalentRepository(db)
        return repo.get_work_experience_by_id(work_experience_id, talent_id)

    @staticmethod
    def create_work_experience(
        db: Session, talent_id: int, work_experience_data: dict
    ) -> WorkExperience:
        repo = TalentRepository(db)
        return repo.create_work_experience(talent_id, **work_experience_data)

    @staticmethod
    def update_work_experience(
        db: Session,
        work_experience_id: int,
        talent_id: int,
        work_experience_data: dict,
    ) -> Optional[WorkExperience]:
        repo = TalentRepository(db)
        entry = repo.get_work_experience_by_id(work_experience_id, talent_id)
        if not entry:
            return None
        return repo.update_work_experience(entry, **work_experience_data)

    @staticmethod
    def delete_work_experience(
        db: Session, work_experience_id: int, talent_id: int
    ) -> bool:
        repo = TalentRepository(db)
        entry = repo.get_work_experience_by_id(work_experience_id, talent_id)
        if not entry:
            return False
        repo.delete_work_experience(entry)
        return True

    # ------------------------------------------------------------------
    # Hobby methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_hobbies(db: Session, talent_id: int) -> List[Hobby]:
        repo = TalentRepository(db)
        return repo.get_hobbies(talent_id)

    @staticmethod
    def get_hobby_by_id(db: Session, hobby_id: int, talent_id: int) -> Optional[Hobby]:
        repo = TalentRepository(db)
        return repo.get_hobby_by_id(hobby_id, talent_id)

    @staticmethod
    def create_hobby(db: Session, talent_id: int, hobby_data: dict) -> Hobby:
        repo = TalentRepository(db)
        return repo.create_hobby(talent_id, **hobby_data)

    @staticmethod
    def update_hobby(
        db: Session, hobby_id: int, talent_id: int, hobby_data: dict
    ) -> Optional[Hobby]:
        repo = TalentRepository(db)
        entry = repo.get_hobby_by_id(hobby_id, talent_id)
        if not entry:
            return None
        return repo.update_hobby(entry, **hobby_data)

    @staticmethod
    def delete_hobby(db: Session, hobby_id: int, talent_id: int) -> bool:
        repo = TalentRepository(db)
        entry = repo.get_hobby_by_id(hobby_id, talent_id)
        if not entry:
            return False
        repo.delete_hobby(entry)
        return True

    # ------------------------------------------------------------------
    # Language methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_languages(db: Session, talent_id: int) -> List[Language]:
        repo = TalentRepository(db)
        return repo.get_languages(talent_id)

    @staticmethod
    def get_language_by_id(
        db: Session, language_id: int, talent_id: int
    ) -> Optional[Language]:
        repo = TalentRepository(db)
        return repo.get_language_by_id(language_id, talent_id)

    @staticmethod
    def create_language(db: Session, talent_id: int, language_data: dict) -> Language:
        repo = TalentRepository(db)
        return repo.create_language(talent_id, **language_data)

    @staticmethod
    def update_language(
        db: Session, language_id: int, talent_id: int, language_data: dict
    ) -> Optional[Language]:
        repo = TalentRepository(db)
        entry = repo.get_language_by_id(language_id, talent_id)
        if not entry:
            return None
        return repo.update_language(entry, **language_data)

    @staticmethod
    def delete_language(db: Session, language_id: int, talent_id: int) -> bool:
        repo = TalentRepository(db)
        entry = repo.get_language_by_id(language_id, talent_id)
        if not entry:
            return False
        repo.delete_language(entry)
        return True

    # ------------------------------------------------------------------
    # Talent methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_talents(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Talent]:
        # The TalentRepository's get_all_with_filters supports search and is_active.
        # Extra filters (location, has_student_id) are handled inline here.
        repo = TalentRepository(db)
        search = filters.get("search") if filters else None
        results = repo.get_all_with_filters(
            skip=skip, limit=limit, search=search, is_active=True
        )
        # Apply additional filters not covered by repo
        if filters:
            if filters.get("name"):
                name_f = filters["name"].lower()
                results = [
                    t for t in results
                    if name_f in (t.first_name or "").lower()
                    or name_f in (t.last_name or "").lower()
                ]
            if filters.get("location"):
                loc = filters["location"].lower()
                results = [
                    t for t in results if loc in (t.location or "").lower()
                ]
            if filters.get("has_student_id") is not None:
                if filters["has_student_id"]:
                    results = [t for t in results if t.student_id is not None]
                else:
                    results = [t for t in results if t.student_id is None]
        return results

    @staticmethod
    def get_talent_by_id(db: Session, talent_id: int) -> Optional[Talent]:
        repo = TalentRepository(db)
        return repo.get_by_id(talent_id)

    @staticmethod
    def get_talent_by_email(db: Session, email: str) -> Optional[Talent]:
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)
        if not user:
            return None
        talent_repo = TalentRepository(db)
        return talent_repo.get_by_user_id(user.id)

    @staticmethod
    def update_talent(db: Session, talent_id: int, talent_data: dict) -> Optional[Talent]:
        repo = TalentRepository(db)
        talent = repo.get_by_id(talent_id)
        if not talent:
            return None
        return repo.update(talent, **talent_data)

    @staticmethod
    def disable_talent(db: Session, talent_id: int) -> bool:
        talent_repo = TalentRepository(db)
        talent = talent_repo.get_by_id(talent_id)
        if not talent:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(talent.user_id)
        if not user:
            return False
        user.is_active = False
        db.commit()
        return True

    @staticmethod
    def delete_talent(db: Session, talent_id: int) -> bool:
        talent_repo = TalentRepository(db)
        talent = talent_repo.get_by_id(talent_id)
        if not talent:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(talent.user_id)
        if not user:
            return False
        db.delete(talent)
        db.delete(user)
        db.commit()
        return True

    # ------------------------------------------------------------------
    # Employer methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_employers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Employer]:
        repo = EmployerRepository(db)
        search = filters.get("search") if filters else None
        results = repo.get_all_with_filters(
            skip=skip, limit=limit, search=search, is_active=True
        )
        # Apply additional filters not covered by repo
        if filters:
            if filters.get("company_name"):
                cn = filters["company_name"].lower()
                results = [
                    e for e in results if cn in (e.company_name or "").lower()
                ]
            if filters.get("industry"):
                ind = filters["industry"].lower()
                results = [
                    e for e in results if ind in (e.industry or "").lower()
                ]
            if filters.get("location"):
                loc = filters["location"].lower()
                results = [
                    e for e in results if loc in (e.location or "").lower()
                ]
            if filters.get("is_verified") is not None:
                results = [
                    e for e in results if e.is_verified == filters["is_verified"]
                ]
        return results

    @staticmethod
    def get_employer_by_id(db: Session, employer_id: int) -> Optional[Employer]:
        repo = EmployerRepository(db)
        return repo.get_by_id(employer_id)

    @staticmethod
    def get_employer_by_email(db: Session, email: str) -> Optional[Employer]:
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)
        if not user:
            return None
        emp_repo = EmployerRepository(db)
        return emp_repo.get_by_user_id(user.id)

    @staticmethod
    def update_employer(
        db: Session, employer_id: int, employer_data: dict
    ) -> Optional[Employer]:
        repo = EmployerRepository(db)
        employer = repo.get_by_id(employer_id)
        if not employer:
            return None
        return repo.update(employer, **employer_data)

    @staticmethod
    def disable_employer(db: Session, employer_id: int) -> bool:
        emp_repo = EmployerRepository(db)
        employer = emp_repo.get_by_id(employer_id)
        if not employer:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(employer.user_id)
        if not user:
            return False
        user.is_active = False
        db.commit()
        return True

    @staticmethod
    def delete_employer(db: Session, employer_id: int) -> bool:
        emp_repo = EmployerRepository(db)
        employer = emp_repo.get_by_id(employer_id)
        if not employer:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(employer.user_id)
        if not user:
            return False
        db.delete(employer)
        db.delete(user)
        db.commit()
        return True

    # ------------------------------------------------------------------
    # Trainer methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_trainers(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[Trainer]:
        repo = TrainerRepository(db)
        search = filters.get("search") if filters else None
        results = repo.get_all_with_filters(
            skip=skip, limit=limit, search=search, is_active=True
        )
        # Apply additional filters not covered by repo
        if filters:
            if filters.get("provider_name"):
                pn = filters["provider_name"].lower()
                results = [
                    t for t in results if pn in (t.provider_name or "").lower()
                ]
            if filters.get("industry"):
                ind = filters["industry"].lower()
                results = [
                    t for t in results if ind in (t.industry or "").lower()
                ]
            if filters.get("location"):
                loc = filters["location"].lower()
                results = [
                    t for t in results if loc in (t.location or "").lower()
                ]
            if filters.get("is_verified") is not None:
                results = [
                    t for t in results if t.is_verified == filters["is_verified"]
                ]
        return results

    @staticmethod
    def get_trainer_by_id(db: Session, trainer_id: int) -> Optional[Trainer]:
        repo = TrainerRepository(db)
        return repo.get_by_id(trainer_id)

    @staticmethod
    def get_trainer_by_email(db: Session, email: str) -> Optional[Trainer]:
        user_repo = UserRepository(db)
        user = user_repo.get_by_email(email)
        if not user:
            return None
        trainer_repo = TrainerRepository(db)
        return trainer_repo.get_by_user_id(user.id)

    @staticmethod
    def update_trainer(
        db: Session, trainer_id: int, trainer_data: dict
    ) -> Optional[Trainer]:
        repo = TrainerRepository(db)
        trainer = repo.get_by_id(trainer_id)
        if not trainer:
            return None
        return repo.update(trainer, **trainer_data)

    @staticmethod
    def disable_trainer(db: Session, trainer_id: int) -> bool:
        trainer_repo = TrainerRepository(db)
        trainer = trainer_repo.get_by_id(trainer_id)
        if not trainer:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(trainer.user_id)
        if not user:
            return False
        user.is_active = False
        db.commit()
        return True

    @staticmethod
    def delete_trainer(db: Session, trainer_id: int) -> bool:
        trainer_repo = TrainerRepository(db)
        trainer = trainer_repo.get_by_id(trainer_id)
        if not trainer:
            return False
        user_repo = UserRepository(db)
        user = user_repo.get_by_id(trainer.user_id)
        if not user:
            return False
        db.delete(trainer)
        db.delete(user)
        db.commit()
        return True

    # ------------------------------------------------------------------
    # User stats
    # ------------------------------------------------------------------

    @staticmethod
    def get_user_stats(db: Session) -> dict:
        from sqlalchemy import func
        total_talents = (
            db.query(func.count(Talent.id)).join(User).filter(User.is_active == True).scalar()
        )
        total_employers = (
            db.query(func.count(Employer.id)).join(User).filter(User.is_active == True).scalar()
        )
        total_trainers = (
            db.query(func.count(Trainer.id)).join(User).filter(User.is_active == True).scalar()
        )
        total_admins = (
            db.query(func.count(Admin.id)).join(User).filter(User.is_active == True).scalar()
        )
        return {
            "talents": total_talents,
            "employers": total_employers,
            "trainers": total_trainers,
            "admins": total_admins,
            "total": total_talents + total_employers + total_trainers + total_admins,
        }

    # ------------------------------------------------------------------
    # SavedJob methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_saved_jobs(db: Session, talent_id: int) -> List[SavedJobOut]:
        saved_jobs = (
            db.query(SavedJob)
            .filter(SavedJob.talent_id == talent_id)
            .options(joinedload(SavedJob.job))
            .all()
        )
        return [SavedJobOut.from_orm(sj) for sj in saved_jobs]

    @staticmethod
    def get_saved_job_by_id(
        db: Session, saved_job_id: int, talent_id: int
    ) -> Optional[SavedJob]:
        repo = SavedJobRepository(db)
        return repo.get_by_id(saved_job_id, talent_id)

    @staticmethod
    def create_saved_job(db: Session, talent_id: int, job_id: int) -> Optional[SavedJobOut]:
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None

        repo = SavedJobRepository(db)
        # Return existing if already saved
        existing = (
            db.query(SavedJob)
            .filter(SavedJob.talent_id == talent_id, SavedJob.job_id == job_id)
            .first()
        )
        if existing:
            db.refresh(existing)
            return SavedJobOut.from_orm(existing)

        saved_job = repo.save(job_id=job_id, talent_id=talent_id)
        saved_job_with_job = (
            db.query(SavedJob)
            .filter(SavedJob.id == saved_job.id)
            .options(joinedload(SavedJob.job))
            .first()
        )
        return SavedJobOut.from_orm(saved_job_with_job)

    @staticmethod
    def delete_saved_job(db: Session, saved_job_id: int, talent_id: int) -> bool:
        repo = SavedJobRepository(db)
        saved_job = repo.get_by_id(saved_job_id, talent_id)
        if not saved_job:
            return False
        repo.unsave(saved_job)
        return True

    @staticmethod
    def is_job_saved(db: Session, talent_id: int, job_id: int) -> bool:
        repo = SavedJobRepository(db)
        return repo.is_saved(job_id=job_id, talent_id=talent_id)

    # ------------------------------------------------------------------
    # Notification Settings methods
    # ------------------------------------------------------------------

    @staticmethod
    def get_notification_settings(db: Session, user_id: int):
        repo = NotificationRepository(db)
        return repo.get_by_user_id(user_id)

    @staticmethod
    def create_default_notification_settings(db: Session, user_id: int):
        repo = NotificationRepository(db)
        return repo.create_defaults(user_id)

    @staticmethod
    def update_notification_settings(db: Session, user_id: int, settings_data: dict):
        repo = NotificationRepository(db)
        settings = repo.get_by_user_id(user_id)
        if not settings:
            settings = repo.create_defaults(user_id)

        update_kwargs = {}
        for category, methods in settings_data.items():
            if category == "job_updates":
                update_kwargs["job_updates_in_app"] = methods.get(
                    "in_app", settings.job_updates_in_app
                )
                update_kwargs["job_updates_email"] = methods.get(
                    "email", settings.job_updates_email
                )
            elif category == "training_alerts":
                update_kwargs["training_alerts_in_app"] = methods.get(
                    "in_app", settings.training_alerts_in_app
                )
                update_kwargs["training_alerts_email"] = methods.get(
                    "email", settings.training_alerts_email
                )
            elif category == "application_status_updates":
                update_kwargs["application_status_updates_in_app"] = methods.get(
                    "in_app", settings.application_status_updates_in_app
                )
                update_kwargs["application_status_updates_email"] = methods.get(
                    "email", settings.application_status_updates_email
                )
            elif category == "saved_job_training_reminders":
                update_kwargs["saved_job_training_reminders_in_app"] = methods.get(
                    "in_app", settings.saved_job_training_reminders_in_app
                )
                update_kwargs["saved_job_training_reminders_email"] = methods.get(
                    "email", settings.saved_job_training_reminders_email
                )
            elif category == "system_notifications":
                update_kwargs["system_notifications_in_app"] = methods.get(
                    "in_app", settings.system_notifications_in_app
                )
                update_kwargs["system_notifications_email"] = methods.get(
                    "email", settings.system_notifications_email
                )

        return repo.update(settings, **update_kwargs)

    @staticmethod
    def format_notification_settings_response(settings):
        if not settings:
            return {
                "job_updates": {"none": False, "in_app": True, "email": True},
                "training_alerts": {"none": False, "in_app": True, "email": True},
                "application_status_updates": {
                    "none": False,
                    "in_app": True,
                    "email": True,
                },
                "saved_job_training_reminders": {
                    "none": False,
                    "in_app": True,
                    "email": False,
                },
                "system_notifications": {"none": False, "in_app": True, "email": True},
            }

        return {
            "job_updates": {
                "none": not (settings.job_updates_in_app or settings.job_updates_email),
                "in_app": settings.job_updates_in_app,
                "email": settings.job_updates_email,
            },
            "training_alerts": {
                "none": not (
                    settings.training_alerts_in_app or settings.training_alerts_email
                ),
                "in_app": settings.training_alerts_in_app,
                "email": settings.training_alerts_email,
            },
            "application_status_updates": {
                "none": not (
                    settings.application_status_updates_in_app
                    or settings.application_status_updates_email
                ),
                "in_app": settings.application_status_updates_in_app,
                "email": settings.application_status_updates_email,
            },
            "saved_job_training_reminders": {
                "none": not (
                    settings.saved_job_training_reminders_in_app
                    or settings.saved_job_training_reminders_email
                ),
                "in_app": settings.saved_job_training_reminders_in_app,
                "email": settings.saved_job_training_reminders_email,
            },
            "system_notifications": {
                "none": not (
                    settings.system_notifications_in_app
                    or settings.system_notifications_email
                ),
                "in_app": settings.system_notifications_in_app,
                "email": settings.system_notifications_email,
            },
        }
