from fastapi import APIRouter, Depends, HTTPException, status, Body, Query
from fastapi.security import OAuth2PasswordRequestForm
from typing import List, Optional
from sqlalchemy.orm import Session

# Import models
from app.models.user_models import AdminOut, AdminCreate, TalentOut, EmployerOut, TrainerOut, Token
from app.models.job_models import JobOut, JobPricingOut, JobPricingUpdate
from app.models.training_models import TrainingOut, TrainingPricingOut, TrainingPricingUpdate
from app.models.database_models import User, UserType, JobStatus, TrainingStatus, Payment

# Import services
from app.services.user import UserService
from app.services.job import JobService
from app.services.training import TrainingService
from app.services.payment import PaymentService
from app.services.pricing import PricingService
from app.services.reporting import ReportingService
from app.services.auth import AuthService

# Import dependencies
from app.dependencies.auth import get_current_admin
from app.database import get_db

router = APIRouter()

@router.post("/login", response_model=Token)
async def admin_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Admin login endpoint that authenticates admin users specifically.
    Returns a JWT token upon successful authentication.
    """
    # Authenticate user
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check if user is an admin
    if user.user_type != UserType.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    
    # Check if user is active
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive. Please contact system administrator."
        )
        
    # Generate access token
    return AuthService.create_user_token(user)

@router.post("/admins", response_model=AdminOut, status_code=status.HTTP_201_CREATED)
async def create_admin(
    admin_data: AdminCreate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new admin user (only accessible by existing admins)"""
    try:
        # Check if user with this email already exists
        existing_user = db.query(User).filter(User.email == admin_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Prepare admin data
        admin_dict = {
            "first_name": admin_data.first_name,
            "last_name": admin_data.last_name
        }
        
        # Create the admin user
        new_admin = AuthService.create_admin(
            db=db,
            email=admin_data.email,
            password=admin_data.password,
            admin_data=admin_dict
        )
        
        db.commit()
        
        # Return the created admin
        return AdminOut.model_validate(new_admin, from_attributes=True)
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating admin: {str(e)}"
        )

