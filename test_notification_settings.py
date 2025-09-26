#!/usr/bin/env python3
"""
Test script for notification settings functionality
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.services.user import UserService
from app.models.database_models import User, Talent, UserType, NotificationSettings
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_notification_settings():
    """Test notification settings functionality"""
    db = SessionLocal()
    
    try:
        # Create a test user and talent
        test_user = User(
            email="test_talent@example.com",
            hashed_password=pwd_context.hash("testpassword"),
            user_type=UserType.TALENT,
            is_active=True,
            is_verified=True
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        test_talent = Talent(
            user_id=test_user.id,
            first_name="Test",
            last_name="Talent",
            phone="1234567890"
        )
        db.add(test_talent)
        db.commit()
        db.refresh(test_talent)
        
        print(f"Created test user with ID: {test_user.id}")
        
        # Test getting notification settings (should create defaults)
        print("\n1. Testing get_notification_settings (should create defaults)...")
        settings = UserService.get_notification_settings(db, test_user.id)
        print(f"Initial settings: {settings}")
        
        if not settings:
            settings = UserService.create_default_notification_settings(db, test_user.id)
            print(f"Created default settings: {settings}")
        
        # Test formatting response
        print("\n2. Testing format_notification_settings_response...")
        formatted = UserService.format_notification_settings_response(settings)
        print(f"Formatted response: {formatted}")
        
        # Test updating notification settings
        print("\n3. Testing update_notification_settings...")
        update_data = {
            "job_updates": {
                "in_app": False,
                "email": True
            },
            "training_alerts": {
                "in_app": True,
                "email": False
            }
        }
        
        updated_settings = UserService.update_notification_settings(db, test_user.id, update_data)
        print(f"Updated settings: {updated_settings}")
        
        # Test formatting updated response
        formatted_updated = UserService.format_notification_settings_response(updated_settings)
        print(f"Formatted updated response: {formatted_updated}")
        
        # Verify the changes
        print("\n4. Verifying changes...")
        assert formatted_updated["job_updates"]["in_app"] == False
        assert formatted_updated["job_updates"]["email"] == True
        assert formatted_updated["training_alerts"]["in_app"] == True
        assert formatted_updated["training_alerts"]["email"] == False
        print("✅ All assertions passed!")
        
        print("\n✅ Notification settings test completed successfully!")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        db.rollback()
        raise
    finally:
        # Clean up test data
        try:
            # Delete test data
            db.query(NotificationSettings).filter(NotificationSettings.user_id == test_user.id).delete()
            db.query(Talent).filter(Talent.user_id == test_user.id).delete()
            db.query(User).filter(User.id == test_user.id).delete()
            db.commit()
            print("\n🧹 Test data cleaned up")
        except:
            pass
        db.close()

if __name__ == "__main__":
    test_notification_settings()