from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from typing import List, Optional, Dict, Any

# Import models
from app.models.database_models import User, Talent, Employer, Trainer, Admin, UserType, Education, Certificate, WorkExperience, Hobby, Language, SavedJob, Job, Skill, talent_skills, NotificationSettings
from app.models.job_models import SavedJobOut
from app.models.user_models import SkillCreate

class UserService:
    # Skill methods
    @staticmethod
    def get_skills(db: Session, talent_id: int) -> List[Skill]:
        """
        Get all skills for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of Skill objects
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            return []
        return talent.skills
    
    @staticmethod
    def get_skill_by_id(db: Session, skill_id: int) -> Optional[Skill]:
        """
        Get a skill by ID.
        
        Args:
            db: Database session
            skill_id: Skill ID
            
        Returns:
            Skill object if found, None otherwise
        """
        return db.query(Skill).filter(Skill.id == skill_id).first()
    
    @staticmethod
    def get_all_skills(db: Session, skip: int = 0, limit: int = 100, category: Optional[str] = None, search: Optional[str] = None) -> List[Skill]:
        """
        Get all skills with optional filtering by category and search term.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            category: Optional category filter
            search: Optional search term to filter skills by name
            
        Returns:
            List of Skill objects
        """
        query = db.query(Skill)
        
        if category:
            query = query.filter(Skill.category == category)
            
        if search:
            query = query.filter(Skill.name.ilike(f"%{search}%"))
            
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_skills_by_category(db: Session) -> Dict[str, List[Skill]]:
        """
        Get all skills grouped by category.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with categories as keys and lists of skills as values
        """
        skills = db.query(Skill).all()
        
        # Group skills by category
        skills_by_category = {}
        for skill in skills:
            category = skill.category or "Other"
            if category not in skills_by_category:
                skills_by_category[category] = []
            skills_by_category[category].append(skill)
            
        return skills_by_category
        
    @staticmethod
    def get_skill_categories(db: Session) -> List[str]:
        """
        Get all unique skill categories.
        
        Args:
            db: Database session
            
        Returns:
            List of unique skill categories
        """
        # Query distinct categories from the skills table
        categories = db.query(Skill.category).distinct().all()
        
        # Extract category names from the result tuples and filter out None values
        category_names = [category[0] for category in categories if category[0] is not None]
        
        # Add "Other" category if it's not already in the list
        if "Other" not in category_names:
            category_names.append("Other")
            
        return sorted(category_names)
    
    @staticmethod
    def create_skill(db: Session, skill_data: SkillCreate) -> Skill:
        """
        Create a new skill.
        
        Args:
            db: Database session
            skill_data: Skill data
            
        Returns:
            Created Skill object
        """
        # Check if skill already exists
        existing_skill = db.query(Skill).filter(Skill.name == skill_data.name).first()
        if existing_skill:
            return existing_skill
            
        # Create new skill
        db_skill = Skill(
            name=skill_data.name,
            category=skill_data.category
        )
        db.add(db_skill)
        db.commit()
        db.refresh(db_skill)
        return db_skill
    
    @staticmethod
    def add_skill_to_talent(db: Session, talent_id: int, skill_id: int) -> bool:
        """
        Add a skill to a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            skill_id: Skill ID
            
        Returns:
            True if skill was added, False otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        
        if not talent or not skill:
            return False
            
        # Check if talent already has this skill
        if skill in talent.skills:
            return True
            
        talent.skills.append(skill)
        db.commit()
        return True
    
    @staticmethod
    def remove_skill_from_talent(db: Session, talent_id: int, skill_id: int) -> bool:
        """
        Remove a skill from a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            skill_id: Skill ID
            
        Returns:
            True if skill was removed, False otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        skill = db.query(Skill).filter(Skill.id == skill_id).first()
        
        if not talent or not skill:
            return False
            
        # Check if talent has this skill
        if skill not in talent.skills:
            return False
            
        talent.skills.remove(skill)
        db.commit()
        return True
    
    @staticmethod
    def update_talent_skills(db: Session, talent_id: int, skill_ids: List[int]) -> bool:
        """
        Update all skills for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            skill_ids: List of skill IDs
            
        Returns:
            True if skills were updated, False otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        if not talent:
            return False
            
        # Get all skills
        skills = db.query(Skill).filter(Skill.id.in_(skill_ids)).all()
        
        # Update talent's skills
        talent.skills = skills
        db.commit()
        return True
        
    # Education methods
    @staticmethod
    def get_education_entries(db: Session, talent_id: int) -> List[Education]:
        """
        Get all education entries for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of Education objects
        """
        return db.query(Education).filter(Education.talent_id == talent_id).all()
    
    @staticmethod
    def get_education_by_id(db: Session, education_id: int, talent_id: int) -> Optional[Education]:
        """
        Get an education entry by ID for a specific talent.
        
        Args:
            db: Database session
            education_id: Education ID
            talent_id: Talent ID
            
        Returns:
            Education object if found, None otherwise
        """
        return db.query(Education).filter(
            Education.id == education_id,
            Education.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_education(db: Session, talent_id: int, education_data: dict) -> Education:
        """
        Create a new education entry for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            education_data: Education data
            
        Returns:
            Created Education object
        """
        education = Education(**education_data, talent_id=talent_id)
        db.add(education)
        db.commit()
        db.refresh(education)
        return education
    
    @staticmethod
    def update_education(db: Session, education_id: int, talent_id: int, education_data: dict) -> Optional[Education]:
        """
        Update an education entry for a talent.
        
        Args:
            db: Database session
            education_id: Education ID
            talent_id: Talent ID
            education_data: Education data
            
        Returns:
            Updated Education object if found, None otherwise
        """
        education = UserService.get_education_by_id(db, education_id, talent_id)
        
        if not education:
            return None
        
        for key, value in education_data.items():
            setattr(education, key, value)
        
        db.commit()
        db.refresh(education)
        
        return education
    
    @staticmethod
    def delete_education(db: Session, education_id: int, talent_id: int) -> bool:
        """
        Delete an education entry for a talent.
        
        Args:
            db: Database session
            education_id: Education ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        education = UserService.get_education_by_id(db, education_id, talent_id)
        
        if not education:
            return False
        
        db.delete(education)
        db.commit()
        
        return True
    
    # Certificate methods
    @staticmethod
    def get_certificates(db: Session, talent_id: int) -> List[Certificate]:
        """
        Get all certificate entries for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of Certificate objects
        """
        return db.query(Certificate).filter(Certificate.talent_id == talent_id).all()
    
    @staticmethod
    def get_certificate_by_id(db: Session, certificate_id: int, talent_id: int) -> Optional[Certificate]:
        """
        Get a certificate entry by ID for a specific talent.
        
        Args:
            db: Database session
            certificate_id: Certificate ID
            talent_id: Talent ID
            
        Returns:
            Certificate object if found, None otherwise
        """
        return db.query(Certificate).filter(
            Certificate.id == certificate_id,
            Certificate.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_certificate(db: Session, talent_id: int, certificate_data: dict) -> Certificate:
        """
        Create a new certificate entry for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            certificate_data: Certificate data
            
        Returns:
            Created Certificate object
        """
        certificate = Certificate(**certificate_data, talent_id=talent_id)
        db.add(certificate)
        db.commit()
        db.refresh(certificate)
        return certificate
    
    @staticmethod
    def update_certificate(db: Session, certificate_id: int, talent_id: int, certificate_data: dict) -> Optional[Certificate]:
        """
        Update a certificate entry for a talent.
        
        Args:
            db: Database session
            certificate_id: Certificate ID
            talent_id: Talent ID
            certificate_data: Certificate data
            
        Returns:
            Updated Certificate object if found, None otherwise
        """
        certificate = UserService.get_certificate_by_id(db, certificate_id, talent_id)
        
        if not certificate:
            return None
        
        for key, value in certificate_data.items():
            setattr(certificate, key, value)
        
        db.commit()
        db.refresh(certificate)
        
        return certificate
    
    @staticmethod
    def delete_certificate(db: Session, certificate_id: int, talent_id: int) -> bool:
        """
        Delete a certificate entry for a talent.
        
        Args:
            db: Database session
            certificate_id: Certificate ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        certificate = UserService.get_certificate_by_id(db, certificate_id, talent_id)
        
        if not certificate:
            return False
        
        db.delete(certificate)
        db.commit()
        
        return True
    
    # WorkExperience methods
    @staticmethod
    def get_work_experiences(db: Session, talent_id: int) -> List[WorkExperience]:
        """
        Get all work experience entries for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of WorkExperience objects
        """
        return db.query(WorkExperience).filter(WorkExperience.talent_id == talent_id).all()
    
    @staticmethod
    def get_work_experience_by_id(db: Session, work_experience_id: int, talent_id: int) -> Optional[WorkExperience]:
        """
        Get a work experience entry by ID for a specific talent.
        
        Args:
            db: Database session
            work_experience_id: WorkExperience ID
            talent_id: Talent ID
            
        Returns:
            WorkExperience object if found, None otherwise
        """
        return db.query(WorkExperience).filter(
            WorkExperience.id == work_experience_id,
            WorkExperience.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_work_experience(db: Session, talent_id: int, work_experience_data: dict) -> WorkExperience:
        """
        Create a new work experience entry for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            work_experience_data: WorkExperience data
            
        Returns:
            Created WorkExperience object
        """
        work_experience = WorkExperience(**work_experience_data, talent_id=talent_id)
        db.add(work_experience)
        db.commit()
        db.refresh(work_experience)
        return work_experience
    
    @staticmethod
    def update_work_experience(db: Session, work_experience_id: int, talent_id: int, work_experience_data: dict) -> Optional[WorkExperience]:
        """
        Update a work experience entry for a talent.
        
        Args:
            db: Database session
            work_experience_id: WorkExperience ID
            talent_id: Talent ID
            work_experience_data: WorkExperience data
            
        Returns:
            Updated WorkExperience object if found, None otherwise
        """
        work_experience = UserService.get_work_experience_by_id(db, work_experience_id, talent_id)
        
        if not work_experience:
            return None
        
        for key, value in work_experience_data.items():
            setattr(work_experience, key, value)
        
        db.commit()
        db.refresh(work_experience)
        
        return work_experience
    
    @staticmethod
    def delete_work_experience(db: Session, work_experience_id: int, talent_id: int) -> bool:
        """
        Delete a work experience entry for a talent.
        
        Args:
            db: Database session
            work_experience_id: Work Experience ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        work_experience = UserService.get_work_experience_by_id(db, work_experience_id, talent_id)
        
        if not work_experience:
            return False
        
        db.delete(work_experience)
        db.commit()
        
        return True
    
    # Hobby methods
    @staticmethod
    def get_hobbies(db: Session, talent_id: int) -> List[Hobby]:
        """
        Get all hobby entries for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of Hobby objects
        """
        return db.query(Hobby).filter(Hobby.talent_id == talent_id).all()
    
    @staticmethod
    def get_hobby_by_id(db: Session, hobby_id: int, talent_id: int) -> Optional[Hobby]:
        """
        Get a hobby entry by ID for a specific talent.
        
        Args:
            db: Database session
            hobby_id: Hobby ID
            talent_id: Talent ID
            
        Returns:
            Hobby object if found, None otherwise
        """
        return db.query(Hobby).filter(
            Hobby.id == hobby_id,
            Hobby.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_hobby(db: Session, talent_id: int, hobby_data: dict) -> Hobby:
        """
        Create a new hobby entry for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            hobby_data: Hobby data
            
        Returns:
            Created Hobby object
        """
        hobby = Hobby(**hobby_data, talent_id=talent_id)
        db.add(hobby)
        db.commit()
        db.refresh(hobby)
        return hobby
    
    @staticmethod
    def update_hobby(db: Session, hobby_id: int, talent_id: int, hobby_data: dict) -> Optional[Hobby]:
        """
        Update a hobby entry for a talent.
        
        Args:
            db: Database session
            hobby_id: Hobby ID
            talent_id: Talent ID
            hobby_data: Hobby data
            
        Returns:
            Updated Hobby object if found, None otherwise
        """
        hobby = UserService.get_hobby_by_id(db, hobby_id, talent_id)
        
        if not hobby:
            return None
        
        for key, value in hobby_data.items():
            setattr(hobby, key, value)
        
        db.commit()
        db.refresh(hobby)
        
        return hobby
    
    @staticmethod
    def delete_hobby(db: Session, hobby_id: int, talent_id: int) -> bool:
        """
        Delete a hobby entry for a talent.
        
        Args:
            db: Database session
            hobby_id: Hobby ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        hobby = UserService.get_hobby_by_id(db, hobby_id, talent_id)
        
        if not hobby:
            return False
        
        db.delete(hobby)
        db.commit()
        
        return True
    
    # Language methods
    @staticmethod
    def get_languages(db: Session, talent_id: int) -> List[Language]:
        """
        Get all language entries for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of Language objects
        """
        return db.query(Language).filter(Language.talent_id == talent_id).all()
    
    @staticmethod
    def get_language_by_id(db: Session, language_id: int, talent_id: int) -> Optional[Language]:
        """
        Get a language entry by ID for a specific talent.
        
        Args:
            db: Database session
            language_id: Language ID
            talent_id: Talent ID
            
        Returns:
            Language object if found, None otherwise
        """
        return db.query(Language).filter(
            Language.id == language_id,
            Language.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_language(db: Session, talent_id: int, language_data: dict) -> Language:
        """
        Create a new language entry for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            language_data: Language data
            
        Returns:
            Created Language object
        """
        language = Language(**language_data, talent_id=talent_id)
        db.add(language)
        db.commit()
        db.refresh(language)
        return language
    
    @staticmethod
    def update_language(db: Session, language_id: int, talent_id: int, language_data: dict) -> Optional[Language]:
        """
        Update a language entry for a talent.
        
        Args:
            db: Database session
            language_id: Language ID
            talent_id: Talent ID
            language_data: Language data
            
        Returns:
            Updated Language object if found, None otherwise
        """
        language = UserService.get_language_by_id(db, language_id, talent_id)
        
        if not language:
            return None
        
        for key, value in language_data.items():
            setattr(language, key, value)
        
        db.commit()
        db.refresh(language)
        
        return language
    
    @staticmethod
    def delete_language(db: Session, language_id: int, talent_id: int) -> bool:
        """
        Delete a language entry for a talent.
        
        Args:
            db: Database session
            language_id: Language ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        language = UserService.get_language_by_id(db, language_id, talent_id)
        
        if not language:
            return False
        
        db.delete(language)
        db.commit()
        
        return True
    
    # Talent methods
    @staticmethod
    def get_talents(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None) -> List[Talent]:
        """
        Get talents with optional filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            
        Returns:
            List of Talent objects
        """
        query = db.query(Talent).join(User).filter(User.is_active == True)
        
        if filters:
            # Apply filters if provided
            if filters.get("name"):
                name_filter = filters["name"]
                query = query.filter(
                    or_(
                        Talent.first_name.ilike(f"%{name_filter}%"),
                        Talent.last_name.ilike(f"%{name_filter}%")
                    )
                )
            
            if filters.get("email"):
                query = query.filter(User.email.ilike(f"%{filters['email']}%"))
            
            if filters.get("location"):
                query = query.filter(Talent.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("has_student_id") is not None:
                if filters["has_student_id"]:
                    query = query.filter(Talent.student_id.isnot(None))
                else:
                    query = query.filter(Talent.student_id.is_(None))
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_talent_by_id(db: Session, talent_id: int) -> Optional[Talent]:
        """
        Get a talent by ID.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            Talent object if found, None otherwise
        """
        return db.query(Talent).filter(Talent.id == talent_id).first()
    
    @staticmethod
    def get_talent_by_email(db: Session, email: str) -> Optional[Talent]:
        """
        Get a talent by email.
        
        Args:
            db: Database session
            email: Talent email
            
        Returns:
            Talent object if found, None otherwise
        """
        return db.query(Talent).join(User).filter(User.email == email).first()
    
    @staticmethod
    def update_talent(db: Session, talent_id: int, talent_data: dict) -> Optional[Talent]:
        """
        Update a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            talent_data: Talent data
            
        Returns:
            Updated Talent object if found, None otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        
        if not talent:
            return None
        
        # Update talent fields
        for key, value in talent_data.items():
            setattr(talent, key, value)
        
        db.commit()
        db.refresh(talent)
        
        return talent
    
    @staticmethod
    def disable_talent(db: Session, talent_id: int) -> bool:
        """
        Disable a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            True if talent was disabled, False otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        
        if not talent:
            return False
        
        user = db.query(User).filter(User.id == talent.user_id).first()
        
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        
        return True
    
    @staticmethod
    def delete_talent(db: Session, talent_id: int) -> bool:
        """
        Delete a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            True if talent was deleted, False otherwise
        """
        talent = db.query(Talent).filter(Talent.id == talent_id).first()
        
        if not talent:
            return False
        
        user = db.query(User).filter(User.id == talent.user_id).first()
        
        if not user:
            return False
        
        db.delete(talent)
        db.delete(user)
        db.commit()
        
        return True
    
    @staticmethod
    def get_employers(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None) -> List[Employer]:
        """
        Get employers with optional filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            
        Returns:
            List of Employer objects
        """
        query = db.query(Employer).join(User).filter(User.is_active == True)
        
        if filters:
            # Apply filters if provided
            if filters.get("company_name"):
                query = query.filter(Employer.company_name.ilike(f"%{filters['company_name']}%"))
            
            if filters.get("email"):
                query = query.filter(User.email.ilike(f"%{filters['email']}%"))
            
            if filters.get("industry"):
                query = query.filter(Employer.industry.ilike(f"%{filters['industry']}%"))
            
            if filters.get("location"):
                query = query.filter(Employer.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("is_verified") is not None:
                query = query.filter(Employer.is_verified == filters["is_verified"])
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_employer_by_id(db: Session, employer_id: int) -> Optional[Employer]:
        """
        Get an employer by ID.
        
        Args:
            db: Database session
            employer_id: Employer ID
            
        Returns:
            Employer object if found, None otherwise
        """
        return db.query(Employer).filter(Employer.id == employer_id).first()
    
    @staticmethod
    def get_employer_by_email(db: Session, email: str) -> Optional[Employer]:
        """
        Get an employer by email.
        
        Args:
            db: Database session
            email: Employer email
            
        Returns:
            Employer object if found, None otherwise
        """
        return db.query(Employer).join(User).filter(User.email == email).first()
    
    @staticmethod
    def update_employer(db: Session, employer_id: int, employer_data: dict) -> Optional[Employer]:
        """
        Update an employer.
        
        Args:
            db: Database session
            employer_id: Employer ID
            employer_data: Employer data
            
        Returns:
            Updated Employer object if found, None otherwise
        """
        employer = db.query(Employer).filter(Employer.id == employer_id).first()
        
        if not employer:
            return None
        
        # Update employer fields
        for key, value in employer_data.items():
            setattr(employer, key, value)
        
        db.commit()
        db.refresh(employer)
        
        return employer
    
    @staticmethod
    def disable_employer(db: Session, employer_id: int) -> bool:
        """
        Disable an employer.
        
        Args:
            db: Database session
            employer_id: Employer ID
            
        Returns:
            True if employer was disabled, False otherwise
        """
        employer = db.query(Employer).filter(Employer.id == employer_id).first()
        
        if not employer:
            return False
        
        user = db.query(User).filter(User.id == employer.user_id).first()
        
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        
        return True
    
    @staticmethod
    def delete_employer(db: Session, employer_id: int) -> bool:
        """
        Delete an employer.
        
        Args:
            db: Database session
            employer_id: Employer ID
            
        Returns:
            True if employer was deleted, False otherwise
        """
        employer = db.query(Employer).filter(Employer.id == employer_id).first()
        
        if not employer:
            return False
        
        user = db.query(User).filter(User.id == employer.user_id).first()
        
        if not user:
            return False
        
        db.delete(employer)
        db.delete(user)
        db.commit()
        
        return True
    
    @staticmethod
    def get_trainers(db: Session, skip: int = 0, limit: int = 100, filters: Optional[Dict[str, Any]] = None) -> List[Trainer]:
        """
        Get trainers with optional filtering.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            filters: Optional filters
            
        Returns:
            List of Trainer objects
        """
        query = db.query(Trainer).join(User).filter(User.is_active == True)
        
        if filters:
            # Apply filters if provided
            if filters.get("provider_name"):
                query = query.filter(Trainer.provider_name.ilike(f"%{filters['provider_name']}%"))
            
            if filters.get("email"):
                query = query.filter(User.email.ilike(f"%{filters['email']}%"))
            
            if filters.get("industry"):
                query = query.filter(Trainer.industry.ilike(f"%{filters['industry']}%"))
            
            if filters.get("location"):
                query = query.filter(Trainer.location.ilike(f"%{filters['location']}%"))
            
            if filters.get("is_verified") is not None:
                query = query.filter(Trainer.is_verified == filters["is_verified"])
        
        return query.offset(skip).limit(limit).all()
    
    @staticmethod
    def get_trainer_by_id(db: Session, trainer_id: int) -> Optional[Trainer]:
        """
        Get a trainer by ID.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            
        Returns:
            Trainer object if found, None otherwise
        """
        return db.query(Trainer).filter(Trainer.id == trainer_id).first()
    
    @staticmethod
    def get_trainer_by_email(db: Session, email: str) -> Optional[Trainer]:
        """
        Get a trainer by email.
        
        Args:
            db: Database session
            email: Trainer email
            
        Returns:
            Trainer object if found, None otherwise
        """
        return db.query(Trainer).join(User).filter(User.email == email).first()
    
    @staticmethod
    def update_trainer(db: Session, trainer_id: int, trainer_data: dict) -> Optional[Trainer]:
        """
        Update a trainer.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            trainer_data: Trainer data
            
        Returns:
            Updated Trainer object if found, None otherwise
        """
        trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
        
        if not trainer:
            return None
        
        # Update trainer fields
        for key, value in trainer_data.items():
            setattr(trainer, key, value)
        
        db.commit()
        db.refresh(trainer)
        
        return trainer
    
    @staticmethod
    def disable_trainer(db: Session, trainer_id: int) -> bool:
        """
        Disable a trainer.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            
        Returns:
            True if trainer was disabled, False otherwise
        """
        trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
        
        if not trainer:
            return False
        
        user = db.query(User).filter(User.id == trainer.user_id).first()
        
        if not user:
            return False
        
        user.is_active = False
        db.commit()
        
        return True
    
    @staticmethod
    def delete_trainer(db: Session, trainer_id: int) -> bool:
        """
        Delete a trainer.
        
        Args:
            db: Database session
            trainer_id: Trainer ID
            
        Returns:
            True if trainer was deleted, False otherwise
        """
        trainer = db.query(Trainer).filter(Trainer.id == trainer_id).first()
        
        if not trainer:
            return False
        
        user = db.query(User).filter(User.id == trainer.user_id).first()
        
        if not user:
            return False
        
        db.delete(trainer)
        db.delete(user)
        db.commit()
        
        return True
    
    @staticmethod
    def get_user_stats(db: Session) -> dict:
        """
        Get user statistics.
        
        Args:
            db: Database session
            
        Returns:
            Dictionary with user statistics
        """
        total_talents = db.query(func.count(Talent.id)).join(User).filter(User.is_active == True).scalar()
        total_employers = db.query(func.count(Employer.id)).join(User).filter(User.is_active == True).scalar()
        total_trainers = db.query(func.count(Trainer.id)).join(User).filter(User.is_active == True).scalar()
        total_admins = db.query(func.count(Admin.id)).join(User).filter(User.is_active == True).scalar()
        
        return {
            "talents": total_talents,
            "employers": total_employers,
            "trainers": total_trainers,
            "admins": total_admins,
            "total": total_talents + total_employers + total_trainers + total_admins
        }
    
    # SavedJob methods
    @staticmethod
    def get_saved_jobs(db: Session, talent_id: int) -> List[SavedJobOut]:
        """
        Get all saved jobs for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            
        Returns:
            List of SavedJobOut objects with job details
        """
        saved_jobs = db.query(SavedJob).filter(SavedJob.talent_id == talent_id).options(
            joinedload(SavedJob.job)
        ).all()
        
        return [SavedJobOut.from_orm(saved_job) for saved_job in saved_jobs]
    
    @staticmethod
    def get_saved_job_by_id(db: Session, saved_job_id: int, talent_id: int) -> Optional[SavedJob]:
        """
        Get a saved job by ID for a specific talent.
        
        Args:
            db: Database session
            saved_job_id: SavedJob ID
            talent_id: Talent ID
            
        Returns:
            SavedJob object if found, None otherwise
        """
        return db.query(SavedJob).filter(
            SavedJob.id == saved_job_id,
            SavedJob.talent_id == talent_id
        ).first()
    
    @staticmethod
    def create_saved_job(db: Session, talent_id: int, job_id: int) -> SavedJobOut:
        """
        Create a new saved job for a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            job_id: Job ID
            
        Returns:
            Created SavedJobOut object with job details
        """
        # Check if job exists
        job = db.query(Job).filter(Job.id == job_id).first()
        if not job:
            return None
        
        # Check if already saved
        existing_saved_job = db.query(SavedJob).filter(
            SavedJob.talent_id == talent_id,
            SavedJob.job_id == job_id
        ).first()
        
        if existing_saved_job:
            # Refresh to get the job relationship
            db.refresh(existing_saved_job)
            return SavedJobOut.from_orm(existing_saved_job)
        
        saved_job = SavedJob(talent_id=talent_id, job_id=job_id)
        db.add(saved_job)
        db.commit()
        db.refresh(saved_job)
        
        # Query again with the job relationship loaded
        saved_job_with_job = db.query(SavedJob).filter(SavedJob.id == saved_job.id).options(
            joinedload(SavedJob.job)
        ).first()
        
        return SavedJobOut.from_orm(saved_job_with_job)
    
    @staticmethod
    def delete_saved_job(db: Session, saved_job_id: int, talent_id: int) -> bool:
        """
        Delete a saved job for a talent.
        
        Args:
            db: Database session
            saved_job_id: SavedJob ID
            talent_id: Talent ID
            
        Returns:
            True if deleted, False otherwise
        """
        saved_job = UserService.get_saved_job_by_id(db, saved_job_id, talent_id)
        
        if not saved_job:
            return False
        
        db.delete(saved_job)
        db.commit()
        
        return True
    
    @staticmethod
    def is_job_saved(db: Session, talent_id: int, job_id: int) -> bool:
        """
        Check if a job is saved by a talent.
        
        Args:
            db: Database session
            talent_id: Talent ID
            job_id: Job ID
            
        Returns:
            True if saved, False otherwise
        """
        saved_job = db.query(SavedJob).filter(
            SavedJob.talent_id == talent_id,
            SavedJob.job_id == job_id
        ).first()
        
        return saved_job is not None
    
    # Notification Settings methods
    @staticmethod
    def get_notification_settings(db: Session, user_id: int):
        """
        Get notification settings for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            NotificationSettings object or None if not found
        """
        return db.query(NotificationSettings).filter(NotificationSettings.user_id == user_id).first()
    
    @staticmethod
    def create_default_notification_settings(db: Session, user_id: int):
        """
        Create default notification settings for a user.
        
        Args:
            db: Database session
            user_id: User ID
            
        Returns:
            NotificationSettings object
        """
        settings = NotificationSettings(
            user_id=user_id,
            job_updates_in_app=True,
            job_updates_email=True,
            training_alerts_in_app=True,
            training_alerts_email=True,
            application_status_updates_in_app=True,
            application_status_updates_email=True,
            saved_job_training_reminders_in_app=True,
            saved_job_training_reminders_email=False,
            system_notifications_in_app=True,
            system_notifications_email=True
        )
        
        db.add(settings)
        db.commit()
        db.refresh(settings)
        return settings
    
    @staticmethod
    def update_notification_settings(db: Session, user_id: int, settings_data: dict):
        """
        Update notification settings for a user.
        
        Args:
            db: Database session
            user_id: User ID
            settings_data: Dictionary containing notification settings
            
        Returns:
            Updated NotificationSettings object or None if not found
        """
        settings = db.query(NotificationSettings).filter(NotificationSettings.user_id == user_id).first()
        
        if not settings:
            # Create default settings if they don't exist
            settings = UserService.create_default_notification_settings(db, user_id)
        
        # Update settings based on the provided data
        for category, methods in settings_data.items():
            if category == "job_updates":
                settings.job_updates_in_app = methods.get("in_app", settings.job_updates_in_app)
                settings.job_updates_email = methods.get("email", settings.job_updates_email)
            elif category == "training_alerts":
                settings.training_alerts_in_app = methods.get("in_app", settings.training_alerts_in_app)
                settings.training_alerts_email = methods.get("email", settings.training_alerts_email)
            elif category == "application_status_updates":
                settings.application_status_updates_in_app = methods.get("in_app", settings.application_status_updates_in_app)
                settings.application_status_updates_email = methods.get("email", settings.application_status_updates_email)
            elif category == "saved_job_training_reminders":
                settings.saved_job_training_reminders_in_app = methods.get("in_app", settings.saved_job_training_reminders_in_app)
                settings.saved_job_training_reminders_email = methods.get("email", settings.saved_job_training_reminders_email)
            elif category == "system_notifications":
                settings.system_notifications_in_app = methods.get("in_app", settings.system_notifications_in_app)
                settings.system_notifications_email = methods.get("email", settings.system_notifications_email)
        
        db.commit()
        db.refresh(settings)
        return settings
    
    @staticmethod
    def format_notification_settings_response(settings):
        """
        Format notification settings for API response.
        
        Args:
            settings: NotificationSettings object
            
        Returns:
            Dictionary formatted for API response
        """
        if not settings:
            # Return default settings if none exist
            return {
                "job_updates": {
                    "none": False,
                    "in_app": True,
                    "email": True
                },
                "training_alerts": {
                    "none": False,
                    "in_app": True,
                    "email": True
                },
                "application_status_updates": {
                    "none": False,
                    "in_app": True,
                    "email": True
                },
                "saved_job_training_reminders": {
                    "none": False,
                    "in_app": True,
                    "email": False
                },
                "system_notifications": {
                    "none": False,
                    "in_app": True,
                    "email": True
                }
            }
        
        return {
            "job_updates": {
                "none": not (settings.job_updates_in_app or settings.job_updates_email),
                "in_app": settings.job_updates_in_app,
                "email": settings.job_updates_email
            },
            "training_alerts": {
                "none": not (settings.training_alerts_in_app or settings.training_alerts_email),
                "in_app": settings.training_alerts_in_app,
                "email": settings.training_alerts_email
            },
            "application_status_updates": {
                "none": not (settings.application_status_updates_in_app or settings.application_status_updates_email),
                "in_app": settings.application_status_updates_in_app,
                "email": settings.application_status_updates_email
            },
            "saved_job_training_reminders": {
                "none": not (settings.saved_job_training_reminders_in_app or settings.saved_job_training_reminders_email),
                "in_app": settings.saved_job_training_reminders_in_app,
                "email": settings.saved_job_training_reminders_email
            },
            "system_notifications": {
                "none": not (settings.system_notifications_in_app or settings.system_notifications_email),
                "in_app": settings.system_notifications_in_app,
                "email": settings.system_notifications_email
            }
        }