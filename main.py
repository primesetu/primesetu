import sys
import os

# Root entry point to resolve 'uvicorn main:app'
project_root = os.path.dirname(os.path.abspath(__file__))
backend_path = os.path.join(project_root, "backend")

if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app
