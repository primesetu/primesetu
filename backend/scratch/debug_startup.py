import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.main import app
    print("Import successful.")
except Exception as e:
    import traceback
    traceback.print_exc()
    sys.exit(1)
