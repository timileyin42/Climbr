from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get database URL from environment variables or use a default PostgreSQL database
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/irxcruit")

# Create SQLAlchemy engine with connection pooling
engine = create_engine(
    DATABASE_URL,
    pool_size=20,          # Number of connections to maintain in the pool
    max_overflow=30,       # Additional connections beyond pool_size
    pool_timeout=30,       # Seconds to wait for a connection
    pool_recycle=3600,     # Recycle connections after 1 hour
    pool_pre_ping=True,    # Validate connections before use
    echo=False             # Set to True for SQL query logging in development
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class
Base = declarative_base()

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()