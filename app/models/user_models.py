from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# Base User Models
class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Talent Models
class TalentBase(UserBase):
    first_name: str
    last_name: str
    phone: Optional[str] = None

class TalentCreate(TalentBase, UserCreate):
    pass

class EducationBase(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None

class EducationCreate(EducationBase):
    pass

class EducationOut(EducationBase):
    id: int
    talent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CertificateBase(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[datetime] = None
    expiration_date: Optional[datetime] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    description: Optional[str] = None

class CertificateCreate(CertificateBase):
    pass

class CertificateOut(CertificateBase):
    id: int
    talent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WorkExperienceBase(BaseModel):
    company: str
    position: str
    location: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_current: bool = False
    description: Optional[str] = None

class WorkExperienceCreate(WorkExperienceBase):
    pass

class WorkExperienceOut(WorkExperienceBase):
    id: int
    talent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HobbyBase(BaseModel):
    name: str
    description: Optional[str] = None

class HobbyCreate(HobbyBase):
    pass

class HobbyOut(HobbyBase):
    id: int
    talent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LanguageBase(BaseModel):
    name: str
    proficiency: str  # e.g., "Native", "Fluent", "Conversational", "Basic"

class LanguageCreate(LanguageBase):
    pass

class LanguageOut(LanguageBase):
    id: int
    talent_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillCreate(SkillBase):
    pass

class SkillOut(SkillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class TalentProfile(BaseModel):
    summary: Optional[str] = None
    education: Optional[List[EducationOut]] = None
    work_experience: Optional[List[WorkExperienceOut]] = None
    skills: Optional[List[SkillOut]] = None
    hobbies: Optional[List[HobbyOut]] = None
    languages: Optional[List[LanguageOut]] = None
    certificates: Optional[List[CertificateOut]] = None

class TalentOut(TalentBase, UserOut):
    profile: Optional[TalentProfile] = None

# Employer Models
class EmployerBase(UserBase):
    company_name: str
    contact_name: str
    phone: Optional[str] = None
    industry: Optional[str] = None

class EmployerCreate(EmployerBase, UserCreate):
    pass

class EmployerOut(EmployerBase, UserOut):
    job_count: int = 0

# Trainer Models
class TrainerBase(UserBase):
    provider_name: str
    contact_name: str
    phone: Optional[str] = None
    industry: Optional[str] = None

class TrainerCreate(TrainerBase, UserCreate):
    pass

class TrainerOut(TrainerBase, UserOut):
    training_count: int = 0

# Admin Models
class AdminBase(UserBase):
    first_name: str
    last_name: str

class AdminCreate(AdminBase, UserCreate):
    pass

class AdminOut(AdminBase, UserOut):
    pass

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
    user_type: str  # 'talent', 'employer', 'trainer', or 'admin'

# Dashboard Models
class QuickAction(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    action: str

class TalentDashboard(BaseModel):
    total_applications: int
    total_trainings: int
    total_saved_jobs: int
    applications_in_review: int
    shortlisted_applications: int
    featured_jobs: List[dict]  # This will be replaced with JobListing when available
    profile_completion: int
    quick_actions: List[QuickAction]

# Notification Settings Models
class NotificationCategory(BaseModel):
    none: bool = False
    in_app: bool = True
    email: bool = True

class NotificationSettingsBase(BaseModel):
    job_updates: NotificationCategory
    training_alerts: NotificationCategory
    application_status_updates: NotificationCategory
    saved_job_training_reminders: NotificationCategory
    system_notifications: NotificationCategory

class NotificationSettingsCreate(NotificationSettingsBase):
    pass

class NotificationSettingsUpdate(BaseModel):
    job_updates: Optional[NotificationCategory] = None
    training_alerts: Optional[NotificationCategory] = None
    application_status_updates: Optional[NotificationCategory] = None
    saved_job_training_reminders: Optional[NotificationCategory] = None
    system_notifications: Optional[NotificationCategory] = None

class NotificationSettingsOut(NotificationSettingsBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True