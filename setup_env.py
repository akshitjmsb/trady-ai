import os
from pathlib import Path
from dotenv import load_dotenv

def load_environment():
    """Load environment variables from .env file."""
    env_path = Path('.') / '.env'
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        print("Environment variables loaded successfully!")
    else:
        print("Warning: .env file not found. Using system environment variables.")

# Load environment variables when this module is imported
load_environment()
