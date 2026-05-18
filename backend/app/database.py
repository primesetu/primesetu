# ============================================================
# SMRITI-OS - Sovereign Database Engine Proxy
# This file is a proxy to app/core/database.py to ensure 
# consistent STORAGE_MODE behavior across all components.
# ============================================================
from app.core.config import settings
from app.core.database import (
    Base, 
    get_db, 
    get_db_session,
    get_engine_for_db,
    _engines,
    _session_makers
)

# Export for compatibility with existing imports
default_db_name = settings.local_database_url.split("/")[-1]
get_engine_for_db(default_db_name, settings.local_database_url)

engine = _engines[default_db_name]
AsyncSessionLocal = _session_makers[default_db_name]
async_session = AsyncSessionLocal
