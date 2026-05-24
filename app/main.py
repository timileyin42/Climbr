from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import routers
from app.routers import talent, employer, trainer, admin, public, auth

# Import setup functions
from app.setup import setup_directories

# Import services
from app.services.archiving import ArchivingService
from app.services.async_email import async_email_service


# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Set up directories
directories = setup_directories()

# Create FastAPI app
app = FastAPI(
    title="Climbr API",
    description="API for Climbr - Career Platform connecting young talent with job opportunities and training programs",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this with your frontend URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(public.router, tags=["public"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(talent.router, prefix="/talent", tags=["talent"])
app.include_router(employer.router, prefix="/employer", tags=["employer"])
app.include_router(trainer.router, prefix="/trainer", tags=["trainer"])
app.include_router(admin.router, prefix="/admin", tags=["admin"])

@app.on_event("startup")
async def startup_event():
    """Run startup tasks"""
    logger.info("Starting up Climbr API")
    logger.info(f"Templates directory: {directories['templates_dir']}")
    
    # Set up scheduled archiving tasks
    await ArchivingService.setup_scheduled_archiving(app)

@app.on_event("shutdown")
async def shutdown_event():
    """Run shutdown tasks"""
    logger.info("Shutting down Climbr API")
    
    # Shut down the scheduler if it exists
    if hasattr(app.state, "scheduler"):
        app.state.scheduler.shutdown()
    
    # Shut down async email service
    await async_email_service.shutdown()


@app.get("/", tags=["root"])
async def root():
    return {"message": "Welcome to Climbr API - Because building your future shouldn't feel like rocket science."}