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
from app.models.database_models import User, Employer, Payment, JobPricing, Job, ApplicationStatus, Talent
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
    """Initialize a Paystack transaction to purchase job posting credits"""
    try:
        package = PricingService.get_job_pricing_package_by_id(db, package_id)
        if not package:
            raise HTTPException(status_code=404, detail="Pricing package not found")
        if not package.is_active:
            raise HTTPException(status_code=400, detail="Pricing package is not available")

        result = await PaymentService.initialize_transaction(
            amount_ngn=package.price,
            email=current_employer.user.email,
            metadata={
                "employer_id": str(current_employer.id),
                "package_id": str(package.id),
                "package_name": package.name,
                "credits": str(package.quantity),
                "user_type": "employer",
            },
        )
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"Payment init failed: {result['error']}")

        payment = Payment(
            employer_id=current_employer.id,
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
    current_employer: Employer = Depends(get_current_employer)
):
    """Verify a Paystack transaction and credit the employer account"""
    try:
        result = await PaymentService.verify_transaction(reference)
        if not result["success"]:
            raise HTTPException(status_code=400, detail=f"Verification failed: {result['error']}")

        payment = db.query(Payment).filter(
            Payment.transaction_id == reference,
            Payment.employer_id == current_employer.id,
        ).first()
        if not payment:
            raise HTTPException(status_code=404, detail="Payment record not found")

        if result["status"] == "success":
            from app.models.database_models import PaymentStatus
            payment.status = PaymentStatus.SUCCESS
            current_employer.job_credits += payment.package_quantity
            db.commit()
            return {
                "message": "Payment verified and credits added",
                "credits_added": payment.package_quantity,
                "total_credits": current_employer.job_credits,
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
        job = JobService.create_job(db, current_employer.id, job_data.dict())
        current_employer.job_credits -= 1
        db.commit()

        # Fire-and-forget: notify matching talents asynchronously
        try:
            from app.tasks.notification_tasks import notify_new_job_matches
            notify_new_job_matches.delay(job.id)
        except Exception:
            pass  # worker not running in dev — don't fail the request

        return {
            "message": "Job created successfully",
            "job_id": job.id,
            "remaining_credits": current_employer.job_credits
        }

    except HTTPException:
        raise
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
            "job_id": job_id,
            "job_title": job.title,
            "applications": serialized,
            "page": page,
            "limit": limit,
            "total_applications": len(serialized)
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

        _fire_status_notification(updated_application, job, "accepted")
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

        _fire_status_notification(updated_application, job, "shortlisted")
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

        _fire_status_notification(updated_application, job, "rejected")
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

def _fire_status_notification(application, job, new_status: str):
    """Fire the application-status notification task without blocking the response."""
    try:
        from app.tasks.notification_tasks import notify_application_status_update
        talent = application.talent
        if not talent or not talent.user:
            return
        notify_application_status_update.delay(
            talent_user_id=talent.user.id,
            talent_email=talent.user.email,
            first_name=talent.first_name or "there",
            job_title=job.title,
            new_status=new_status,
            job_id=job.id,
        )
    except Exception:
        pass  # worker not running — don't fail the request


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


@router.post("/profile/logo")
async def upload_logo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_employer: Employer = Depends(get_current_employer),
):
    """Upload or replace the employer company logo."""
    if current_employer.logo_url:
        await StorageService.delete_file(current_employer.logo_url)

    folder = f"employer_logos/{current_employer.id}"
    file_url = await StorageService.upload_image(file, folder)
    if not file_url:
        raise HTTPException(status_code=500, detail="Failed to upload logo. Please try again.")

    current_employer.logo_url = file_url
    db.commit()
    return {"message": "Logo uploaded successfully", "logo_url": file_url}


@router.get("/profile/logo")
async def get_logo(current_employer: Employer = Depends(get_current_employer)):
    """Return the current employer logo URL."""
    return {"logo_url": current_employer.logo_url}