@router.get("/admins", response_model=List[AdminOut])
async def get_all_admins(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all admin users (only accessible by existing admins)"""
    try:
        # Get all admin users
        admin_users = db.query(User).filter(User.user_type == UserType.ADMIN).all()
        
        # Convert to AdminOut format
        admins_list = []
        for user in admin_users:
            if user.admin:  # Check if admin relationship exists
                admin_out = AdminOut(
                    id=user.id,
                    email=user.email,
                    user_type=user.user_type,
                    is_active=user.is_active,
                    created_at=user.created_at,
                    updated_at=user.updated_at,
                    first_name=user.admin.first_name,
                    last_name=user.admin.last_name
                )
                admins_list.append(admin_out)
        
        return admins_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving admins: {str(e)}"
        )

@router.get("/dashboard")
async def dashboard_overview(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get dashboard overview statistics"""
    try:
        # Get user counts
        total_talents = db.query(User).filter(User.user_type == UserType.TALENT).count()
        total_employers = db.query(User).filter(User.user_type == UserType.EMPLOYER).count()
        total_trainers = db.query(User).filter(User.user_type == UserType.TRAINER).count()
        
        # Get job counts
        total_active_jobs = JobService.get_jobs_count(db, {"status": JobStatus.ACTIVE})
        total_inactive_jobs = JobService.get_jobs_count(db, {"status": JobStatus.ARCHIVED})
        
        # Get training counts
        total_active_trainings = TrainingService.get_trainings_count(db, {"status": TrainingStatus.ACTIVE})
        total_inactive_trainings = TrainingService.get_trainings_count(db, {"status": TrainingStatus.ARCHIVED})
        
        # Calculate total revenue (placeholder - would need payment records)
        total_revenue = 0  # TODO: Implement revenue calculation from payment records
        
        return {
            "total_talents": total_talents,
            "total_employers": total_employers,
            "total_trainers": total_trainers,
            "total_active_jobs": total_active_jobs,
            "total_active_trainings": total_active_trainings,
            "total_inactive_jobs": total_inactive_jobs,
            "total_inactive_trainings": total_inactive_trainings,
            "total_revenue": total_revenue
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching dashboard data: {str(e)}"
        )

# Talent Management
@router.get("/talents", response_model=List[TalentOut])
async def get_all_talents(
    name: Optional[str] = None,
    email: Optional[str] = None,
    tag: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registered talents with optional filters"""
    try:
        # Build filters
        filters = {}
        if name:
            filters["name"] = name
        if email:
            filters["email"] = email
        if tag:
            filters["tag"] = tag
        
        # Get talents from database
        talents = db.query(User).filter(User.user_type == UserType.TALENT)
        
        if name:
            talents = talents.join(User.talent).filter(
                db.text("talents.first_name ILIKE :name OR talents.last_name ILIKE :name")
            ).params(name=f"%{name}%")
        
        if email:
            talents = talents.filter(User.email.ilike(f"%{email}%"))
        
        return talents.offset(skip).limit(limit).all()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching talents: {str(e)}"
        )

@router.put("/talents/{talent_id}/disable")
async def disable_talent(
    talent_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Disable a talent account"""
    try:
        talent = db.query(User).filter(
            User.id == talent_id,
            User.user_type == UserType.TALENT
        ).first()
        
        if not talent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Talent not found"
            )
        
        talent.is_active = False
        db.commit()
        
        return {"message": f"Talent {talent_id} disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error disabling talent: {str(e)}"
        )

@router.delete("/talents/{talent_id}")
async def delete_talent(
    talent_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a talent account"""
    try:
        talent = db.query(User).filter(
            User.id == talent_id,
            User.user_type == UserType.TALENT
        ).first()
        
        if not talent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Talent not found"
            )
        
        db.delete(talent)
        db.commit()
        
        return {"message": f"Talent {talent_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting talent: {str(e)}"
        )

# Employer Management
@router.get("/employers", response_model=List[EmployerOut])
async def get_all_employers(
    name: Optional[str] = None,
    email: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registered employers with optional filters"""
    try:
        # Get employers from database
        employers = db.query(User).filter(User.user_type == UserType.EMPLOYER)
        
        if name:
            employers = employers.join(User.employer).filter(
                db.text("employers.company_name ILIKE :name")
            ).params(name=f"%{name}%")
        
        if email:
            employers = employers.filter(User.email.ilike(f"%{email}%"))
        
        if industry:
            employers = employers.join(User.employer).filter(
                db.text("employers.industry ILIKE :industry")
            ).params(industry=f"%{industry}%")
        
        return employers.offset(skip).limit(limit).all()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching employers: {str(e)}"
        )

@router.post("/employers", status_code=status.HTTP_201_CREATED)
async def create_employer(
    employer_data: dict = Body(...),
    bypass_payment: bool = True,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new employer account (with option to bypass payment)"""
    try:
        # Extract required fields
        email = employer_data.get("email")
        password = employer_data.get("password")
        company_name = employer_data.get("company_name")
        
        if not all([email, password, company_name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, and company_name are required"
            )
        
        # Check if user already exists
        existing_user = AuthService.get_user_by_email(db, email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create employer account
        employer_data["user_type"] = UserType.EMPLOYER
        employer_data["is_verified"] = True  # Admin-created accounts are pre-verified
        
        user = AuthService.create_user(db, employer_data)
        
        return {"message": "Employer account created successfully", "user_id": user.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating employer: {str(e)}"
        )

@router.put("/employers/{employer_id}/disable")
async def disable_employer(
    employer_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Disable an employer account"""
    try:
        employer = db.query(User).filter(
            User.id == employer_id,
            User.user_type == UserType.EMPLOYER
        ).first()
        
        if not employer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        employer.is_active = False
        db.commit()
        
        return {"message": f"Employer {employer_id} disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error disabling employer: {str(e)}"
        )

@router.delete("/employers/{employer_id}")
async def delete_employer(
    employer_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete an employer account"""
    try:
        employer = db.query(User).filter(
            User.id == employer_id,
            User.user_type == UserType.EMPLOYER
        ).first()
        
        if not employer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employer not found"
            )
        
        db.delete(employer)
        db.commit()
        
        return {"message": f"Employer {employer_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting employer: {str(e)}"
        )

# Trainer Management
@router.get("/trainers", response_model=List[TrainerOut])
async def get_all_trainers(
    name: Optional[str] = None,
    email: Optional[str] = None,
    industry: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all registered trainers with optional filters"""
    try:
        # Get trainers from database
        trainers = db.query(User).filter(User.user_type == UserType.TRAINER)
        
        if name:
            trainers = trainers.join(User.trainer).filter(
                db.text("trainers.first_name ILIKE :name OR trainers.last_name ILIKE :name")
            ).params(name=f"%{name}%")
        
        if email:
            trainers = trainers.filter(User.email.ilike(f"%{email}%"))
        
        if industry:
            trainers = trainers.join(User.trainer).filter(
                db.text("trainers.industry ILIKE :industry")
            ).params(industry=f"%{industry}%")
        
        return trainers.offset(skip).limit(limit).all()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching trainers: {str(e)}"
        )

@router.post("/trainers", status_code=status.HTTP_201_CREATED)
async def create_trainer(
    trainer_data: dict = Body(...),
    bypass_payment: bool = True,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new trainer account (with option to bypass payment)"""
    try:
        # Extract required fields
        email = trainer_data.get("email")
        password = trainer_data.get("password")
        first_name = trainer_data.get("first_name")
        last_name = trainer_data.get("last_name")
        
        if not all([email, password, first_name, last_name]):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email, password, first_name, and last_name are required"
            )
        
        # Check if user already exists
        existing_user = AuthService.get_user_by_email(db, email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create trainer account
        trainer_data["user_type"] = UserType.TRAINER
        trainer_data["is_verified"] = True  # Admin-created accounts are pre-verified
        
        user = AuthService.create_user(db, trainer_data)
        
        return {"message": "Trainer account created successfully", "user_id": user.id}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating trainer: {str(e)}"
        )

@router.put("/trainers/{trainer_id}/disable")
async def disable_trainer(
    trainer_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Disable a trainer account"""
    try:
        trainer = db.query(User).filter(
            User.id == trainer_id,
            User.user_type == UserType.TRAINER
        ).first()
        
        if not trainer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer not found"
            )
        
        trainer.is_active = False
        db.commit()
        
        return {"message": f"Trainer {trainer_id} disabled successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error disabling trainer: {str(e)}"
        )

@router.delete("/trainers/{trainer_id}")
async def delete_trainer(
    trainer_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a trainer account"""
    try:
        trainer = db.query(User).filter(
            User.id == trainer_id,
            User.user_type == UserType.TRAINER
        ).first()
        
        if not trainer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Trainer not found"
            )
        
        db.delete(trainer)
        db.commit()
        
        return {"message": f"Trainer {trainer_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting trainer: {str(e)}"
        )

# Job Management
@router.get("/jobs", response_model=List[JobOut])
async def get_all_jobs(
    industry: Optional[str] = None,
    employer: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all jobs with optional filters"""
    try:
        # Build filters
        filters = {}
        if industry:
            filters["industry"] = industry
        if employer:
            filters["employer"] = employer
        if status:
            filters["status"] = status
        
        # Get jobs using JobService
        jobs = JobService.get_jobs(db, skip=skip, limit=limit, filters=filters)
        
        return jobs
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching jobs: {str(e)}"
        )

@router.put("/jobs/{job_id}/unpublish")
async def unpublish_job(
    job_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Unpublish a job posting"""
    try:
        job = JobService.get_job_by_id(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Update job status to archived
        updated_job = JobService.update_job_status(db, job_id, JobStatus.ARCHIVED)
        
        if not updated_job:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to unpublish job"
            )
        
        return {"message": f"Job {job_id} unpublished successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error unpublishing job: {str(e)}"
        )

@router.delete("/jobs/{job_id}")
async def delete_job(
    job_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a job posting"""
    try:
        job = JobService.get_job_by_id(db, job_id)
        
        if not job:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job not found"
            )
        
        # Delete job using JobService
        success = JobService.delete_job(db, job_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete job"
            )
        
        return {"message": f"Job {job_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting job: {str(e)}"
        )

# Training Management
@router.get("/trainings", response_model=List[TrainingOut])
async def get_all_trainings(
    category: Optional[str] = None,
    trainer: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all trainings with optional filters"""
    try:
        # Build filters
        filters = {}
        if category:
            filters["category"] = category
        if trainer:
            filters["trainer"] = trainer
        if status:
            filters["status"] = status
        
        # Get trainings using TrainingService
        trainings = TrainingService.get_trainings(db, skip=skip, limit=limit, filters=filters)
        
        return trainings
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching trainings: {str(e)}"
        )

@router.put("/trainings/{training_id}/unpublish")
async def unpublish_training(
    training_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Unpublish a training posting"""
    try:
        training = TrainingService.get_training_by_id(db, training_id)
        
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training not found"
            )
        
        # Update training status to archived
        updated_training = TrainingService.update_training_status(db, training_id, TrainingStatus.ARCHIVED)
        
        if not updated_training:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to unpublish training"
            )
        
        return {"message": f"Training {training_id} unpublished successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error unpublishing training: {str(e)}"
        )

@router.delete("/trainings/{training_id}")
async def delete_training(
    training_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a training posting"""
    try:
        training = TrainingService.get_training_by_id(db, training_id)
        
        if not training:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training not found"
            )
        
        # Delete training using TrainingService
        success = TrainingService.delete_training(db, training_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete training"
            )
        
        return {"message": f"Training {training_id} deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting training: {str(e)}"
        )

# Payment Management
@router.get("/payments")
async def get_all_payments(
    user_type: Optional[str] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Get all payments with optional filters"""
    try:
        # Use PaymentService to get payments with filters
        filters = {}
        if user_type:
            filters["user_type"] = user_type
        if status:
            filters["status"] = status
        
        payments = PaymentService.get_payments(db, skip=skip, limit=limit, filters=filters)
        
        # Convert to response format
        payment_list = []
        for payment in payments:
            payment_data = {
                "id": payment.id,
                "amount": payment.amount,
                "currency": payment.currency,
                "status": payment.status,
                "payment_intent_id": payment.payment_intent_id,
                "user_id": payment.user_id,
                "created_at": payment.created_at,
                "updated_at": payment.updated_at
            }
            payment_list.append(payment_data)
        
        return payment_list
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching payments: {str(e)}"
        )

# Pricing Management
@router.put("/pricing/jobs")
async def update_job_pricing(
    pricing_data: JobPricingUpdate,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update job posting pricing"""
    try:
        # Update job pricing using PricingService
        updated_pricing = PricingService.update_job_pricing(
            db,
            pricing_data.package_id,
            pricing_data.dict(exclude={"package_id"})
        )
        
        if not updated_pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job pricing package not found"
            )
        
        return {"message": "Job pricing updated successfully", "pricing": updated_pricing}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating job pricing: {str(e)}"
        )

@router.put("/pricing/trainings")
async def update_training_pricing(
    pricing_data: dict = Body(...),
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update training posting pricing"""
    try:
        # Get training pricing package
        package_id = pricing_data.get("package_id")
        if not package_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Package ID is required"
            )
        
        # Update training pricing using PricingService
        updated_pricing = PricingService.get_training_pricing_by_id(db, package_id)
        
        if not updated_pricing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Training pricing package not found"
            )
        
        # Update pricing fields
        for key, value in pricing_data.items():
            if key != "package_id" and hasattr(updated_pricing, key):
                setattr(updated_pricing, key, value)
        
        db.commit()
        db.refresh(updated_pricing)
        
        return {"message": "Training pricing updated successfully", "pricing": updated_pricing}
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating training pricing: {str(e)}"
        )

