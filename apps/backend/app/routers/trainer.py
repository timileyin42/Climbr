from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

FREE_POSTS_PER_MONTH = 2

def _free_posts_remaining(entity) -> int:
    current_month = datetime.now().strftime("%Y-%m")
    if entity.free_posts_month != current_month:
        return FREE_POSTS_PER_MONTH
    return max(0, FREE_POSTS_PER_MONTH - (entity.free_posts_used or 0))

def _consume_free_post(db, entity) -> None:
    current_month = datetime.now().strftime("%Y-%m")
    if entity.free_posts_month != current_month:
        entity.free_posts_used  = 1
        entity.free_posts_month = current_month
    else:
        entity.free_posts_used = (entity.free_posts_used or 0) + 1
    db.commit()

from app.database import get_db
from app.services.storage import StorageService
from app.dependencies.auth import get_current_user, get_current_trainer
from app.services.pricing import PricingService
from app.services.payment import PaymentService
from app.services.training import TrainingService
from app.models.database_models import Trainer, Payment, TrainingPricing, Training, ApplicationStatus
from app.models.training_models import TrainingCreate, TrainingUpdate

# Import models
# from app.models.user_models import TrainerCreate, TrainerOut, Trainer
# from app.models.training_models import TrainingCreate, TrainingOut, TrainingApplicant

router = APIRouter()

@router.get("/info")
async def trainer_info(db: Session = Depends(get_db)):
    """Get information about trainer benefits and pricing"""
    # Get current pricing from database
    pricing_packages = PricingService.get_training_pricing_packages(db, active_only=True)
    
    pricing_info = []
    for package in pricing_packages:
        pricing_info.append({
            "id": package.id,
            "plan": package.name,
            "price": package.price,
            "quantity": package.quantity,
            "currency": package.currency,
            "description": (
                "Unlimited training posts · Annual · Saves ₦120,000 vs monthly"
                if package.quantity >= 9999 else
                "Unlimited training posts · Monthly subscription"
                if package.quantity >= 999 else
                f"Post {package.quantity} trainings · ₦{int(package.price // package.quantity):,} per post"
            )
        })
    
    return {
        "message": "Start promoting your training today.",
        "benefits": [
            "Access to motivated young learners",
            "Simple applicant management",
            "Performance tracking",
            "30-day training visibility",
            "Email notifications for applications"
        ],
        "pricing": pricing_info
    }

@router.post("/purchase", status_code=status.HTTP_201_CREATED)
async def purchase_credits(
    package_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Initialize a Paystack transaction to purchase training posting credits"""
    try:
        package = PricingService.get_training_pricing_package_by_id(db, package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Pricing package not found")
        if not package.is_active:
            raise HTTPException(status_code=400, detail="Pricing package is not available")

        result = await PaymentService.initialize_transaction(
            amount_ngn=package.price,
            email=current_trainer.user.email,
            metadata={
                "trainer_id": str(current_trainer.id),
                "package_id": str(package.id),
                "package_name": package.name,
                "credits": str(package.quantity),
                "user_type": "trainer",
            },
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"Payment init failed: {result['error']}")

        payment = Payment(
            trainer_id=current_trainer.id,
            amount=package.price,
            currency="NGN",
            payment_method="paystack",
            transaction_id=result["reference"],
            package_name=package.name,
            package_quantity=package.quantity,
        )
        db.add(payment)
        db.commit()

        return {
            "message": "Transaction initialized",
            "authorization_url": result["authorization_url"],
            "access_code": result["access_code"],
            "reference": result["reference"],
            "amount": package.price,
            "currency": "NGN",
            "credits_to_add": package.quantity,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")

@router.post("/confirm-payment")
async def confirm_payment(
    reference: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Verify a Paystack transaction and credit the trainer account"""
    try:
        result = await PaymentService.verify_transaction(reference)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"Verification failed: {result['error']}")

        payment = db.query(Payment).filter(
            Payment.transaction_id == reference,
            Payment.trainer_id == current_trainer.id,
        ).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")

        if result["status"] == "success":
            from app.models.database_models import PaymentStatus
            payment.status = PaymentStatus.SUCCESS
            current_trainer.training_credits += payment.package_quantity
            db.commit()
            return {
                "message": "Payment verified and credits added",
                "credits_added": payment.package_quantity,
                "total_credits": current_trainer.training_credits,
                "payment_status": "success",
            }

        from app.models.database_models import PaymentStatus
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail=f"Payment status: {result['status']}")

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment confirmation failed: {str(e)}")

