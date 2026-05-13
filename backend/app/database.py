# ============================================================
# SMRITI-OS - Sovereign Database Engine Proxy
# This file is a proxy to app/core/database.py to ensure 
# consistent STORAGE_MODE behavior across all components.
# ============================================================
from app.core.database import (
    engine, 
    AsyncSessionLocal, 
    Base, 
    get_db, 
    get_db_session
)

# Export for compatibility with existing imports
async_session = AsyncSessionLocal
