from fastapi import APIRouter, Depends, HTTPException, status, Body, UploadFile, File, Query
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from datetime import datetime, timedelta

from app.database import get_db
from app.services.storage import StorageService
from app.dependencies.auth import get_current_user, get_current_employer
from app.services.user import UserService
from app.services.payment import PaymentService
from app.services.pricing import PricingService
from app.services.job import JobService
from app.models.user_models import EmployerOut
from app.models.database_models import User, Employer, Payment, JobPricing, Job, ApplicationStatus
from app.models.job_models import JobCreate, JobUpdate

# from app.models.job_models import JobCreate, JobOut, JobApplicant

router = APIRouter()

@router.get("/info")
async def employer_info(db: Session = Depends(get_db)):
    """Get information about employer benefits and pricing"""
    # Get current pricing from database
    pricing_packages = PricingService.get_job_pricing_packages(db, active_only=True)
    
    pricing_info = []
    for package in pricing_packages:
        pricing_info.append({
            "id": package.id,
            "plan": package.name,
            "price": package.price,
            "quantity": package.quantity,
            "currency": package.currency,
            "description": f"Post {package.quantity} job{'s' if package.quantity > 1 else ''} for 30 days each"
        })
    
    return {
        "message": "Find the talent you've been dreaming of.",
        "benefits": [
            "Access to qualified young talent",
            "Simple applicant management",
            "Performance tracking",
            "30-day job visibility",
            "Email notifications for applications"
        ],
        "pricing": pricing_info
    }

