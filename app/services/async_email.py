import asyncio
from typing import Dict, Any, List, Optional
from concurrent.futures import ThreadPoolExecutor
from app.services.email import EmailService
import logging

logger = logging.getLogger(__name__)

class AsyncEmailService:
    """Async wrapper for email service to handle background email processing"""
    
    def __init__(self):
        self.email_service = EmailService()
        self.executor = ThreadPoolExecutor(max_workers=5, thread_name_prefix="email_worker")
    
    async def send_email_async(self, 
                              to_email: str, 
                              subject: str, 
                              template_name: str, 
                              template_data: Dict[str, Any]) -> bool:
        """Send email asynchronously using thread pool"""
        try:
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                self.executor,
                self._send_email_sync,
                to_email,
                subject,
                template_name,
                template_data
            )
            return result
        except Exception as e:
            logger.error(f"Async email sending failed: {str(e)}")
            return False
    
    def _send_email_sync(self, 
                        to_email: str, 
                        subject: str, 
                        template_name: str, 
                        template_data: Dict[str, Any]) -> bool:
        """Synchronous email sending wrapper"""
        try:
            return self.email_service.send_email(
                to_email=to_email,
                subject=subject,
                template_name=template_name,
                template_data=template_data
            )
        except Exception as e:
            logger.error(f"Email sending failed: {str(e)}")
            return False
    
    async def send_verification_email_async(self, 
                                          user_email: str, 
                                          user_name: str, 
                                          verification_url: str) -> bool:
        """Send verification email asynchronously"""
        template_data = {
            "first_name": user_name,
            "verification_url": verification_url
        }
        
        return await self.send_email_async(
            to_email=user_email,
            subject="Verify Your Email Address - Climbr",
            template_name="email_verification.html",
            template_data=template_data
        )
    
    async def send_welcome_email_async(self, 
                                     user_email: str, 
                                     user_name: str, 
                                     user_type: str,
                                     platform_url: str) -> bool:
        """Send welcome email asynchronously"""
        template_data = {
            "first_name": user_name,
            "user_type": user_type,
            "platform_url": platform_url,
            "email": user_email
        }
        
        return await self.send_email_async(
            to_email=user_email,
            subject="Welcome to Climbr!",
            template_name="welcome.html",
            template_data=template_data
        )
    
    async def send_password_reset_email_async(self, 
                                            user_email: str, 
                                            user_name: str, 
                                            reset_url: str) -> bool:
        """Send password reset email asynchronously"""
        template_data = {
            "first_name": user_name,
            "reset_url": reset_url
        }
        
        return await self.send_email_async(
            to_email=user_email,
            subject="Reset Your Password - Climbr",
            template_name="password_reset.html",
            template_data=template_data
        )
    
    async def send_application_confirmation_async(self, 
                                                 applicant_email: str, 
                                                 applicant_name: str, 
                                                 job_title: str,
                                                 company_name: str,
                                                 application_id: str,
                                                 dashboard_url: str) -> bool:
        """Send application confirmation email asynchronously"""
        template_data = {
            "applicant_name": applicant_name,
            "job_title": job_title,
            "company_name": company_name,
            "application_id": application_id,
            "dashboard_url": dashboard_url,
            "applicant_email": applicant_email,
            "submission_date": "now"
        }
        
        return await self.send_email_async(
            to_email=applicant_email,
            subject=f"Application Confirmation - {job_title}",
            template_name="application_confirmation.html",
            template_data=template_data
        )
    
    async def send_bulk_emails_async(self, email_tasks: List[Dict[str, Any]]) -> List[bool]:
        """Send multiple emails concurrently"""
        tasks = []
        for email_task in email_tasks:
            task = self.send_email_async(
                to_email=email_task["to_email"],
                subject=email_task["subject"],
                template_name=email_task["template_name"],
                template_data=email_task["template_data"]
            )
            tasks.append(task)
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Convert exceptions to False
        return [result if isinstance(result, bool) else False for result in results]
    
    def create_background_task(self, 
                             to_email: str, 
                             subject: str, 
                             template_name: str, 
                             template_data: Dict[str, Any]) -> asyncio.Task:
        """Create a background task for email sending"""
        return asyncio.create_task(
            self.send_email_async(to_email, subject, template_name, template_data)
        )
    
    async def shutdown(self):
        """Shutdown the thread pool executor"""
        self.executor.shutdown(wait=True)

# Global instance
async_email_service = AsyncEmailService()