@router.get("/credits")
async def get_credits(
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Get current training posting credits"""
    return {
        "training_credits": current_trainer.training_credits,
        "free_posts_remaining": _free_posts_remaining(current_trainer),
        "message": f"You have {current_trainer.training_credits} training posting credits remaining"
    }

@router.post("/trainings", status_code=status.HTTP_201_CREATED)
async def create_training(
    training_data: TrainingCreate,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Create a new training posting (2 free per month, then requires credits)"""
    free_left = _free_posts_remaining(current_trainer)
    if free_left > 0:
        _consume_free_post(db, current_trainer)
        used_free = True
    elif current_trainer.training_credits <= 0:
        raise HTTPException(
            status_code=400,
            detail="You've used your 2 free posts this month. Please purchase credits to continue posting."
        )
    else:
        used_free = False

    try:
        training = TrainingService.create_training(db, current_trainer.id, training_data.dict())
        if not used_free:
            current_trainer.training_credits -= 1
        db.commit()

        return {
            "message": "Training created successfully",
            "training_id": training.id,
            "remaining_credits": current_trainer.training_credits,
            "free_posts_remaining": _free_posts_remaining(current_trainer),
            "used_free_post": used_free,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Training creation failed: {str(e)}")

@router.post("/trainings/{training_id}/image")
async def upload_training_image(
    training_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_trainer = Depends(get_current_trainer)
):
    """Upload an image for a training posting"""
    folder = f"trainings/{training_id}"
    file_url = await StorageService.upload_image(file, folder)
    
    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image. Please try again later."
        )
    
    # Update training with image URL
    training = db.query(Training).filter(Training.id == training_id, Training.trainer_id == current_trainer.id).first()
    if not training:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Training not found or you don't have permission to update it"
        )
    training.image_url = file_url
    db.commit()
    
    return {"message": "Training image uploaded successfully", "image_url": file_url}

