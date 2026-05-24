from sqlalchemy.orm import Session
from passlib.context import CryptContext

from app.config import settings
from app.models.database_models import Base, User, Admin, UserType, JobPricing, TrainingPricing
from app.database import engine, SessionLocal

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if not db.query(User).filter(User.user_type == UserType.ADMIN).first():
            create_admin_user(db)
        init_pricing(db)
        db.commit()
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()


def create_admin_user(db: Session):
    if not settings.ADMIN_EMAIL or not settings.ADMIN_PASSWORD:
        raise RuntimeError(
            "ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment. "
            "No default admin credentials are provided."
        )

    hashed_password = pwd_context.hash(settings.ADMIN_PASSWORD)

    admin_user = User(
        email=settings.ADMIN_EMAIL,
        hashed_password=hashed_password,
        user_type=UserType.ADMIN,
        is_active=True,
        is_verified=True,
    )
    db.add(admin_user)
    db.flush()

    admin = Admin(
        user_id=admin_user.id,
        first_name=settings.ADMIN_FIRST_NAME,
        last_name=settings.ADMIN_LAST_NAME,
        role="super_admin",
    )
    db.add(admin)
    print(f"Admin user created: {settings.ADMIN_EMAIL}")


def init_pricing(db: Session):
    # Prices in NGN (Milestone K: Paystack / NGN-only)
    if db.query(JobPricing).count() == 0:
        db.add_all([
            JobPricing(name="Single Job Post", quantity=1, price=5000.0, currency="NGN"),
            JobPricing(name="5 Job Bundle", quantity=5, price=20000.0, currency="NGN"),
            JobPricing(name="10 Job Bundle", quantity=10, price=35000.0, currency="NGN"),
        ])
        print("Job pricing packages initialised (NGN)")

    if db.query(TrainingPricing).count() == 0:
        db.add_all([
            TrainingPricing(name="Single Training Post", quantity=1, price=5000.0, currency="NGN"),
            TrainingPricing(name="5 Training Bundle", quantity=5, price=20000.0, currency="NGN"),
            TrainingPricing(name="10 Training Bundle", quantity=10, price=35000.0, currency="NGN"),
        ])
        print("Training pricing packages initialised (NGN)")


if __name__ == "__main__":
    print("Initialising database...")
    init_db()
    print("Database initialisation completed.")
