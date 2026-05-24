from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, BackgroundTasks, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, or_
import sqlalchemy as sa
import logging

from app.database import get_db
from app.services.storage import StorageService
from app.services.user import UserService
from app.services.job import JobService
from app.services.training import TrainingService
from app.dependencies.auth import get_current_talent
from app.models.user_models import (EducationBase, EducationCreate, EducationOut, CertificateBase, CertificateCreate, CertificateOut, WorkExperienceBase, WorkExperienceCreate, WorkExperienceOut, HobbyBase, HobbyCreate, HobbyOut, LanguageBase, LanguageCreate, LanguageOut, TalentProfile, TalentUpdate, TalentDashboard, QuickAction, SkillBase, SkillCreate, SkillOut)
from app.models.job_models import SavedJobOut
from app.models.database_models import User, Talent, Job, Training, JobApplication, TrainingApplication, SavedJob, Employer, Trainer, Skill, Certificate, Education, WorkExperience, ApplicationStatus, NotificationSettings

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/profile")
async def get_profile(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get talent profile including education and certificates"""
    talent_id = current_talent.id
    
    # Use the current talent from authentication
    talent = current_talent
    
    # Get education, work experience, certificate, hobby, language, and skill entries
    education_entries = UserService.get_education_entries(db, talent_id)
    work_experience_entries = UserService.get_work_experiences(db, talent_id)
    certificate_entries = UserService.get_certificates(db, talent_id)
    hobby_entries = UserService.get_hobbies(db, talent_id)
    language_entries = UserService.get_languages(db, talent_id)
    skill_entries = UserService.get_skills(db, talent_id)
    
    # Construct the profile response
    profile = {
        "id": talent.id,
        "email": talent.email,
        "first_name": talent.first_name,
        "last_name": talent.last_name,
        "phone": talent.phone,
        "bio": talent.bio,
        "profile": {
            "summary": talent.bio,  # For now, using bio as summary
            "education": education_entries,
            "work_experience": work_experience_entries,
            "skills": skill_entries,
            "certificates": certificate_entries,
            "hobbies": hobby_entries,
            "languages": language_entries,
        }
    }
    
    return profile

@router.get("/profile/skills", response_model=List[SkillOut])
async def get_skills(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all skill entries for the current talent"""
    talent_id = current_talent.id
    
    skill_entries = UserService.get_skills(db, talent_id)
    return skill_entries

@router.post("/profile/skills", response_model=SkillOut, status_code=status.HTTP_201_CREATED)
async def create_skill(
    skill_data: SkillCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Create a new skill and add it to the current talent"""
    talent_id = current_talent.id
    
    # Create the skill
    skill = UserService.create_skill(db, skill_data)
    
    # Add the skill to the talent
    UserService.add_skill_to_talent(db, talent_id, skill.id)
    
    return skill

@router.delete("/profile/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Remove a skill from the current talent"""
    talent_id = current_talent.id
    
    # Remove the skill from the talent
    success = UserService.remove_skill_from_talent(db, talent_id, skill_id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Skill not found or not associated with this talent"
        )
    
    return None

@router.put("/profile/skills", status_code=status.HTTP_200_OK)
async def update_skills(
    skill_ids: List[int] = Body(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update all skills for the current talent"""
    talent_id = current_talent.id
    
    # Update the talent's skills
    success = UserService.update_talent_skills(db, talent_id, skill_ids)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    
    return {"message": "Skills updated successfully"}

@router.get("/skills", response_model=List[SkillOut])
async def get_all_skills(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all available skills with optional filtering by category and search term"""
    skills = UserService.get_all_skills(db, skip=skip, limit=limit, category=category, search=search)
    return skills

@router.get("/skills/by-category")
async def get_skills_by_category(
    db: Session = Depends(get_db)
):
    """Get all skills grouped by category"""
    skills_by_category = UserService.get_skills_by_category(db)
    
    # Convert the dictionary to a list of category objects for the response
    result = [
        {
            "category": category,
            "skills": skills
        } for category, skills in skills_by_category.items()
    ]
    
    return result

@router.get("/skills/categories", response_model=List[str])
async def get_skill_categories(
    db: Session = Depends(get_db)
):
    """Get all unique skill categories"""
    categories = UserService.get_skill_categories(db)
    return categories

@router.put("/profile")
async def update_profile(
    profile_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update talent profile"""
    talent_id = current_talent.id
    
    # Update basic profile fields
    # Note: This is a simplified version. In a real implementation,
    # you would validate the input data and handle each field appropriately.
    update_data = {}
    if "bio" in profile_data:
        update_data["bio"] = profile_data["bio"]
    if "first_name" in profile_data:
        update_data["first_name"] = profile_data["first_name"]
    if "last_name" in profile_data:
        update_data["last_name"] = profile_data["last_name"]
    if "phone" in profile_data:
        update_data["phone"] = profile_data["phone"]
    
    # Update the talent
    updated_talent = UserService.update_talent(db, talent_id, update_data)
    
    # Handle skills update if provided
    if "skills" in profile_data and isinstance(profile_data["skills"], list):
        skill_ids = [skill["id"] for skill in profile_data["skills"] if isinstance(skill, dict) and "id" in skill]
        UserService.update_talent_skills(db, talent_id, skill_ids)
    
    # Note: Education and certificates are handled by their respective endpoints
    # This endpoint updates the basic profile information and skills
    
    return {"message": "Profile updated successfully", "talent": updated_talent}

# Education endpoints
@router.get("/profile/education", response_model=List[EducationOut])
async def get_education(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all education entries for the current talent"""
    talent_id = current_talent.id
    
    education_entries = UserService.get_education_entries(db, talent_id)
    return education_entries

@router.post("/profile/education", status_code=status.HTTP_201_CREATED, response_model=EducationOut)
async def add_education(
    education_data: EducationCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Add a new education entry"""
    talent_id = current_talent.id
    
    education = UserService.create_education(db, talent_id, education_data.dict())
    return education

@router.get("/profile/education/{education_id}", response_model=EducationOut)
async def get_education_by_id(
    education_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get a specific education entry"""
    talent_id = current_talent.id
    
    education = UserService.get_education_by_id(db, education_id, talent_id)
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    return education

@router.put("/profile/education/{education_id}", response_model=EducationOut)
async def update_education(
    education_id: int,
    education_data: EducationCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update a specific education entry"""
    talent_id = current_talent.id
    
    education = UserService.update_education(db, education_id, talent_id, education_data.dict())
    if not education:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    return education

@router.delete("/profile/education/{education_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a specific education entry"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_education(db, education_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education entry not found"
        )
    
    return None

# Certificate endpoints
@router.get("/profile/certificates", response_model=List[CertificateOut])
async def get_certificates(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all certificate entries for the current talent"""
    talent_id = current_talent.id
    
    certificate_entries = UserService.get_certificates(db, talent_id)
    return certificate_entries

@router.post("/profile/certificates", status_code=status.HTTP_201_CREATED, response_model=CertificateOut)
async def add_certificate(
    certificate_data: CertificateCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Add a new certificate entry"""
    talent_id = current_talent.id
    
    certificate = UserService.create_certificate(db, talent_id, certificate_data.dict())
    return certificate

@router.get("/profile/certificates/{certificate_id}", response_model=CertificateOut)
async def get_certificate_by_id(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get a specific certificate entry"""
    talent_id = current_talent.id
    
    certificate = UserService.get_certificate_by_id(db, certificate_id, talent_id)
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate entry not found"
        )
    
    return certificate

@router.put("/profile/certificates/{certificate_id}", response_model=CertificateOut)
async def update_certificate(
    certificate_id: int,
    certificate_data: CertificateCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update a specific certificate entry"""
    talent_id = current_talent.id
    
    certificate = UserService.update_certificate(db, certificate_id, talent_id, certificate_data.dict())
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate entry not found"
        )
    
    return certificate

@router.delete("/profile/certificates/{certificate_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_certificate(
    certificate_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a specific certificate entry"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_certificate(db, certificate_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate entry not found"
        )
    
    return None

# Work Experience endpoints
@router.get("/profile/work-experience", response_model=List[WorkExperienceOut])
async def get_work_experiences(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all work experience entries for the current talent"""
    talent_id = current_talent.id
    
    work_experiences = UserService.get_work_experiences(db, talent_id)
    return work_experiences

@router.post("/profile/work-experience", status_code=status.HTTP_201_CREATED, response_model=WorkExperienceOut)
async def add_work_experience(
    work_experience_data: WorkExperienceCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Add a new work experience entry"""
    talent_id = current_talent.id
    
    work_experience = UserService.create_work_experience(db, talent_id, work_experience_data.dict())
    return work_experience

@router.get("/profile/work-experience/{work_experience_id}", response_model=WorkExperienceOut)
async def get_work_experience_by_id(
    work_experience_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get a specific work experience entry"""
    talent_id = current_talent.id
    
    work_experience = UserService.get_work_experience_by_id(db, work_experience_id, talent_id)
    if not work_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience entry not found"
        )
    
    return work_experience

@router.put("/profile/work-experience/{work_experience_id}", response_model=WorkExperienceOut)
async def update_work_experience(
    work_experience_id: int,
    work_experience_data: WorkExperienceCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update a specific work experience entry"""
    talent_id = current_talent.id
    
    work_experience = UserService.update_work_experience(db, work_experience_id, talent_id, work_experience_data.dict())
    if not work_experience:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience entry not found"
        )
    
    return work_experience

@router.delete("/profile/work-experience/{work_experience_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_experience(
    work_experience_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a specific work experience entry"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_work_experience(db, work_experience_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work experience entry not found"
        )
    
    return None

# Hobby endpoints
@router.get("/profile/hobbies", response_model=List[HobbyOut])
async def get_hobbies(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all hobby entries for the current talent"""
    talent_id = current_talent.id
    
    hobby_entries = UserService.get_hobbies(db, talent_id)
    return hobby_entries

@router.post("/profile/hobbies", status_code=status.HTTP_201_CREATED, response_model=HobbyOut)
async def add_hobby(
    hobby_data: HobbyCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Add a new hobby entry"""
    talent_id = current_talent.id
    
    hobby = UserService.create_hobby(db, talent_id, hobby_data.dict())
    return hobby

@router.get("/profile/hobbies/{hobby_id}", response_model=HobbyOut)
async def get_hobby_by_id(
    hobby_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get a specific hobby entry"""
    talent_id = current_talent.id
    
    hobby = UserService.get_hobby_by_id(db, hobby_id, talent_id)
    if not hobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hobby entry not found"
        )
    
    return hobby

@router.put("/profile/hobbies/{hobby_id}", response_model=HobbyOut)
async def update_hobby(
    hobby_id: int,
    hobby_data: HobbyCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update a specific hobby entry"""
    talent_id = current_talent.id
    
    hobby = UserService.update_hobby(db, hobby_id, talent_id, hobby_data.dict())
    if not hobby:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hobby entry not found"
        )
    
    return hobby

@router.delete("/profile/hobbies/{hobby_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_hobby(
    hobby_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a specific hobby entry"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_hobby(db, hobby_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hobby entry not found"
        )
    
    return None

# Language endpoints
@router.get("/profile/languages", response_model=List[LanguageOut])
async def get_languages(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all language entries for the current talent"""
    talent_id = current_talent.id
    
    language_entries = UserService.get_languages(db, talent_id)
    return language_entries

@router.post("/profile/languages", status_code=status.HTTP_201_CREATED, response_model=LanguageOut)
async def add_language(
    language_data: LanguageCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Add a new language entry"""
    talent_id = current_talent.id
    
    language = UserService.create_language(db, talent_id, language_data.dict())
    return language

@router.get("/profile/languages/{language_id}", response_model=LanguageOut)
async def get_language_by_id(
    language_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get a specific language entry"""
    talent_id = current_talent.id
    
    language = UserService.get_language_by_id(db, language_id, talent_id)
    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language entry not found"
        )
    
    return language

@router.put("/profile/languages/{language_id}", response_model=LanguageOut)
async def update_language(
    language_id: int,
    language_data: LanguageCreate,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update a specific language entry"""
    talent_id = current_talent.id
    
    language = UserService.update_language(db, language_id, talent_id, language_data.dict())
    if not language:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language entry not found"
        )
    
    return language

@router.delete("/profile/languages/{language_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_language(
    language_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a specific language entry"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_language(db, language_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Language entry not found"
        )
    
    return None

@router.post("/profile/resume")
async def upload_resume(
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Upload a resume file to R2 bucket"""
    folder = f"resumes/{current_talent.id}"
    file_url = await StorageService.upload_document(resume, folder)
    
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload resume. Please try again later."
        )
    
    # Update talent profile with resume URL
    talent = db.query(Talent).filter(Talent.id == current_talent.id).first()
    if talent:
        talent.resume_url = file_url
        db.commit()

    return {"message": "Resume uploaded successfully", "resume_url": file_url}

@router.post("/profile/certificates/{certificate_id}/upload")
async def upload_certificate_file(
    certificate_id: int,
    certificate_file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Upload a certificate file to R2 bucket"""
    talent_id = current_talent.id
    certificate = UserService.get_certificate_by_id(db, certificate_id, talent_id)

    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )

    folder = f"certificates/{talent_id}/{certificate_id}"
    file_url = await StorageService.upload_file(certificate_file, folder)
    
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload certificate. Please try again later."
        )
    
    # Update certificate with file URL
    certificate_data = {
        "credential_url": file_url
    }
    
    updated_certificate = UserService.update_certificate(db, certificate_id, talent_id, certificate_data)
    
    return {"message": "Certificate uploaded successfully", "certificate": updated_certificate}

@router.post("/profile/image/upload")
async def upload_profile_image(
    profile_image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Upload a profile image to R2 bucket"""
    talent_id = current_talent.id
    folder = f"profile_images/{talent_id}"
    file_url = await StorageService.upload_image(profile_image, folder)

    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile image",
        )

    updated_talent = UserService.update_talent(db, talent_id, {"profile_image_url": file_url})
    if not updated_talent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Talent not found")

    return {
        "message": "Profile image uploaded successfully",
        "image_url": file_url,
        "talent": {
            "id": updated_talent.id,
            "profile_image_url": updated_talent.profile_image_url,
        },
    }

@router.delete("/profile/image")
async def delete_profile_image(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete the current profile image"""
    talent_id = current_talent.id
    
    # Get current profile image URL
    if not current_talent.profile_image_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No profile image found"
        )
    
    try:
        # Delete from S3
        # Extract filename from URL for deletion
        image_url = current_talent.profile_image_url
        if "profile_images/" in image_url:
            filename = image_url.split("profile_images/")[-1]
            filename = f"profile_images/{filename}"
            
            await StorageService.delete_file(filename)
        
        # Update talent profile to remove image URL
        updated_talent = UserService.update_talent(db, talent_id, {"profile_image_url": None})
        
        if not updated_talent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Talent not found"
            )
        
        return {"message": "Profile image deleted successfully"}
        
    except Exception as e:
        logger.error(f"Error deleting profile image: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete profile image"
        )

@router.post("/jobs/{job_id}/apply", status_code=status.HTTP_201_CREATED)
async def apply_to_job(
    job_id: int,
    cover_letter: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Apply to a job"""
    talent_id = current_talent.id
    
    # Check if already applied
    existing_application = db.query(JobApplication).filter(
        JobApplication.job_id == job_id,
        JobApplication.talent_id == talent_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this job"
        )
    
    application_data = {"cover_letter": cover_letter} if cover_letter else {}
    application = JobService.apply_to_job(db, job_id, talent_id, application_data)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return {"message": "Applied to job successfully", "application_id": application.id}

@router.post("/trainings/{training_id}/apply", status_code=status.HTTP_201_CREATED)
async def apply_to_training(
    training_id: int,
    cover_letter: Optional[str] = Body(None),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Apply to a training program"""
    talent_id = current_talent.id
    
    # Check if already applied
    existing_application = db.query(TrainingApplication).filter(
        TrainingApplication.training_id == training_id,
        TrainingApplication.talent_id == talent_id
    ).first()
    
    if existing_application:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied to this training"
        )
    
    application_data = {"cover_letter": cover_letter} if cover_letter else {}
    application = TrainingService.apply_to_training(db, training_id, talent_id, application_data)
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training not found"
        )
    
    return {"message": "Applied to training successfully", "application_id": application.id}

@router.get("/applications", response_model=dict)
async def get_all_applications(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    type_filter: Optional[str] = Query(None, description="Filter by type: job, training"),
    date_from: Optional[str] = Query(None, description="Filter from date (YYYY-MM-DD)"),
    date_to: Optional[str] = Query(None, description="Filter to date (YYYY-MM-DD)"),
    search: Optional[str] = Query(None, description="Search in title or company")
):
    """Get all applications (jobs and trainings) for the current talent with statistics"""
    talent_id = current_talent.id
    skip = (page - 1) * limit
    
    # Get job applications with job and employer details
    job_applications_query = db.query(
        JobApplication.id,
        JobApplication.status,
        JobApplication.created_at,
        Job.title.label('title'),
        Employer.company_name.label('company_provider'),
        func.literal('Job').label('type')
    ).join(Job).join(Employer).filter(JobApplication.talent_id == talent_id)
    
    # Get training applications with training and trainer details
    training_applications_query = db.query(
        TrainingApplication.id,
        TrainingApplication.status,
        TrainingApplication.created_at,
        Training.title.label('title'),
        Trainer.provider_name.label('company_provider'),
        func.literal('Training').label('type')
    ).join(Training).join(Trainer).filter(TrainingApplication.talent_id == talent_id)
    
    # Apply filters
    if status_filter:
        job_applications_query = job_applications_query.filter(JobApplication.status == status_filter)
        training_applications_query = training_applications_query.filter(TrainingApplication.status == status_filter)
    
    if date_from:
        from datetime import datetime
        date_from_obj = datetime.strptime(date_from, "%Y-%m-%d")
        job_applications_query = job_applications_query.filter(JobApplication.created_at >= date_from_obj)
        training_applications_query = training_applications_query.filter(TrainingApplication.created_at >= date_from_obj)
    
    if date_to:
        from datetime import datetime
        date_to_obj = datetime.strptime(date_to, "%Y-%m-%d")
        job_applications_query = job_applications_query.filter(JobApplication.created_at <= date_to_obj)
        training_applications_query = training_applications_query.filter(TrainingApplication.created_at <= date_to_obj)
    
    if search:
        search_term = f"%{search}%"
        job_applications_query = job_applications_query.filter(
            or_(Job.title.ilike(search_term), Employer.company_name.ilike(search_term))
        )
        training_applications_query = training_applications_query.filter(
            or_(Training.title.ilike(search_term), Trainer.provider_name.ilike(search_term))
        )
    
    # Combine queries
    if type_filter == "job":
        combined_query = job_applications_query
    elif type_filter == "training":
        combined_query = training_applications_query
    else:
        combined_query = job_applications_query.union_all(training_applications_query)
    
    # Get total count
    total_count = combined_query.count()
    
    # Apply pagination and ordering
    applications = combined_query.order_by(sa.text('created_at DESC')).offset(skip).limit(limit).all()
    
    # Get statistics
    job_stats = db.query(
        func.count(JobApplication.id).label('total'),
        func.sum(func.case([(JobApplication.status == ApplicationStatus.IN_REVIEW, 1)], else_=0)).label('in_review'),
        func.sum(func.case([(JobApplication.status.in_([ApplicationStatus.ACCEPTED, ApplicationStatus.SHORTLISTED]), 1)], else_=0)).label('accepted'),
        func.sum(func.case([(JobApplication.status == ApplicationStatus.REJECTED, 1)], else_=0)).label('rejected')
    ).filter(JobApplication.talent_id == talent_id).first()
    
    training_stats = db.query(
        func.count(TrainingApplication.id).label('total'),
        func.sum(func.case([(TrainingApplication.status == ApplicationStatus.IN_REVIEW, 1)], else_=0)).label('in_review'),
        func.sum(func.case([(TrainingApplication.status.in_([ApplicationStatus.ACCEPTED, ApplicationStatus.SHORTLISTED]), 1)], else_=0)).label('accepted'),
        func.sum(func.case([(TrainingApplication.status == ApplicationStatus.REJECTED, 1)], else_=0)).label('rejected')
    ).filter(TrainingApplication.talent_id == talent_id).first()
    
    # Combine statistics
    total_applications = (job_stats.total or 0) + (training_stats.total or 0)
    total_in_review = (job_stats.in_review or 0) + (training_stats.in_review or 0)
    total_accepted = (job_stats.accepted or 0) + (training_stats.accepted or 0)
    total_rejected = (job_stats.rejected or 0) + (training_stats.rejected or 0)
    
    # Format applications
    formatted_applications = []
    for app in applications:
        formatted_applications.append({
            "id": app.id,
            "type": app.type,
            "title": app.title,
            "company_provider": app.company_provider,
            "date_applied": app.created_at.strftime("%B %d, %Y"),
            "status": app.status,
            "created_at": app.created_at
        })
    
    return {
        "applications": formatted_applications,
        "total": total_count,
        "page": page,
        "limit": limit,
        "statistics": {
            "total_applications": total_applications,
            "in_review": total_in_review,
            "accepted_shortlisted": total_accepted,
            "rejected": total_rejected
        }
    }

@router.get("/applications/jobs")
async def get_job_applications(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Get job applications for the current talent"""
    talent_id = current_talent.id
    skip = (page - 1) * limit
    
    applications = JobService.get_talent_applications(db, talent_id, skip, limit)
    
    # Apply status filter if provided
    if status_filter:
        applications = [app for app in applications if app.status == status_filter]
    
    # Format applications with job and employer details
    formatted_applications = []
    for app in applications:
        job = db.query(Job).filter(Job.id == app.job_id).first()
        employer = db.query(Employer).filter(Employer.id == job.employer_id).first() if job else None
        
        formatted_applications.append({
            "id": app.id,
            "job_id": app.job_id,
            "title": job.title if job else "Unknown Job",
            "company": employer.company_name if employer else "Unknown Company",
            "status": app.status,
            "date_applied": app.created_at.strftime("%B %d, %Y"),
            "created_at": app.created_at
        })
    
    return {
        "applications": formatted_applications,
        "total": len(formatted_applications),
        "page": page,
        "limit": limit
    }

@router.get("/applications/trainings")
async def get_training_applications(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    status_filter: Optional[str] = Query(None, description="Filter by status")
):
    """Get training applications for the current talent"""
    talent_id = current_talent.id
    skip = (page - 1) * limit
    
    applications = TrainingService.get_talent_training_applications(db, talent_id, skip, limit)
    
    # Apply status filter if provided
    if status_filter:
        applications = [app for app in applications if app.status == status_filter]
    
    # Format applications with training and trainer details
    formatted_applications = []
    for app in applications:
        training = db.query(Training).filter(Training.id == app.training_id).first()
        trainer = db.query(Trainer).filter(Trainer.id == training.trainer_id).first() if training else None
        
        formatted_applications.append({
            "id": app.id,
            "training_id": app.training_id,
            "title": training.title if training else "Unknown Training",
            "provider": trainer.company_name if trainer else "Unknown Provider",
            "status": app.status,
            "date_applied": app.created_at.strftime("%B %d, %Y"),
            "created_at": app.created_at
        })
    
    return {
         "applications": formatted_applications,
         "total": len(formatted_applications),
         "page": page,
         "limit": limit
     }

@router.delete("/applications/jobs/{application_id}")
async def withdraw_job_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Withdraw a job application"""
    # Check if application exists and belongs to current talent
    application = db.query(JobApplication).filter(
        JobApplication.id == application_id,
        JobApplication.talent_id == current_talent.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check if application can be withdrawn (not already processed)
    if application.status in [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot withdraw application that has already been processed"
        )
    
    # Delete the application
    db.delete(application)
    db.commit()
    
    return {"message": "Application withdrawn successfully"}

@router.delete("/applications/trainings/{application_id}")
async def withdraw_training_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Withdraw a training application"""
    # Check if application exists and belongs to current talent
    application = db.query(TrainingApplication).filter(
        TrainingApplication.id == application_id,
        TrainingApplication.talent_id == current_talent.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Check if application can be withdrawn (not already processed)
    if application.status in [ApplicationStatus.ACCEPTED, ApplicationStatus.REJECTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot withdraw application that has already been processed"
        )
    
    # Delete the application
    db.delete(application)
    db.commit()
    
    return {"message": "Application withdrawn successfully"}

@router.get("/saved-jobs", response_model=List[SavedJobOut])
async def get_saved_jobs(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get all saved jobs for the current talent"""
    talent_id = current_talent.id
    
    saved_jobs = UserService.get_saved_jobs(db, talent_id)
    return saved_jobs

@router.post("/saved-jobs/{job_id}", status_code=status.HTTP_201_CREATED)
async def save_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Save a job for the current talent"""
    talent_id = current_talent.id
    
    saved_job = UserService.create_saved_job(db, talent_id, job_id)
    if not saved_job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return saved_job

@router.delete("/saved-jobs/{saved_job_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_saved_job(
    saved_job_id: int,
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Delete a saved job for the current talent"""
    talent_id = current_talent.id
    
    deleted = UserService.delete_saved_job(db, saved_job_id, talent_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Saved job not found"
        )
    
    return None

@router.get("/dashboard", response_model=TalentDashboard)
async def get_talent_dashboard(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get dashboard overview statistics for the current talent"""
    talent_id = current_talent.id
    
    # Get the talent's basic profile
    talent = UserService.get_talent_by_id(db, talent_id)
    if not talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    
    # Get total job applications
    total_applications = db.query(func.count(JobApplication.id)).filter(
        JobApplication.talent_id == talent_id
    ).scalar() or 0
    
    # Get total training applications
    total_trainings = db.query(func.count(TrainingApplication.id)).filter(
        TrainingApplication.talent_id == talent_id
    ).scalar() or 0
    
    # Get total saved jobs
    total_saved_jobs = db.query(func.count(SavedJob.id)).filter(
        SavedJob.talent_id == talent_id
    ).scalar() or 0
    
    # Get applications in review (both job and training)
    job_applications_in_review = db.query(func.count(JobApplication.id)).filter(
        JobApplication.talent_id == talent_id,
        JobApplication.status == ApplicationStatus.IN_REVIEW
    ).scalar() or 0
    
    training_applications_in_review = db.query(func.count(TrainingApplication.id)).filter(
        TrainingApplication.talent_id == talent_id,
        TrainingApplication.status == ApplicationStatus.IN_REVIEW
    ).scalar() or 0
    
    applications_in_review = job_applications_in_review + training_applications_in_review
    
    # Get shortlisted/accepted applications (both job and training)
    job_shortlisted = db.query(func.count(JobApplication.id)).filter(
        JobApplication.talent_id == talent_id,
        JobApplication.status == ApplicationStatus.SHORTLISTED
    ).scalar() or 0
    
    training_shortlisted = db.query(func.count(TrainingApplication.id)).filter(
        TrainingApplication.talent_id == talent_id,
        TrainingApplication.status == ApplicationStatus.SHORTLISTED
    ).scalar() or 0
    
    shortlisted_accepted = job_shortlisted + training_shortlisted
    
    # Get featured jobs (this would typically be jobs recommended for the talent)
    # For now, we'll just get the latest active jobs
    featured_jobs = JobService.get_jobs(db, limit=5)
    
    # Construct the dashboard response
    dashboard = {
        "total_applications": total_applications,
        "total_trainings": total_trainings,
        "total_saved_jobs": total_saved_jobs,
        "applications_in_review": applications_in_review,
        "shortlisted_applications": shortlisted_accepted,
        "featured_jobs": featured_jobs,
        "profile_completion": calculate_profile_completion(talent),
        "quick_actions": get_quick_actions(talent)
    }
    
    return dashboard

def calculate_profile_completion(talent) -> int:
    """Calculate the profile completion percentage"""
    # This is a simplified calculation
    # In a real implementation, you would check all required fields
    total_fields = 10  # Example: total number of important profile fields
    completed_fields = 0
    
    # Check basic profile fields
    if talent.first_name:
        completed_fields += 1
    if talent.last_name:
        completed_fields += 1
    if talent.phone:
        completed_fields += 1
    if talent.bio:
        completed_fields += 1
    if talent.location:
        completed_fields += 1
    if talent.resume_url:
        completed_fields += 1
    if talent.profile_image_url:
        completed_fields += 1
    
    # Check if talent has education entries
    if talent.education and len(talent.education) > 0:
        completed_fields += 1
    
    # Check if talent has work experience entries
    if talent.work_experiences and len(talent.work_experiences) > 0:
        completed_fields += 1
    
    # Check if talent has skills
    if talent.skills and len(talent.skills) > 0:
        completed_fields += 1
    
    # Calculate percentage
    completion_percentage = int((completed_fields / total_fields) * 100)
    return completion_percentage

def get_quick_actions(talent) -> List[QuickAction]:
    """Get quick actions for the talent dashboard"""
    quick_actions = [
        QuickAction(
            id="complete_profile",
            title="Complete My Profile",
            description="Boost your chances",
            icon="user",
            action="/talent/profile"
        ),
        QuickAction(
            id="browse_jobs",
            title="Browse Jobs",
            description="Find roles that fit you",
            icon="search",
            action="/jobs"
        ),
        QuickAction(
            id="explore_trainings",
            title="Explore Trainings",
            description="Level up your skills",
            icon="graduation-cap",
            action="/trainings"
        ),
        QuickAction(
            id="track_applications",
            title="Track My Applications",
            description="See where you stand",
            icon="clipboard-list",
            action="/talent/applications/jobs"
        )
    ]
    
    return quick_actions

# Settings Endpoints
@router.put("/settings/profile")
async def update_profile_settings(
    profile_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update talent profile settings (name, email, etc.)"""
    talent_id = current_talent.id
    
    # Validate and update allowed fields
    allowed_fields = ["first_name", "last_name", "email", "phone", "bio"]
    update_data = {k: v for k, v in profile_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No valid fields provided for update"
        )
    
    # Check if email is being updated and if it already exists
    if "email" in update_data:
        existing_user = db.query(User).filter(
            User.email == update_data["email"],
            User.id != current_talent.user_id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    # Update talent profile
    updated_talent = UserService.update_talent(db, talent_id, update_data)
    if not updated_talent:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Talent not found"
        )
    
    return {
        "message": "Profile updated successfully",
        "profile": {
            "first_name": updated_talent.first_name,
            "last_name": updated_talent.last_name,
            "email": updated_talent.email,
            "phone": updated_talent.phone,
            "bio": updated_talent.bio
        }
    }

@router.put("/settings/security/password")
async def change_password(
    password_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Change talent password"""
    current_password = password_data.get("current_password")
    new_password = password_data.get("new_password")
    confirm_password = password_data.get("confirm_password")
    
    if not all([current_password, new_password, confirm_password]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All password fields are required"
        )
    
    if new_password != confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New passwords do not match"
        )
    
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Get user record
    user = db.query(User).filter(User.id == current_talent.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify current password
    from app.dependencies.auth import verify_password, get_password_hash
    if not verify_password(current_password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    user.hashed_password = get_password_hash(new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}

@router.get("/settings/notifications")
async def get_notification_settings(
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Get notification preferences for the talent"""
    user_id = current_talent.user_id
    
    # Get notification settings from database
    settings = UserService.get_notification_settings(db, user_id)
    
    # If no settings exist, create default ones
    if not settings:
        settings = UserService.create_default_notification_settings(db, user_id)
    
    # Format and return the settings
    return UserService.format_notification_settings_response(settings)

@router.put("/settings/notifications")
async def update_notification_settings(
    notification_data: dict = Body(...),
    db: Session = Depends(get_db),
    current_talent: Talent = Depends(get_current_talent)
):
    """Update notification preferences for the talent"""
    # Validate notification data structure
    valid_categories = [
        "job_updates", "training_alerts", "application_status_updates",
        "saved_job_training_reminders", "system_notifications"
    ]
    valid_methods = ["none", "in_app", "email"]
    
    for category, methods in notification_data.items():
        if category not in valid_categories:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid notification category: {category}"
            )
        
        if not isinstance(methods, dict):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid format for category: {category}"
            )
        
        for method, enabled in methods.items():
            if method not in valid_methods:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid notification method: {method}"
                )
            
            if not isinstance(enabled, bool):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Notification method values must be boolean"
                )
    
    user_id = current_talent.user_id
    
    # Update notification settings in database
    updated_settings = UserService.update_notification_settings(db, user_id, notification_data)
    
    # Format and return the updated settings
    formatted_settings = UserService.format_notification_settings_response(updated_settings)
    
    return {
        "message": "Notification settings updated successfully",
        "settings": formatted_settings
    }