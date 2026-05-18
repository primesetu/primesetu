import subprocess
import os
import sys

def check_env():
    py_exe = "C:\\SmritiOS\\python\\python.exe"
    print(f"Checking Python executable: {py_exe}")
    if not os.path.exists(py_exe):
        print("Error: Python executable not found!")
        return
        
    # Check version
    try:
        ver = subprocess.check_output([py_exe, "--version"], text=True).strip()
        print(f"Version: {ver}")
    except Exception as e:
        print(f"Error checking version: {e}")
        
    # Check if packages like fastapi can be imported
    libs = ["fastapi", "uvicorn", "celery", "sqlalchemy", "dotenv", "redis", "asyncpg"]
    print("\nChecking imports in C:\\SmritiOS\\python:")
    for lib in libs:
        try:
            # Run python -c "import lib"
            subprocess.check_call([py_exe, "-c", f"import {lib}"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            print(f"- {lib}: AVAILABLE")
        except Exception:
            print(f"- {lib}: MISSING")
            
    # Check if pip is available
    try:
        pip_ver = subprocess.check_output([py_exe, "-m", "pip", "--version"], text=True, stderr=subprocess.DEVNULL).strip()
        print(f"\nPip Status: {pip_ver}")
    except Exception:
        print("\nPip Status: NOT INSTALLED / NOT AVAILABLE IN EMBEDDED PYTHON")

if __name__ == "__main__":
    check_env()
