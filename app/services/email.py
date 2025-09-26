from typing import List, Dict, Any, Optional
from fastapi import BackgroundTasks
import logging
import os
import httpx
from pydantic import EmailStr
from pathlib import Path
import jinja2

logger = logging.getLogger(__name__)

# Resend API configuration
RESEND_API_KEY = os.getenv("RESEND_API_KEY")
RESEND_API_URL = "https://api.resend.com/emails"
FROM_EMAIL = os.getenv("FROM_EMAIL", "no-reply@irxcruit.com")
FROM_NAME = os.getenv("FROM_NAME", "iRxcruit Team")

# Templates configuration
TEMPLATES_DIR = Path(os.getenv("TEMPLATES_DIR", Path(__file__).parent.parent / "templates"))

# Create templates directory if it doesn't exist
TEMPLATES_DIR.mkdir(exist_ok=True, parents=True)

class EmailService:
    """
    Service for sending email notifications.
    """
    
    @staticmethod
    async def send_email(background_tasks: BackgroundTasks, to_email: str, subject: str, template_name: str, template_data: Dict[str, Any]) -> None:
        """
        Send an email asynchronously using background tasks.
        
        Args:
            background_tasks: FastAPI BackgroundTasks object
            to_email: Recipient email address
            subject: Email subject
            template_name: Name of the email template to use
            template_data: Data to populate the template
        """
        background_tasks.add_task(EmailService._send_email_task, to_email, subject, template_name, template_data)
    
    @staticmethod
    async def _send_email_task(to_email: str, subject: str, template_name: str, template_data: Dict[str, Any]) -> None:
        """
        Background task for sending an email using Resend API.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            template_name: Name of the email template to use
            template_data: Data to populate the template
        """
        if not RESEND_API_KEY:
            logger.error("RESEND_API_KEY is not set. Email sending is disabled.")
            return
            
        logger.info(f"Sending email to {to_email} with subject '{subject}' using template '{template_name}'")
        logger.debug(f"Template data: {template_data}")
        
        # Try to load template from templates directory
        template_path = TEMPLATES_DIR / template_name
        
        if template_path.exists():
            # Load template using Jinja2
            template_loader = jinja2.FileSystemLoader(searchpath=TEMPLATES_DIR)
            template_env = jinja2.Environment(loader=template_loader)
            template = template_env.get_template(template_name)
            html_content = template.render(**template_data)
        else:
            # Fallback to simple HTML content
            logger.warning(f"Template {template_name} not found. Using fallback template.")
            html_content = f"<h1>{subject}</h1>"
            for key, value in template_data.items():
                html_content += f"<p><strong>{key}:</strong> {value}</p>"
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    RESEND_API_URL,
                    json={
                        "from": f"{FROM_NAME} <{FROM_EMAIL}>",
                        "to": [to_email],
                        "subject": subject,
                        "html": html_content,
                    },
                    headers={
                        "Authorization": f"Bearer {RESEND_API_KEY}",
                        "Content-Type": "application/json"
                    }
                )
                
                if response.status_code == 200:
                    logger.info(f"Email sent successfully to {to_email}")
                else:
                    logger.error(f"Failed to send email: {response.status_code} - {response.text}")
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            raise
    
    @staticmethod
    async def send_welcome_email(background_tasks: BackgroundTasks, to_email: str, user_name: str) -> None:
        """
        Send a welcome email to a new user.
        
        Args:
            background_tasks: FastAPI BackgroundTasks object
            to_email: Recipient email address
            user_name: Name of the user
        """
        subject = "Welcome to iRxcruit!"
        template_name = "welcome.html"
        template_data = {
            "user_name": user_name,
            "platform_name": "iRxcruit",
            "login_url": "https://irxcruit.com/login"
        }
        
        await EmailService.send_email(background_tasks, to_email, subject, template_name, template_data)
    
    @staticmethod
    async def send_verification_email(to_email: str, verification_link: str) -> None:
        """
        Send an email verification link to a user.
        
        Args:
            to_email: Recipient email address
            verification_link: Link for email verification
        """
        subject = "Verify Your Email Address"
        template_name = "email_verification.html"
        template_data = {
            "verification_link": verification_link,
            "platform_name": "iRxcruit",
            "expiry_hours": 24  # Token expires in 24 hours
        }
        
        # Since this is called directly without background_tasks, use _send_email_task directly
        await EmailService._send_email_task(to_email, subject, template_name, template_data)
    
    @staticmethod
    async def send_password_reset_email(to_email: str, reset_link: str) -> None:
        """
        Send a password reset link to a user.
        
        Args:
            to_email: Recipient email address
            reset_link: Link for password reset
        """
        subject = "Reset Your Password"
        template_name = "password_reset.html"
        template_data = {
            "reset_link": reset_link,
            "platform_name": "iRxcruit",
            "expiry_hours": 1  # Token expires in 1 hour
        }
        
        # Since this is called directly without background_tasks, use _send_email_task directly
        await EmailService._send_email_task(to_email, subject, template_name, template_data)
    
    @staticmethod
    async def send_application_confirmation(background_tasks: BackgroundTasks, to_email: str, user_name: str, job_or_training_title: str, is_job: bool = True) -> None:
        """
        Send a confirmation email for a job or training application.
        
        Args:
            background_tasks: FastAPI BackgroundTasks object
            to_email: Recipient email address
            user_name: Name of the user
            job_or_training_title: Title of the job or training
            is_job: Whether this is a job application (True) or training application (False)
        """
        application_type = "job" if is_job else "training"
        subject = f"Your {application_type} application has been submitted"
        template_name = "application_confirmation.html"
        template_data = {
            "user_name": user_name,
            "application_type": application_type,
            "title": job_or_training_title,
            "dashboard_url": "https://irxcruit.com/talent/dashboard"
        }
        
        await EmailService.send_email(background_tasks, to_email, subject, template_name, template_data)
    
    @staticmethod
    async def send_application_status_update(background_tasks: BackgroundTasks, to_email: str, user_name: str, job_or_training_title: str, is_job: bool = True) -> None:
        """
        Send a notification email for an application status update.
        
        Args:
            background_tasks: FastAPI BackgroundTasks object
            to_email: Recipient email address
            user_name: Name of the user
            job_or_training_title: Title of the job or training
            is_job: Whether this is a job application (True) or training application (False)
        """
        application_type = "job" if is_job else "training"
        subject = f"Update on your {application_type} application"
        template_name = "application_status_update.html"
        template_data = {
            "user_name": user_name,
            "application_type": application_type,
            "title": job_or_training_title,
            "dashboard_url": "https://irxcruit.com/talent/dashboard"
        }
        
        await EmailService.send_email(background_tasks, to_email, subject, template_name, template_data)