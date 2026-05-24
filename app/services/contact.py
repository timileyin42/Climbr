from sqlalchemy.orm import Session
from typing import List, Optional
from fastapi import BackgroundTasks
import os

# Import models
from app.models.database_models import ContactSubmission
from app.services.email import EmailService

class ContactService:
    @staticmethod
    async def create_contact_submission(db: Session, name: str, email: str, message: str, background_tasks: BackgroundTasks = None) -> ContactSubmission:
        """
        Create a new contact form submission.
        
        Args:
            db: Database session
            name: Sender's name
            email: Sender's email
            message: Message content
            
        Returns:
            Created ContactSubmission object
        """
        # Create contact submission record
        contact_submission = ContactSubmission(
            name=name,
            email=email,
            message=message,
            is_read=False
        )
        
        db.add(contact_submission)
        db.commit()
        db.refresh(contact_submission)
        
        # Send notification email to admin
        if background_tasks:
            admin_email = os.getenv("ADMIN_EMAIL", "admin@climbr.com")
            await EmailService.send_email(
                background_tasks=background_tasks,
                to_email=admin_email,
                subject=f"New Contact Form Submission from {name}",
                template_name="contact_notification.html",
                template_data={
                    "name": name,
                    "email": email,
                    "message": message,
                    "submission_id": contact_submission.id,
                    "submitted_at": contact_submission.created_at
                }
            )
        
        return contact_submission
    
    @staticmethod
    def get_contact_submissions(db: Session, skip: int = 0, limit: int = 100, unread_only: bool = False) -> List[ContactSubmission]:
        """
        Get contact form submissions.
        
        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            unread_only: If True, only return unread submissions
            
        Returns:
            List of ContactSubmission objects
        """
        query = db.query(ContactSubmission)
        
        if unread_only:
            query = query.filter(ContactSubmission.is_read == False)
        
        return query.order_by(ContactSubmission.created_at.desc()).offset(skip).limit(limit).all()
    
    @staticmethod
    def get_contact_submission_by_id(db: Session, submission_id: int) -> Optional[ContactSubmission]:
        """
        Get a contact form submission by ID.
        
        Args:
            db: Database session
            submission_id: Submission ID
            
        Returns:
            ContactSubmission object if found, None otherwise
        """
        return db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    
    @staticmethod
    def mark_as_read(db: Session, submission_id: int) -> Optional[ContactSubmission]:
        """
        Mark a contact form submission as read.
        
        Args:
            db: Database session
            submission_id: Submission ID
            
        Returns:
            Updated ContactSubmission object if found, None otherwise
        """
        submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
        
        if not submission:
            return None
        
        submission.is_read = True
        db.commit()
        db.refresh(submission)
        
        return submission
    
    @staticmethod
    def delete_contact_submission(db: Session, submission_id: int) -> bool:
        """
        Delete a contact form submission.
        
        Args:
            db: Database session
            submission_id: Submission ID
            
        Returns:
            True if submission was deleted, False otherwise
        """
        submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
        
        if not submission:
            return False
        
        db.delete(submission)
        db.commit()
        
        return True