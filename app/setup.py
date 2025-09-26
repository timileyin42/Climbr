import os
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def setup_templates_directory():
    """
    Ensure the templates directory exists.
    This function is called when the application starts.
    """
    # Get templates directory from environment variable or use default
    templates_dir = os.getenv("TEMPLATES_DIR", "app/templates")
    
    # Create absolute path
    base_dir = Path(__file__).parent.parent
    templates_path = base_dir / templates_dir.replace("app/", "")
    
    # Create directory if it doesn't exist
    if not templates_path.exists():
        logger.info(f"Creating templates directory: {templates_path}")
        templates_path.mkdir(parents=True, exist_ok=True)
    
    return templates_path

def setup_directories():
    """
    Set up all required directories for the application.
    This function is called when the application starts.
    """
    # Set up templates directory
    templates_dir = setup_templates_directory()
    
    # Return a dictionary of directory paths
    return {
        "templates_dir": templates_dir
    }