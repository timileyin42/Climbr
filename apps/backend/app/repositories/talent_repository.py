from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.database_models import (
    Talent, User, Skill,
    Education, Certificate, WorkExperience, Hobby, Language,
)
from app.repositories.base import BaseRepository


class TalentRepository(BaseRepository[Talent]):
    def __init__(self, db: Session):
        super().__init__(db, Talent)

    # ---------------------------------------------------------------------------
    # Core talent lookups
    # ---------------------------------------------------------------------------

    def get_by_user_id(self, user_id: int) -> Optional[Talent]:
        return self.db.query(Talent).filter(Talent.user_id == user_id).first()

    def get_all_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> List[Talent]:
        query = self.db.query(Talent).join(User)

        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if search:
            query = query.filter(
                or_(
                    Talent.first_name.ilike(f"%{search}%"),
                    Talent.last_name.ilike(f"%{search}%"),
                    User.email.ilike(f"%{search}%"),
                )
            )

        return query.offset(skip).limit(limit).all()

    # ---------------------------------------------------------------------------
    # Education
    # ---------------------------------------------------------------------------

    def get_education(self, talent_id: int) -> List[Education]:
        return (
            self.db.query(Education).filter(Education.talent_id == talent_id).all()
        )

    def get_education_by_id(self, id: int, talent_id: int) -> Optional[Education]:
        return (
            self.db.query(Education)
            .filter(Education.id == id, Education.talent_id == talent_id)
            .first()
        )

    def create_education(self, talent_id: int, **data) -> Education:
        entry = Education(talent_id=talent_id, **data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_education(self, entry: Education, **data) -> Education:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_education(self, entry: Education) -> None:
        self.db.delete(entry)
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Certificate
    # ---------------------------------------------------------------------------

    def get_certificates(self, talent_id: int) -> List[Certificate]:
        return (
            self.db.query(Certificate).filter(Certificate.talent_id == talent_id).all()
        )

    def get_certificate_by_id(self, id: int, talent_id: int) -> Optional[Certificate]:
        return (
            self.db.query(Certificate)
            .filter(Certificate.id == id, Certificate.talent_id == talent_id)
            .first()
        )

    def create_certificate(self, talent_id: int, **data) -> Certificate:
        entry = Certificate(talent_id=talent_id, **data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_certificate(self, entry: Certificate, **data) -> Certificate:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_certificate(self, entry: Certificate) -> None:
        self.db.delete(entry)
        self.db.commit()

    # ---------------------------------------------------------------------------
    # WorkExperience
    # ---------------------------------------------------------------------------

    def get_work_experiences(self, talent_id: int) -> List[WorkExperience]:
        return (
            self.db.query(WorkExperience)
            .filter(WorkExperience.talent_id == talent_id)
            .all()
        )

    def get_work_experience_by_id(
        self, id: int, talent_id: int
    ) -> Optional[WorkExperience]:
        return (
            self.db.query(WorkExperience)
            .filter(WorkExperience.id == id, WorkExperience.talent_id == talent_id)
            .first()
        )

    def create_work_experience(self, talent_id: int, **data) -> WorkExperience:
        entry = WorkExperience(talent_id=talent_id, **data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_work_experience(self, entry: WorkExperience, **data) -> WorkExperience:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_work_experience(self, entry: WorkExperience) -> None:
        self.db.delete(entry)
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Hobby
    # ---------------------------------------------------------------------------

    def get_hobbies(self, talent_id: int) -> List[Hobby]:
        return self.db.query(Hobby).filter(Hobby.talent_id == talent_id).all()

    def get_hobby_by_id(self, id: int, talent_id: int) -> Optional[Hobby]:
        return (
            self.db.query(Hobby)
            .filter(Hobby.id == id, Hobby.talent_id == talent_id)
            .first()
        )

    def create_hobby(self, talent_id: int, **data) -> Hobby:
        entry = Hobby(talent_id=talent_id, **data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_hobby(self, entry: Hobby, **data) -> Hobby:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_hobby(self, entry: Hobby) -> None:
        self.db.delete(entry)
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Language
    # ---------------------------------------------------------------------------

    def get_languages(self, talent_id: int) -> List[Language]:
        return self.db.query(Language).filter(Language.talent_id == talent_id).all()

    def get_language_by_id(self, id: int, talent_id: int) -> Optional[Language]:
        return (
            self.db.query(Language)
            .filter(Language.id == id, Language.talent_id == talent_id)
            .first()
        )

    def create_language(self, talent_id: int, **data) -> Language:
        entry = Language(talent_id=talent_id, **data)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def update_language(self, entry: Language, **data) -> Language:
        for key, value in data.items():
            setattr(entry, key, value)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def delete_language(self, entry: Language) -> None:
        self.db.delete(entry)
        self.db.commit()

    # ---------------------------------------------------------------------------
    # Skills (many-to-many via talent.skills relationship)
    # ---------------------------------------------------------------------------

    def get_skills(self, talent_id: int) -> List[Skill]:
        talent = self.db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            return []
        return talent.skills

    def add_skill(self, talent_id: int, skill_id: int) -> bool:
        talent = self.db.query(Talent).filter(Talent.id == talent_id).first()
        skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not talent or not skill:
            return False
        if skill not in talent.skills:
            talent.skills.append(skill)
            self.db.commit()
        return True

    def remove_skill(self, talent_id: int, skill_id: int) -> bool:
        talent = self.db.query(Talent).filter(Talent.id == talent_id).first()
        skill = self.db.query(Skill).filter(Skill.id == skill_id).first()
        if not talent or not skill:
            return False
        if skill not in talent.skills:
            return False
        talent.skills.remove(skill)
        self.db.commit()
        return True

    def set_skills(self, talent_id: int, skill_ids: List[int]) -> bool:
        talent = self.db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            return False
        skills = self.db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
        talent.skills = skills
        self.db.commit()
        return True