@router.post("/purchase", status_code=status.HTTP_201_CREATED)
async def purchase_credits(
    package_id: int = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Purchase job posting credits"""
    try:
        # Get the pricing package
        package = PricingService.get_job_pricing_package_by_id(db, package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Pricing package not found")
        
        if not package.is_active:
            raise HTTPException(status_code=400, detail="Pricing package is not available")
        
        # Create payment intent with Stripe
        payment_result = await PaymentService.create_payment_intent(
            amount=package.price,
            currency=package.currency,
            customer_email=current_employer.user.email,
            metadata={
                "employer_id": str(current_employer.id),
                "package_id": str(package.id),
                "package_name": package.name,
                "credits": str(package.quantity)
            }
        )
        
        if not payment_result["success"]:
            raise HTTPException(status_code=400, detail=f"Payment failed: {payment_result['error']}")
        
        # Create payment record
        payment = Payment(
            employer_id=current_employer.id,
            amount=package.price,
            currency=package.currency,
            payment_method="stripe",
            transaction_id=payment_result["payment_id"],
            status="pending",
            package_name=package.name,
            package_quantity=package.quantity
        )
        db.add(payment)
        db.commit()
        
        return {
            "message": "Payment intent created successfully",
            "payment_intent_id": payment_result["payment_id"],
            "client_secret": payment_result["client_secret"],
            "amount": package.price,
            "currency": package.currency,
            "credits_to_add": package.quantity
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Purchase failed: {str(e)}")

@router.post("/confirm-payment")
async def confirm_payment(
    payment_intent_id: str = Body(..., embed=True),
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Confirm payment and add credits to employer account"""
    try:
        # Get payment status from Stripe
        payment_status = await PaymentService.get_payment_status(payment_intent_id)
        
        # Find the payment record
        payment = db.query(Payment).filter(
            Payment.transaction_id == payment_intent_id,
            Payment.employer_id == current_employer.id
        ).first()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")
        
        if payment_status["status"] == "succeeded":
            # Update payment status
            payment.status = "paid"
            
            # Add credits to employer account
            current_employer.job_credits += payment.package_quantity
            
            db.commit()
            
            return {
                "message": "Payment confirmed and credits added",
                "credits_added": payment.package_quantity,
                "total_credits": current_employer.job_credits,
                "payment_status": "succeeded"
            }
        else:
            # Update payment status to failed
            payment.status = "failed"
            db.commit()
            
            raise HTTPException(status_code=400, detail="Payment was not successful")
            
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Payment confirmation failed: {str(e)}")

@router.get("/credits")
async def get_credits(
    current_employer: Employer = Depends(get_current_employer)
):
    """Get current job posting credits"""
    return {
        "job_credits": current_employer.job_credits,
        "message": f"You have {current_employer.job_credits} job posting credits remaining"
    }

@router.post("/jobs", status_code=status.HTTP_201_CREATED)
async def create_job(
    job_data: JobCreate,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Create a new job posting (requires credits)"""
    # Check if employer has credits
    if current_employer.job_credits <= 0:
        raise HTTPException(
            status_code=400, 
            detail="Insufficient credits. Please purchase a job posting package."
        )
    
    try:
        # Create the job using JobService
        job = JobService.create_job(db, current_employer.id, job_data.dict())
        
        # Deduct one credit after successful job creation
        current_employer.job_credits -= 1
        db.commit()
        
        return {
            "message": "Job created successfully",
            "job_id": job.id,
            "remaining_credits": current_employer.job_credits
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Job creation failed: {str(e)}")

@router.post("/jobs/{job_id}/image")
async def upload_job_image(
    job_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_employer = Depends(get_current_employer)
):
    """Upload an image for a job posting"""
    folder = f"jobs/{job_id}"
    file_url = await StorageService.upload_image(file, folder)

    if not file_url:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload image. Please try again later."
        )

    # Update the job
    job = db.query(Job).filter(Job.id == job_id, Job.employer_id == current_employer.id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found or you don't have permission to update it"
        )
    job.image_url = file_url
    db.commit()
    
    return {"message": "Job image uploaded successfully", "image_url": file_url}

@router.get("/jobs")
async def get_employer_jobs(
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Get all jobs posted by the current employer"""
    try:
        # Get jobs for the current employer
        jobs = JobService.get_employer_jobs(db, current_employer.id, status=status)
        return {
            "jobs": jobs,
            "total": len(jobs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve jobs: {str(e)}")

@router.get("/jobs/{job_id}")
async def get_employer_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Get details for a specific job posted by the current employer"""
    try:
        # Get the job and verify it belongs to the current employer
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        return job
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve job: {str(e)}")

@router.put("/jobs/{job_id}")
async def update_job(
    job_id: int,
    job_data: JobUpdate,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Update a job posting"""
    try:
        # Verify the job exists and belongs to the current employer
        existing_job = JobService.get_job_by_id_simple(db, job_id)
        if not existing_job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if existing_job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        # Update the job
        updated_job = JobService.update_job(db, job_id, job_data.dict(exclude_unset=True))
        return {
            "message": "Job updated successfully",
            "job_id": job_id,
            "updated_job": updated_job
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to update job: {str(e)}")

@router.get("/jobs/{job_id}/applicants")
async def get_job_applicants(
    job_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(20, ge=1, le=100, description="Items per page")
):
    """Get all applicants for a specific job"""
    try:
        # Verify the job exists and belongs to the current employer
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        # Get applications for this job
        skip = (page - 1) * limit
        applications = JobService.get_job_applications(db, job_id, skip, limit)
        
        return {
            "job_id": job_id,
            "job_title": job.title,
            "applications": applications,
            "page": page,
            "limit": limit,
            "total_applications": len(applications)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve job applicants: {str(e)}")

@router.post("/jobs/{job_id}/applicants/{applicant_id}/accept")
async def accept_applicant(
    job_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Accept an applicant for a job"""
    try:
        # Verify the job exists and belongs to the current employer
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        # Update application status to accepted
        updated_application = JobService.update_application_status(db, applicant_id, ApplicationStatus.ACCEPTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "message": "Applicant accepted successfully",
            "job_id": job_id,
            "applicant_id": applicant_id,
            "status": "accepted"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to accept applicant: {str(e)}")

@router.post("/jobs/{job_id}/applicants/{applicant_id}/shortlist")
async def shortlist_applicant(
    job_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Shortlist an applicant for a job"""
    try:
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")

        updated_application = JobService.update_application_status(db, applicant_id, ApplicationStatus.SHORTLISTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")

        return {
            "message": "Applicant shortlisted successfully",
            "job_id": job_id,
            "applicant_id": applicant_id,
            "status": "shortlisted"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to shortlist applicant: {str(e)}")

@router.post("/jobs/{job_id}/applicants/{applicant_id}/reject")
async def reject_applicant(
    job_id: int,
    applicant_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Reject an applicant for a job"""
    try:
        # Verify the job exists and belongs to the current employer
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        # Update application status to rejected
        updated_application = JobService.update_application_status(db, applicant_id, ApplicationStatus.REJECTED)
        if not updated_application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            "message": "Applicant rejected successfully",
            "job_id": job_id,
            "applicant_id": applicant_id,
            "status": "rejected"
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reject applicant: {str(e)}")

@router.post("/jobs/{job_id}/renew")
async def renew_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer)
):
    """Renew a job posting for another 30 days"""
    try:
        # Verify the job exists and belongs to the current employer
        job = JobService.get_job_by_id_simple(db, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        if job.employer_id != current_employer.id:
            raise HTTPException(status_code=403, detail="Access denied: Job does not belong to you")
        
        # Check if employer has enough credits
        if current_employer.job_credits < 1:
            raise HTTPException(status_code=402, detail="Insufficient credits to renew job")
        
        # Deduct credit and extend job expiry
        current_employer.job_credits -= 1
        job.expiry_date = datetime.utcnow() + timedelta(days=30)

        db.commit()

        return {
            "message": "Job renewed successfully",
            "job_id": job_id,
            "new_expiry_date": job.expiry_date.isoformat(),
            "remaining_credits": current_employer.job_credits
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to renew job: {str(e)}")