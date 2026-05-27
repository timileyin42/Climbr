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


_JOB_PACKAGES = [
    {"name": "Starter",           "quantity": 10,   "price": 5000.0,   "currency": "NGN"},
    {"name": "Growth",            "quantity": 20,   "price": 10000.0,  "currency": "NGN"},
    {"name": "Monthly Unlimited", "quantity": 999,  "price": 50000.0,  "currency": "NGN"},
    {"name": "Annual Unlimited",  "quantity": 9999, "price": 480000.0, "currency": "NGN"},
]

_TRAINING_PACKAGES = [
    {"name": "Starter",           "quantity": 10,   "price": 5000.0,   "currency": "NGN"},
    {"name": "Growth",            "quantity": 20,   "price": 10000.0,  "currency": "NGN"},
    {"name": "Monthly Unlimited", "quantity": 999,  "price": 50000.0,  "currency": "NGN"},
    {"name": "Annual Unlimited",  "quantity": 9999, "price": 480000.0, "currency": "NGN"},
]


def _sync_packages(db, model, packages):
    existing = {p.name: p for p in db.query(model).all()}
    target_names = {p["name"] for p in packages}

    for pkg_data in packages:
        if pkg_data["name"] in existing:
            pkg = existing[pkg_data["name"]]
            pkg.quantity = pkg_data["quantity"]
            pkg.price    = pkg_data["price"]
            pkg.currency = pkg_data["currency"]
            pkg.is_active = True
        else:
            db.add(model(**pkg_data, is_active=True))

    for name, pkg in existing.items():
        if name not in target_names:
            pkg.is_active = False


def init_pricing(db: Session):
    _sync_packages(db, JobPricing, _JOB_PACKAGES)
    _sync_packages(db, TrainingPricing, _TRAINING_PACKAGES)
    print("Pricing packages synced (NGN)")


if __name__ == "__main__":
    print("Initialising database...")
    init_db()
    print("Database initialisation completed.")
