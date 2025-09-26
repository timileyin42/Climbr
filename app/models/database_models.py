from sqlalchemy import Boolean, Column, DateTime, Enum, Float, ForeignKey, Integer, String, Text, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime, timedelta
import enum

from app.database import Base

# Association tables for many-to-many relationships
talent_skills = Table(
    'talent_skills',
    Base.metadata,
    Column('talent_id', Integer, ForeignKey('talents.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

job_skills = Table(
    'job_skills',
    Base.metadata,
    Column('job_id', Integer, ForeignKey('jobs.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

training_skills = Table(
    'training_skills',
    Base.metadata,
    Column('training_id', Integer, ForeignKey('trainings.id')),
    Column('skill_id', Integer, ForeignKey('skills.id'))
)

# Enum classes
class UserType(str, enum.Enum):
    TALENT = "talent"
    EMPLOYER = "employer"
    TRAINER = "trainer"
    ADMIN = "admin"

class JobType(str, enum.Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    APPRENTICESHIP = "apprenticeship"

class JobStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DRAFT = "draft"
    UNPUBLISHED = "unpublished"

class TrainingStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    DRAFT = "draft"
    UNPUBLISHED = "unpublished"

class DeliveryMethod(str, enum.Enum):
    ONLINE = "online"
    IN_PERSON = "in_person"
    HYBRID = "hybrid"

class ApplicationStatus(str, enum.Enum):
    PENDING = "pending"
    IN_REVIEW = "in_review"
    SHORTLISTED = "shortlisted"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"

# Base User model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    user_type = Column(Enum(UserType))
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)  # Email verification status
    verification_token = Column(String, nullable=True)  # Token for email verification
    verification_token_expires = Column(DateTime, nullable=True)  # Expiration time for verification token
    password_reset_token = Column(String, nullable=True)  # Token for password reset
    password_reset_expires = Column(DateTime, nullable=True)  # Expiration time for password reset token
    google_id = Column(String, nullable=True, unique=True)  # Google OAuth ID
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships based on user type
    talent = relationship("Talent", back_populates="user", uselist=False)
    employer = relationship("Employer", back_populates="user", uselist=False)
    trainer = relationship("Trainer", back_populates="user", uselist=False)
    admin = relationship("Admin", back_populates="user", uselist=False)
    notification_settings = relationship("NotificationSettings", back_populates="user", uselist=False)

# Talent model
class Education(Base):
    __tablename__ = "education"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"))
    institution = Column(String)
    degree = Column(String)
    field_of_study = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    talent = relationship("Talent", back_populates="education")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"))
    name = Column(String)
    issuing_organization = Column(String)
    issue_date = Column(DateTime, nullable=True)
    expiration_date = Column(DateTime, nullable=True)
    credential_id = Column(String, nullable=True)
    credential_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    talent = relationship("Talent", back_populates="certificates")


class WorkExperience(Base):
    __tablename__ = "work_experiences"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"))
    company = Column(String)
    position = Column(String)
    location = Column(String, nullable=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    is_current = Column(Boolean, default=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    talent = relationship("Talent", back_populates="work_experiences")


class Talent(Base):
    __tablename__ = "talents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    date_of_birth = Column(DateTime)
    bio = Column(Text)
    location = Column(String)
    student_id = Column(String, nullable=True)
    resume_url = Column(String, nullable=True)
    profile_image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="talent")
    skills = relationship("Skill", secondary=talent_skills, back_populates="talents")
    job_applications = relationship("JobApplication", back_populates="talent")
    training_applications = relationship("TrainingApplication", back_populates="talent")
    education = relationship("Education", back_populates="talent")
    certificates = relationship("Certificate", back_populates="talent")
    work_experiences = relationship("WorkExperience", back_populates="talent")
    hobbies = relationship("Hobby", back_populates="talent")
    languages = relationship("Language", back_populates="talent")
    saved_jobs = relationship("SavedJob", back_populates="talent")

# Employer model
class Employer(Base):
    __tablename__ = "employers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    company_name = Column(String)
    contact_name = Column(String)
    phone = Column(String)
    website = Column(String, nullable=True)
    industry = Column(String)
    company_size = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String)
    is_verified = Column(Boolean, default=False)
    job_credits = Column(Integer, default=0)  # Number of job posts remaining
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="employer")
    jobs = relationship("Job", back_populates="employer")
    payments = relationship("Payment", back_populates="employer")

# Trainer model
class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider_name = Column(String)
    contact_name = Column(String)
    phone = Column(String)
    website = Column(String, nullable=True)
    industry = Column(String)
    logo_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String)
    is_verified = Column(Boolean, default=False)
    training_credits = Column(Integer, default=0)  # Number of training posts remaining
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="trainer")
    trainings = relationship("Training", back_populates="trainer")
    payments = relationship("Payment", back_populates="trainer")

# Admin model
class Admin(Base):
    __tablename__ = "admins"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    first_name = Column(String)
    last_name = Column(String)
    role = Column(String, default="admin")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="admin")

# Skill model
class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    category = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    talents = relationship("Talent", secondary=talent_skills, back_populates="skills")
    jobs = relationship("Job", secondary=job_skills, back_populates="skills")
    trainings = relationship("Training", secondary=training_skills, back_populates="skills")

# Job model
class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"))
    title = Column(String)
    description = Column(Text)
    industry = Column(String)
    location = Column(String)
    salary_min = Column(Float, nullable=True)
    salary_max = Column(Float, nullable=True)
    job_type = Column(Enum(JobType))
    experience_level = Column(String, nullable=True)  # Entry, Mid, Senior
    company_size = Column(String, nullable=True)  # Startup, Small, Medium, Large
    status = Column(Enum(JobStatus), default=JobStatus.ACTIVE)
    expiry_date = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_url = Column(String, nullable=True)  # URL for job image
    highlights = Column(Text, nullable=True)  # JSON string for job highlights/tags

    # Relationships
    employer = relationship("Employer", back_populates="jobs")
    skills = relationship("Skill", secondary=job_skills, back_populates="jobs")
    applications = relationship("JobApplication", back_populates="job")

# Job Application model
class JobApplication(Base):
    __tablename__ = "job_applications"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    talent_id = Column(Integer, ForeignKey("talents.id"))
    cover_letter = Column(Text, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    job = relationship("Job", back_populates="applications")
    talent = relationship("Talent", back_populates="job_applications")

# Training model
class Training(Base):
    __tablename__ = "trainings"

    id = Column(Integer, primary_key=True, index=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"))
    title = Column(String)
    description = Column(Text)
    category = Column(String, nullable=True)  # Training category
    location = Column(String, nullable=True)
    cost = Column(Float, nullable=True)
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    delivery_method = Column(Enum(DeliveryMethod))
    status = Column(Enum(TrainingStatus), default=TrainingStatus.ACTIVE)
    expiry_date = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=30))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    image_url = Column(String, nullable=True)  # URL for training image
    highlights = Column(Text, nullable=True)  # Key highlights or features

    # Relationships
    trainer = relationship("Trainer", back_populates="trainings")
    skills = relationship("Skill", secondary=training_skills, back_populates="trainings")
    applications = relationship("TrainingApplication", back_populates="training")

# Training Application model
class TrainingApplication(Base):
    __tablename__ = "training_applications"

    id = Column(Integer, primary_key=True, index=True)
    training_id = Column(Integer, ForeignKey("trainings.id"))
    talent_id = Column(Integer, ForeignKey("talents.id"))
    motivation = Column(Text, nullable=True)
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.PENDING)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    training = relationship("Training", back_populates="applications")
    talent = relationship("Talent", back_populates="training_applications")
    
# SavedJob model
class SavedJob(Base):
    __tablename__ = "saved_jobs"
    
    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("jobs.id"))
    talent_id = Column(Integer, ForeignKey("talents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    job = relationship("Job")
    talent = relationship("Talent", back_populates="saved_jobs")

# Payment model
class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    employer_id = Column(Integer, ForeignKey("employers.id"), nullable=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id"), nullable=True)
    amount = Column(Float)
    currency = Column(String, default="GBP")
    payment_method = Column(String)
    transaction_id = Column(String, unique=True)
    status = Column(String)  # paid, failed, refunded
    package_name = Column(String)  # e.g., "5 job posts"
    package_quantity = Column(Integer)  # e.g., 5
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    employer = relationship("Employer", back_populates="payments")
    trainer = relationship("Trainer", back_populates="payments")

# Job Pricing model
class JobPricing(Base):
    __tablename__ = "job_pricing"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # e.g., "Single Job Post", "5 Job Bundle"
    quantity = Column(Integer)  # Number of jobs included
    price = Column(Float)
    currency = Column(String, default="GBP")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Training Pricing model
class TrainingPricing(Base):
    __tablename__ = "training_pricing"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)  # e.g., "Single Training Post", "5 Training Bundle"
    quantity = Column(Integer)  # Number of trainings included
    price = Column(Float)
    currency = Column(String, default="GBP")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Contact Form Submission model
class ContactSubmission(Base):
    __tablename__ = "contact_submissions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

# Hobby model
class Hobby(Base):
    __tablename__ = "hobbies"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"))
    name = Column(String)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    talent = relationship("Talent", back_populates="hobbies")

# Language model
class Language(Base):
    __tablename__ = "languages"

    id = Column(Integer, primary_key=True, index=True)
    talent_id = Column(Integer, ForeignKey("talents.id"))
    name = Column(String)
    proficiency = Column(String)  # e.g., "Native", "Fluent", "Conversational", "Basic"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    talent = relationship("Talent", back_populates="languages")

# Notification Settings model
class NotificationSettings(Base):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Job updates notifications
    job_updates_in_app = Column(Boolean, default=True)
    job_updates_email = Column(Boolean, default=True)
    
    # Training alerts notifications
    training_alerts_in_app = Column(Boolean, default=True)
    training_alerts_email = Column(Boolean, default=True)
    
    # Application status updates notifications
    application_status_updates_in_app = Column(Boolean, default=True)
    application_status_updates_email = Column(Boolean, default=True)
    
    # Saved job/training reminders notifications
    saved_job_training_reminders_in_app = Column(Boolean, default=True)
    saved_job_training_reminders_email = Column(Boolean, default=False)
    
    # System notifications
    system_notifications_in_app = Column(Boolean, default=True)
    system_notifications_email = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="notification_settings")