@router.get("/trainings")
async def get_trainer_trainings(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Get all trainings posted by the current trainer"""
    try:
        # Get trainings for the current trainer
        trainings = TrainingService.get_trainer_trainings(db, current_trainer.id, status=status)
        return {
            "trainings": trainings,
            "trainer_id": current_trainer.id,
            "total_trainings": len(trainings)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve trainings: {str(e)}")

@router.get("/trainings/{training_id}")
async def get_trainer_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Get details for a specific training posted by the current trainer"""
    try:
        # Get the training and verify it belongs to the current trainer
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        return training
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve training: {str(e)}")

@router.put("/trainings/{training_id}")
async def update_training(
    training_id: int,
    training_data: TrainingUpdate,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Update a training posting"""
    try:
        # Verify the training exists and belongs to the current trainer
        existing_training = TrainingService.get_training_by_id_simple(db, training_id)
        if not existing_training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if existing_training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        # Update the training
        updated_training = TrainingService.update_training(db, training_id, training_data.dict(exclude_unset=True))
        return {
            "message": "Training updated successfully",
            "training_id": training_id,
            "updated_training": updated_training
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update training: {str(e)}")

@router.get("/trainings/{training_id}/applicants")
async def get_training_applicants(
    training_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get all applicants for a specific training"""
    try:
        # Verify the training exists and belongs to the current trainer
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        # Get applications for this training
        skip = (page - 1) * limit
        applications = TrainingService.get_training_applications(db, training_id, skip, limit)

        serialized = [
            {
                "id": a.id,
                "talent_id": a.talent_id,
                "user_id": a.talent.user_id if a.talent else None,
                "first_name": a.talent.first_name if a.talent else "",
                "last_name": a.talent.last_name if a.talent else "",
                "email": a.talent.user.email if a.talent and a.talent.user else "",
                "status": a.status.value if hasattr(a.status, "value") else a.status,
                "applied_at": a.created_at.isoformat() if a.created_at else None,
                "resume_url": a.talent.resume_url if a.talent else None,
                "avatar_url": a.talent.profile_image_url if a.talent else None,
                "profile": {},
            }
            for a in applications
        ]

        return {
            "training_id": training_id,
            "training_title": training.title,
            "applications": serialized,
            "page": page,
            "limit": limit,
            "total_applications": len(serialized)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve training applicants: {str(e)}")

@router.post("/trainings/{training_id}/applicants/{applicant_id}/accept")
async def accept_applicant(
    training_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Accept an applicant for a training"""
    try:
        # Verify the training exists and belongs to the current trainer
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        # Update application status to accepted
        updated_application = TrainingService.update_application_status(db, applicant_id, ApplicationStatus.ACCEPTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "message": "Applicant accepted successfully",
            "training_id": training_id,
            "applicant_id": applicant_id,
            "status": "accepted"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to accept applicant: {str(e)}")

@router.post("/trainings/{training_id}/applicants/{applicant_id}/shortlist")
async def shortlist_applicant(
    training_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Shortlist an applicant for a training"""
    try:
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")

        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")

        updated_application = TrainingService.update_application_status(db, applicant_id, ApplicationStatus.SHORTLISTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "message": "Applicant shortlisted successfully",
            "training_id": training_id,
            "applicant_id": applicant_id,
            "status": "shortlisted"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to shortlist applicant: {str(e)}")

@router.post("/trainings/{training_id}/applicants/{applicant_id}/reject")
async def reject_applicant(
    training_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Reject an applicant for a training"""
    try:
        # Verify the training exists and belongs to the current trainer
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        # Update application status to rejected
        updated_application = TrainingService.update_application_status(db, applicant_id, ApplicationStatus.REJECTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "message": "Applicant rejected successfully",
            "training_id": training_id,
            "applicant_id": applicant_id,
            "status": "rejected"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reject applicant: {str(e)}")

@router.post("/trainings/{training_id}/renew")
async def renew_training(
    training_id: int,
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer)
):
    """Renew a training posting for another 30 days"""
    try:
        # Verify the training exists and belongs to the current trainer
        training = TrainingService.get_training_by_id_simple(db, training_id)
        if not training:
            raise HTTPException(status_code=404, detail="Training not found")
        
        if training.trainer_id != current_trainer.id:
            raise HTTPException(status_code=403, detail="Access denied: Training does not belong to you")
        
        # Check if trainer has enough credits
        if current_trainer.training_credits < 1:
            raise HTTPException(status_code=402, detail="Insufficient credits to renew training")
        
        # Deduct credit and extend training expiry
        current_trainer.training_credits -= 1
        training.expiry_date = datetime.utcnow() + timedelta(days=30)

        db.commit()

        return {
            "message": "Training renewed successfully",
            "training_id": training_id,
            "new_expiry_date": training.expiry_date.isoformat(),
            "remaining_credits": current_trainer.training_credits
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to renew training: {str(e)}")


@router.post("/profile/logo")
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_trainer: Trainer = Depends(get_current_trainer),
):
    """Upload or replace the trainer organisation logo."""
    if current_trainer.logo_url:
        await StorageService.delete_file(current_trainer.logo_url)

    folder = f"trainer_logos/{current_trainer.id}"
    file_url = await StorageService.upload_image(file, folder)
    if not file_url:
        raise HTTPException(status_code=500, detail="Failed to upload logo. Please try again.")

    current_trainer.logo_url = file_url
    db.commit()
    return {"message": "Logo uploaded successfully", "logo_url": file_url}


@router.get("/profile/logo")
async def get_logo(current_trainer: Trainer = Depends(get_current_trainer)):
    """Return the current trainer logo URL."""
    return {"logo_url": current_trainer.logo_url}