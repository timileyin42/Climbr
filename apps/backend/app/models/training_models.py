from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from enum import Enum

# Enums
class DeliveryMethod(str, Enum):
    ONLINE = "online"
    IN_PERSON = "in_person"
    HYBRID = "hybrid"

class TrainingStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

# Training Models
class TrainingBase(BaseModel):
    title: str
    description: str
    category: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    cost: float
    delivery_method: DeliveryMethod
    highlights: Optional[str] = None
    image_url: Optional[str] = None

class TrainingCreate(TrainingBase):
    pass

class TrainingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    location: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    cost: Optional[float] = None
    delivery_method: Optional[DeliveryMethod] = None
    highlights: Optional[str] = None
    image_url: Optional[str] = None

class TrainingOut(TrainingBase):
    id: int
    trainer_id: int
    trainer_name: str
    status: TrainingStatus
    created_at: datetime
    expiry_date: datetime
    applicant_count: int = 0

    class Config:
        from_attributes = True

class TrainingListing(BaseModel):
    id: int
    title: str
    category: str
    location: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None
    cost: float
    delivery_method: DeliveryMethod
    trainer_name: str
    highlights: Optional[str] = None
    image_url: Optional[str] = None
    applicant_count: int = 0
    created_at: datetime

    class Config:
        from_attributes = True

# Training Application Models
class TrainingApplicationBase(BaseModel):
    training_id: int
    talent_id: int

class TrainingApplicationCreate(TrainingApplicationBase):
    pass

class TrainingApplicationUpdate(BaseModel):
    status: ApplicationStatus

class TrainingApplicationOut(TrainingApplicationBase):
    id: int
    status: ApplicationStatus
    created_at: datetime
    training_title: str
    trainer_name: str

    class Config:
        from_attributes = True

class TrainingApplicant(BaseModel):
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

# Training Pricing Models
class TrainingPricingBase(BaseModel):
    plan_name: str
    price: float
    training_count: int
    description: str

class TrainingPricingCreate(TrainingPricingBase):
    pass

class TrainingPricingUpdate(TrainingPricingBase):
    plan_name: Optional[str] = None
    price: Optional[float] = None
    training_count: Optional[int] = None
    description: Optional[str] = None

class TrainingPricingOut(TrainingPricingBase):
    id: int

    class Config:
        from_attributes = True