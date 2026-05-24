from typing import List, Dict, Any, Optional
import csv
import io
from datetime import datetime

from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session


class ReportingService:
    """
    Service for generating reports and data exports.
    """

    @staticmethod
    def _make_csv(data: List[Dict[str, Any]], headers: List[str]) -> str:
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers, extrasaction="ignore")
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue()

    @staticmethod
    def _csv_response(csv_text: str, filename: str) -> StreamingResponse:
        return StreamingResponse(
            iter([csv_text]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename={filename}"},
        )

    # ------------------------------------------------------------------
    # Talents
    # ------------------------------------------------------------------
    @staticmethod
    def generate_talents_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import User, Talent, UserType

        query = db.query(User, Talent).join(Talent, User.id == Talent.user_id).filter(
            User.user_type == UserType.TALENT
        )
        if start_date:
            query = query.filter(User.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(User.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for user, talent in query.all():
            rows.append({
                "id": user.id,
                "first_name": talent.first_name,
                "last_name": talent.last_name,
                "email": user.email,
                "phone": talent.phone,
                "created_at": str(user.created_at),
                "is_active": user.is_active,
            })

        headers = ["id", "first_name", "last_name", "email", "phone", "created_at", "is_active"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "talents_report.csv")
        return rows

    # ------------------------------------------------------------------
    # Employers
    # ------------------------------------------------------------------
    @staticmethod
    def generate_employers_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import User, Employer, UserType

        query = db.query(User, Employer).join(Employer, User.id == Employer.user_id).filter(
            User.user_type == UserType.EMPLOYER
        )
        if start_date:
            query = query.filter(User.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(User.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for user, employer in query.all():
            rows.append({
                "id": user.id,
                "company_name": employer.company_name,
                "contact_name": employer.contact_name,
                "email": user.email,
                "phone": employer.phone,
                "industry": employer.industry,
                "job_count": len(employer.jobs),
                "created_at": str(user.created_at),
                "is_active": user.is_active,
            })

        headers = ["id", "company_name", "contact_name", "email", "phone", "industry", "job_count", "created_at", "is_active"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "employers_report.csv")
        return rows

    # ------------------------------------------------------------------
    # Trainers
    # ------------------------------------------------------------------
    @staticmethod
    def generate_trainers_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import User, Trainer, UserType

        query = db.query(User, Trainer).join(Trainer, User.id == Trainer.user_id).filter(
            User.user_type == UserType.TRAINER
        )
        if start_date:
            query = query.filter(User.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(User.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for user, trainer in query.all():
            rows.append({
                "id": user.id,
                "provider_name": trainer.provider_name,
                "contact_name": trainer.contact_name,
                "email": user.email,
                "phone": trainer.phone,
                "industry": trainer.industry,
                "training_count": len(trainer.trainings),
                "created_at": str(user.created_at),
                "is_active": user.is_active,
            })

        headers = ["id", "provider_name", "contact_name", "email", "phone", "industry", "training_count", "created_at", "is_active"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "trainers_report.csv")
        return rows

    # ------------------------------------------------------------------
    # Jobs
    # ------------------------------------------------------------------
    @staticmethod
    def generate_jobs_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import Job, Employer

        query = db.query(Job, Employer).join(Employer, Job.employer_id == Employer.id)
        if start_date:
            query = query.filter(Job.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(Job.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for job, employer in query.all():
            rows.append({
                "id": job.id,
                "title": job.title,
                "employer_name": employer.company_name,
                "job_type": job.job_type,
                "industry": job.industry,
                "location": job.location,
                "applicant_count": len(job.applications),
                "status": job.status,
                "created_at": str(job.created_at),
                "expiry_date": str(job.expiry_date),
            })

        headers = ["id", "title", "employer_name", "job_type", "industry", "location", "applicant_count", "status", "created_at", "expiry_date"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "jobs_report.csv")
        return rows

    # ------------------------------------------------------------------
    # Trainings
    # ------------------------------------------------------------------
    @staticmethod
    def generate_trainings_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import Training, Trainer

        query = db.query(Training, Trainer).join(Trainer, Training.trainer_id == Trainer.id)
        if start_date:
            query = query.filter(Training.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(Training.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for training, trainer in query.all():
            rows.append({
                "id": training.id,
                "title": training.title,
                "trainer_name": trainer.provider_name,
                "category": training.category,
                "start_date": str(training.start_date),
                "cost": training.cost,
                "delivery_method": training.delivery_method,
                "applicant_count": len(training.applications),
                "status": training.status,
                "created_at": str(training.created_at),
                "expiry_date": str(training.expiry_date),
            })

        headers = ["id", "title", "trainer_name", "category", "start_date", "cost", "delivery_method", "applicant_count", "status", "created_at", "expiry_date"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "trainings_report.csv")
        return rows

    # ------------------------------------------------------------------
    # Payments
    # ------------------------------------------------------------------
    @staticmethod
    def generate_payments_report(
        db: Session,
        format: str = "csv",
        start_date: Optional[str] = None,
        end_date: Optional[str] = None,
    ):
        from app.models.database_models import Payment

        query = db.query(Payment)
        if start_date:
            query = query.filter(Payment.created_at >= datetime.strptime(start_date, "%Y-%m-%d"))
        if end_date:
            query = query.filter(Payment.created_at <= datetime.strptime(end_date, "%Y-%m-%d"))

        rows = []
        for payment in query.all():
            user_type = "employer" if payment.employer_id else "trainer"
            user_name = ""
            if payment.employer:
                user_name = payment.employer.company_name
            elif payment.trainer:
                user_name = payment.trainer.provider_name
            rows.append({
                "id": payment.id,
                "user_type": user_type,
                "user_name": user_name,
                "amount": payment.amount,
                "currency": payment.currency,
                "package": payment.package_name,
                "status": payment.status,
                "created_at": str(payment.created_at),
            })

        headers = ["id", "user_type", "user_name", "amount", "currency", "package", "status", "created_at"]
        if format == "csv":
            csv_text = ReportingService._make_csv(rows, headers)
            return ReportingService._csv_response(csv_text, "payments_report.csv")
        return rows
