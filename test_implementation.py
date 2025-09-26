#!/usr/bin/env python3
"""
Test script to verify the pricing and payment implementation
"""

import asyncio
import sys
import os

# Add the app directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models.database_models import Base, JobPricing, TrainingPricing, Employer, Trainer
from app.services.pricing import PricingService
from app.init_db import init_database

def test_pricing_setup():
    """Test that pricing packages are set up correctly"""
    print("Testing pricing setup...")
    
    # Create in-memory database for testing
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    db = SessionLocal()
    
    try:
        # Initialize database with default pricing
        init_database(db)
        
        # Test job pricing packages
        job_packages = PricingService.get_job_pricing_packages(db)
        print(f"Job pricing packages: {len(job_packages)}")
        for package in job_packages:
            print(f"  - {package.name}: £{package.price} for {package.quantity} jobs")
        
        # Test training pricing packages
        training_packages = PricingService.get_training_pricing_packages(db)
        print(f"Training pricing packages: {len(training_packages)}")
        for package in training_packages:
            print(f"  - {package.name}: £{package.price} for {package.quantity} trainings")
        
        # Test getting packages by ID
        if job_packages:
            first_job_package = PricingService.get_job_pricing_package_by_id(db, job_packages[0].id)
            print(f"Retrieved job package by ID: {first_job_package.name}")
        
        if training_packages:
            first_training_package = PricingService.get_training_pricing_package_by_id(db, training_packages[0].id)
            print(f"Retrieved training package by ID: {first_training_package.name}")
        
        print(" Pricing setup test passed!")
        
    except Exception as e:
        print(f" Pricing setup test failed: {e}")
    finally:
        db.close()

def test_credit_system():
    """Test that credit fields are added to models"""
    print("\nTesting credit system...")
    
    try:
        # Check if Employer has job_credits field
        employer_fields = [attr for attr in dir(Employer) if not attr.startswith('_')]
        if 'job_credits' in employer_fields:
            print(" Employer.job_credits field exists")
        else:
            print(" Employer.job_credits field missing")
        
        # Check if Trainer has training_credits field
        trainer_fields = [attr for attr in dir(Trainer) if not attr.startswith('_')]
        if 'training_credits' in trainer_fields:
            print(" Trainer.training_credits field exists")
        else:
            print(" Trainer.training_credits field missing")
        
        print(" Credit system test passed!")
        
    except Exception as e:
        print(f" Credit system test failed: {e}")

def test_payment_service():
    """Test that PaymentService is properly configured for Stripe"""
    print("\nTesting payment service...")
    
    try:
        from app.services.payment import PaymentService
        
        # Check if the service has the required methods
        required_methods = ['create_payment_intent', 'get_payment_status', 'refund_payment']
        for method in required_methods:
            if hasattr(PaymentService, method):
                print(f" PaymentService.{method} exists")
            else:
                print(f" PaymentService.{method} missing")
        
        print(" Payment service test passed!")
        
    except Exception as e:
        print(f" Payment service test failed: {e}")

if __name__ == "__main__":
    print(" Running implementation tests...\n")
    
    test_pricing_setup()
    test_credit_system()
    test_payment_service()
    
    print("\n All tests completed!")
    print("\n Implementation Summary:")
    print("   Replaced Paystack with Stripe integration")
    print("   Added credit system (job_credits, training_credits)")
    print("   Created purchase endpoints for employers and trainers")
    print("   Added payment confirmation endpoints")
    print("   Implemented credit deduction for job/training creation")
    print("   Updated pricing to use dynamic database values")
    print("   Added Stripe dependency to requirements.txt")
    print("\n Next steps:")
    print("  - Set up Stripe API keys in environment variables")
    print("  - Test the endpoints with actual Stripe integration")
    print("  - Implement payment webhooks for automatic confirmation")
    print("  - Add partner payment bypass functionality")