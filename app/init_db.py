from sqlalchemy.orm import Session
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

# Import models
from app.models.database_models import Base, User, Admin, UserType, JobPricing, TrainingPricing
from app.database import engine, SessionLocal

# Load environment variables
load_dotenv()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create a database session
    db = SessionLocal()
    
    try:
        # Check if admin user already exists
        admin_exists = db.query(User).filter(User.user_type == UserType.ADMIN).first()
        
        if not admin_exists:
            # Create admin user
            create_admin_user(db)
        
        # Initialize pricing packages if they don't exist
        init_pricing(db)
        
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()

def create_admin_user(db: Session):
    # Get admin credentials from environment variables or use defaults
    admin_email = os.getenv("ADMIN_EMAIL", "admin@irxcruit.com")
    admin_password = os.getenv("ADMIN_PASSWORD", "adminpassword")
    admin_first_name = os.getenv("ADMIN_FIRST_NAME", "Admin")
    admin_last_name = os.getenv("ADMIN_LAST_NAME", "User")
    
    # Hash the password
    hashed_password = pwd_context.hash(admin_password)
    
    # Create user record
    admin_user = User(
        email=admin_email,
        hashed_password=hashed_password,
        user_type=UserType.ADMIN,
        is_active=True
    )
    
    db.add(admin_user)
    db.flush()  # Flush to get the user ID
    
    # Create admin record
    admin = Admin(
        user_id=admin_user.id,
        first_name=admin_first_name,
        last_name=admin_last_name,
        role="super_admin"
    )
    
    db.add(admin)
    print(f"Admin user created: {admin_email}")

def init_pricing(db: Session):
    # Initialize job pricing packages if they don't exist
    if db.query(JobPricing).count() == 0:
        job_pricing_packages = [
            JobPricing(name="Single Job Post", quantity=1, price=10.0),
            JobPricing(name="5 Job Bundle", quantity=5, price=40.0),
            JobPricing(name="10 Job Bundle", quantity=10, price=70.0),
        ]
        
        db.add_all(job_pricing_packages)
        print("Job pricing packages initialized")
    
    # Initialize training pricing packages if they don't exist
    if db.query(TrainingPricing).count() == 0:
        training_pricing_packages = [
            TrainingPricing(name="Single Training Post", quantity=1, price=10.0),
            TrainingPricing(name="5 Training Bundle", quantity=5, price=40.0),
            TrainingPricing(name="10 Training Bundle", quantity=10, price=70.0),
        ]
        
        db.add_all(training_pricing_packages)
        print("Training pricing packages initialized")

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("Database initialization completed.")