# Reports
@router.get("/reports/talents")
async def export_talents_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export talents report"""
    try:
        # Generate talents report using ReportingService
        report_data = ReportingService.generate_talents_report(
            db, 
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Talents report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating talents report: {str(e)}"
        )

@router.get("/reports/employers")
async def export_employers_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export employers report"""
    try:
        # Generate employers report using ReportingService
        report_data = ReportingService.generate_employers_report(
            db,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Employers report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating employers report: {str(e)}"
        )

@router.get("/reports/trainers")
async def export_trainers_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export trainers report"""
    try:
        # Generate trainers report using ReportingService
        report_data = ReportingService.generate_trainers_report(
            db,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Trainers report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating trainers report: {str(e)}"
        )

@router.get("/reports/jobs")
async def export_jobs_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export jobs report"""
    try:
        # Generate jobs report using ReportingService
        report_data = ReportingService.generate_jobs_report(
            db,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Jobs report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating jobs report: {str(e)}"
        )

@router.get("/reports/trainings")
async def export_trainings_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export trainings report"""
    try:
        # Generate trainings report using ReportingService
        report_data = ReportingService.generate_trainings_report(
            db,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Trainings report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating trainings report: {str(e)}"
        )

@router.get("/reports/payments")
async def export_payments_report(
    format: str = Query("csv", regex="^(csv|excel|pdf)$"),
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Export payments report"""
    try:
        # Generate payments report using ReportingService
        report_data = ReportingService.generate_payments_report(
            db,
            format=format,
            start_date=start_date,
            end_date=end_date
        )
        
        return {"message": "Payments report exported", "report": report_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating payments report: {str(e)}"
        )