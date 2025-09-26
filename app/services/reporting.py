from typing import List, Dict, Any, Optional
import csv
import io
from datetime import datetime

class ReportingService:
    """
    Service for generating reports and data exports.
    """
    
    @staticmethod
    async def generate_csv(data: List[Dict[str, Any]], headers: List[str]) -> str:
        """
        Generate a CSV string from a list of dictionaries.
        
        Args:
            data: List of dictionaries containing the data
            headers: List of header names for the CSV
            
        Returns:
            CSV formatted string
        """
        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()
        writer.writerows(data)
        return output.getvalue()
    
    @staticmethod
    async def generate_talents_report(talents: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of talents.
        
        Args:
            talents: List of talent data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "first_name", "last_name", "email", "phone", "created_at", "is_active"]
        return await ReportingService.generate_csv(talents, headers)
    
    @staticmethod
    async def generate_employers_report(employers: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of employers.
        
        Args:
            employers: List of employer data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "company_name", "contact_name", "email", "phone", "industry", "job_count", "created_at", "is_active"]
        return await ReportingService.generate_csv(employers, headers)
    
    @staticmethod
    async def generate_trainers_report(trainers: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of trainers.
        
        Args:
            trainers: List of trainer data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "provider_name", "contact_name", "email", "phone", "industry", "training_count", "created_at", "is_active"]
        return await ReportingService.generate_csv(trainers, headers)
    
    @staticmethod
    async def generate_jobs_report(jobs: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of jobs.
        
        Args:
            jobs: List of job data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "title", "employer_name", "job_type", "industry", "location", "applicant_count", "status", "created_at", "expires_at"]
        return await ReportingService.generate_csv(jobs, headers)
    
    @staticmethod
    async def generate_trainings_report(trainings: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of trainings.
        
        Args:
            trainings: List of training data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "title", "trainer_name", "category", "start_date", "cost", "delivery_method", "applicant_count", "status", "created_at", "expires_at"]
        return await ReportingService.generate_csv(trainings, headers)
    
    @staticmethod
    async def generate_payments_report(payments: List[Dict[str, Any]]) -> str:
        """
        Generate a CSV report of payments.
        
        Args:
            payments: List of payment data
            
        Returns:
            CSV formatted string
        """
        headers = ["id", "user_type", "user_name", "amount", "currency", "package", "status", "created_at"]
        return await ReportingService.generate_csv(payments, headers)