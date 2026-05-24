from typing import Optional, List, Dict
from sqlalchemy.orm import Session

from app.models.database_models import Skill
from app.repositories.base import BaseRepository


class SkillRepository(BaseRepository[Skill]):
    def __init__(self, db: Session):
        super().__init__(db, Skill)

    def get_by_name(self, name: str) -> Optional[Skill]:
        return self.db.query(Skill).filter(Skill.name == name).first()

    def get_by_category(self, category: str) -> List[Skill]:
        return self.db.query(Skill).filter(Skill.category == category).all()

    def get_all_with_filters(
        self,
        skip: int = 0,
        limit: int = 100,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Skill]:
        query = self.db.query(Skill)

        if category:
            query = query.filter(Skill.category == category)

        if search:
            query = query.filter(Skill.name.ilike(f"%{search}%"))

        return query.offset(skip).limit(limit).all()

    def get_categories(self) -> List[str]:
        rows = self.db.query(Skill.category).distinct().all()
        categories = [r[0] for r in rows if r[0] is not None]
        if "Other" not in categories:
            categories.append("Other")
        return sorted(categories)

    def get_skills_by_category_grouped(self) -> Dict[str, List[Skill]]:
        skills = self.db.query(Skill).all()
        grouped: Dict[str, List[Skill]] = {}
        for skill in skills:
            cat = skill.category or "Other"
            grouped.setdefault(cat, []).append(skill)
        return grouped

    def get_or_create(self, name: str, category: Optional[str] = None) -> Skill:
        skill = self.db.query(Skill).filter(Skill.name == name).first()
        if skill:
            return skill
        skill = Skill(name=name, category=category)
        self.db.add(skill)
        self.db.commit()
        self.db.refresh(skill)
        return skill
