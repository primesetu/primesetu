import sys
import os

# Add current directory to path to import app
sys.path.append(os.getcwd())

from app.core.database import engine
from app.models.base import Base
import app.models.sovereign  # Ensure models are registered

def create_sovereign_tables():
    print("--- [SMRITI-OS] SOVEREIGN TABLE INITIALIZATION ---")
    Base.metadata.create_all(bind=engine)
    print("SUCCESS: All SMRITI_ tables have been created in the Sovereign Database.")

if __name__ == "__main__":
    create_sovereign_tables()
