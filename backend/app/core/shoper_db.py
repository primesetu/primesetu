# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud .. Sovereign .. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * .(c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #
import pyodbc
from typing import List, Dict, Any

# Shoper9 Configuration (Audited)
CONN_STR = (
    "DRIVER={SQL Server};"
    "SERVER=localhost;"
    "DATABASE=Shoper9CSW;"
    "UID=sa;"
    "PWD=netmanthan@123;"
)

def get_shoper_cursor():
    """Provides a connection to the legacy Shoper9 SQL database."""
    conn = pyodbc.connect(CONN_STR)
    return conn, conn.cursor()

def fetch_shoper_data(query: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Executes a query against Shoper9 and returns results as dictionaries."""
    conn, cursor = get_shoper_cursor()
    try:
        cursor.execute(query, params)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results
    finally:
        conn.close()
