import sys
import os

# This proxy resolves Render's hardcoded 'uvicorn app.main:app' command
# by mapping it to the Phase 2 logic in backend/app/main.py

# Get absolute path to the backend directory
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
backend_path = os.path.join(project_root, "backend")

# Prioritize the backend path in the module search
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

# Import the actual FastAPI app from backend/app/main.py
try:
    from app.main import app
except ImportError as e:
    print(f"Proxy Error: Could not find backend app. Path: {backend_path}. Error: {e}")
    raise
