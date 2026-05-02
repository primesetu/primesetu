# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud .. Sovereign .. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * .(c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #
import psycopg2
from psycopg2.extras import RealDictCursor
import os
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL Connection for Legacy Data (Redirected from MSSQL)
PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

def get_shoper_conn():
    """Provides a connection to the PostgreSQL database with shoper9 schema priority."""
    conn = psycopg2.connect(PG_URL)
    # Set search path to shoper9 to avoid using 'public' by mistake
    with conn.cursor() as cur:
        cur.execute("SET search_path TO shoper9, public")
    return conn

def fetch_shoper_data(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """
    Executes a query against the PostgreSQL 'shoper9' schema.
    Mirror of the original MSSQL fetcher for backward compatibility.
    """
    conn = get_shoper_conn()
    try:
        # Use RealDictCursor to maintain the Dict return type
        with conn.cursor(cursor_factory=RealDictCursor) as cursor:
            # PostgreSQL uses %s for params, MSSQL used ?
            # We automatically convert simple ? to %s for compatibility
            query = query.replace('?', '%s')
            cursor.execute(query, params)
            results = cursor.fetchall()
            # Convert RealDict to standard dict
            return [dict(row) for row in results]
    finally:
        conn.close()
