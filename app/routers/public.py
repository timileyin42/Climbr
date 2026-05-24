from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from typing import List, Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
import os
from dotenv import load_dotenv

from app.database import get_db

# Load environment variables
load_dotenv()
from app.services.job import JobService
from app.services.training import TrainingService
from app.services.contact import ContactService
from app.services.email import EmailService
from app.models.job_models import JobOut, JobListing
from app.models.training_models import TrainingOut, TrainingListing

router = APIRouter()

# Contact form request model
class ContactFormRequest(BaseModel):
    name: str
    email: EmailStr
    message: str

@router.get("/")
async def home():
    """Homepage endpoint"""
    return {"message": "Welcome to Climbr - You bring the potential. We'll help with the rest."}

@router.get("/jobs", response_model=dict)
async def get_jobs(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search in title, description, or company"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    industry: Optional[str] = Query(None, description="Filter by industry"),
    experience_level: Optional[str] = Query(None, description="Filter by experience level"),
    company_size: Optional[str] = Query(None, description="Filter by company size"),
    salary_min: Optional[float] = Query(None, description="Minimum salary"),
    salary_max: Optional[float] = Query(None, description="Maximum salary"),
    skills: Optional[List[int]] = Query(None, description="Filter by skill IDs"),
    date_posted: Optional[str] = Query(None, description="Filter by date posted (recent, week, month)"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, salary, relevance")
):
    """Get all active job listings with advanced filtering and pagination"""
    try:
        skip = (page - 1) * limit
        
        # Build filters dictionary
        filters = {}
        if location:
            filters["location"] = location
        if job_type:
            filters["job_type"] = job_type
        if industry:
            filters["industry"] = industry
        if experience_level:
            filters["experience_level"] = experience_level
        if company_size:
            filters["company_size"] = company_size
        if salary_min:
            filters["salary_min"] = salary_min
        if salary_max:
            filters["salary_max"] = salary_max
        if skills:
            filters["skills"] = skills
        if search:
            filters["search"] = search
        if date_posted:
            filters["date_posted"] = date_posted
        if sort_by:
            filters["sort_by"] = sort_by
        
        jobs = JobService.get_jobs(db, skip=skip, limit=limit, filters=filters)
        total_count = JobService.get_jobs_count(db, filters=filters)
        
        return {
            "jobs": [JobListing.model_validate(job) for job in jobs],
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "pages": (total_count + limit - 1) // limit
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch jobs"
        )

@router.get("/jobs/{job_id}", response_model=JobOut)
async def get_job_details(job_id: int, db: Session = Depends(get_db)):
    """Get details for a specific job"""
    try:
        job = JobService.get_job_by_id(db, job_id)
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        return JobOut.model_validate(job)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch job details"
        )

@router.get("/trainings", response_model=dict)
async def get_trainings(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(10, ge=1, le=50, description="Number of records to return"),
    category: Optional[str] = Query(None, description="Filter by training category"),
    delivery_method: Optional[str] = Query(None, description="Filter by delivery method (online, in_person, hybrid)"),
    location: Optional[str] = Query(None, description="Filter by location"),
    search: Optional[str] = Query(None, description="Search in title, description, or trainer name"),
    cost_min: Optional[float] = Query(None, description="Minimum cost filter"),
    cost_max: Optional[float] = Query(None, description="Maximum cost filter"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, cost, relevance")
):
    """Get all active training listings with optional filters"""
    try:
        # Build filters dictionary
        filters = {}
        if category:
            filters["category"] = category
        if delivery_method:
            filters["delivery_method"] = delivery_method
        if location:
            filters["location"] = location
        if search:
            filters["search"] = search
        if cost_min is not None:
            filters["cost_min"] = cost_min
        if cost_max is not None:
            filters["cost_max"] = cost_max
        if sort_by:
            filters["sort_by"] = sort_by
        
        # Get trainings and total count
        trainings = TrainingService.get_trainings(db, skip=skip, limit=limit, filters=filters)
        total_count = TrainingService.get_trainings_count(db, filters=filters)
        
        return {
            "trainings": [TrainingListing.model_validate(training) for training in trainings],
            "total": total_count,
            "skip": skip,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch trainings"
        )

@router.get("/trainings/{training_id}", response_model=TrainingOut)
async def get_training_details(training_id: int, db: Session = Depends(get_db)):
    """Get details for a specific training"""
    try:
        training = TrainingService.get_training_by_id(db, training_id)
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training not found"
            )
        return TrainingOut.model_validate(training)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch training details"
        )

@router.get("/jobs/recommended", response_model=dict)
async def get_recommended_jobs(
    db: Session = Depends(get_db),
    talent_id: Optional[int] = Query(None, description="Talent ID for personalized recommendations"),
    limit: int = Query(6, ge=1, le=20, description="Number of recommendations")
):
    """Get recommended jobs based on talent profile or general recommendations"""
    try:
        if talent_id:
            # Get personalized recommendations based on talent skills and preferences
            # This could be enhanced with ML algorithms in the future
            filters = {
                "sort_by": "date",
                "status": "active"  # Only show active jobs
            }
            jobs = JobService.get_jobs(db, skip=0, limit=limit, filters=filters)
        else:
            # Return general popular/recent active jobs
            filters = {
                "sort_by": "date",
                "status": "active"
            }
            jobs = JobService.get_jobs(db, skip=0, limit=limit, filters=filters)
        
        return {
            "recommended_jobs": [JobListing.model_validate(job) for job in jobs],
            "total": len(jobs),
            "personalized": talent_id is not None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommended jobs"
        )

@router.get("/trainings/recommended", response_model=dict)
async def get_recommended_trainings(
    db: Session = Depends(get_db),
    talent_id: Optional[int] = Query(None, description="Talent ID for personalized recommendations"),
    limit: int = Query(6, ge=1, le=20, description="Number of recommendations")
):
    """Get recommended trainings based on talent profile or general recommendations"""
    try:
        if talent_id:
            # Get personalized recommendations based on talent skills and preferences
            # This could be enhanced with ML algorithms in the future
            filters = {
                "sort_by": "date",
                "status": "active"  # Only show active trainings
            }
            trainings = TrainingService.get_trainings(db, skip=0, limit=limit, filters=filters)
        else:
            # Return general popular/recent active trainings
            filters = {
                "sort_by": "date",
                "status": "active"
            }
            trainings = TrainingService.get_trainings(db, skip=0, limit=limit, filters=filters)
        
        return {
            "recommended_trainings": [TrainingListing.model_validate(training) for training in trainings],
            "total": len(trainings),
            "personalized": talent_id is not None
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recommended trainings"
        )

@router.post("/contact")
async def contact_form(
    contact_data: ContactFormRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Contact form submission"""
    try:
        # Create contact submission in database and send notification email
        submission = await ContactService.create_contact_submission(
            db=db,
            name=contact_data.name,
            email=contact_data.email,
            message=contact_data.message,
            background_tasks=background_tasks
        )
        
        return {
            "message": "Thank you for your message. We'll get back to you soon.",
            "submission_id": submission.id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to submit contact form. Please try again later."
        )