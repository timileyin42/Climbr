from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Enums
class JobType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    REMOTE = "remote"
    APPRENTICESHIP = "apprenticeship"
    VOLUNTEERING = "volunteering"
    FREELANCE = "freelance"
    
class JobStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class ApplicationStatus(str, Enum):
    APPLIED = "applied"
    IN_REVIEW = "in_review"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"

# Job Models
class JobBase(BaseModel):
    title: str
    description: str
    industry: str
    location: str
    job_type: JobType
    experience_level: Optional[str] = None
    company_size: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    highlights: Optional[str] = None

class JobCreate(JobBase):
    pass

class JobUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    industry: Optional[str] = None
    location: Optional[str] = None
    job_type: Optional[JobType] = None
    experience_level: Optional[str] = None
    company_size: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    highlights: Optional[str] = None

class JobOut(JobBase):
    id: int
    employer_id: int
    employer_name: str
    status: JobStatus
    created_at: datetime
    expiry_date: datetime
    applicant_count: int = 0
    image_url: Optional[str] = None

    class Config:
        from_attributes = True

class JobListing(BaseModel):
    id: int
    title: str
    industry: Optional[str] = None
    location: str
    job_type: JobType
    experience_level: Optional[str] = None
    company_size: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    employer_name: str
    created_at: datetime
    image_url: Optional[str] = None
    highlights: Optional[str] = None
    applicant_count: int = 0

    class Config:
        from_attributes = True

# Job Application Models
class JobApplicationBase(BaseModel):
    job_id: int
    talent_id: int

class JobApplicationCreate(JobApplicationBase):
    pass

class JobApplicationUpdate(BaseModel):
    status: ApplicationStatus

class JobApplicationOut(JobApplicationBase):
    id: int
    status: ApplicationStatus
    created_at: datetime
    job_title: str
    employer_name: str

    class Config:
        from_attributes = True

class JobApplicant(BaseModel):
    id: int
    talent_id: int
    first_name: str
    last_name: str
    email: str
    status: ApplicationStatus
    applied_at: datetime
    profile: dict  # This will contain the talent's profile information

    class Config:
        from_attributes = True

# Job Pricing Models
class JobPricingBase(BaseModel):
    plan_name: str
    price: float
    job_count: int
    description: str

class JobPricingCreate(JobPricingBase):
    pass

class JobPricingUpdate(JobPricingBase):
    plan_name: Optional[str] = None
    price: Optional[float] = None
    job_count: Optional[int] = None
    description: Optional[str] = None

class JobPricingOut(JobPricingBase):
    id: int

    class Config:
        from_attributes = True

# Saved Job Models
class SavedJobBase(BaseModel):
    job_id: int
    talent_id: int

class SavedJobCreate(SavedJobBase):
    pass

class SavedJobOut(SavedJobBase):
    id: int
    created_at: datetime
    job: JobListing

    class Config:
        from_attributes = True