"""
conftest.py (repo root)
Adds backend/ to sys.path so `from app.xxx import ...` works
when pytest is run from the project root.
"""
import sys
import os

# Ensure the backend package is importable as `app.*`
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
