import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def setup_templates_directory():
    """Ensure the templates directory exists."""
    templates_dir = "templates"
    
    base_dir = Path(__file__).parent.parent
    templates_path = base_dir / templates_dir
    
    if not templates_path.exists():
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