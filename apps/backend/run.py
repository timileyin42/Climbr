import uvicorn
import os
from dotenv import load_dotenv
from app.init_db import init_db

# Load environment variables
load_dotenv()

# Initialize database if needed
init_db()

if __name__ == "__main__":
    # Get host and port from environment variables or use defaults
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    # Run the application
    uvicorn.run("app.main:app", host=host, port=port, reload=True)