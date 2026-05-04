"""
mssql_connect.py
─────────────────────────────────────────────────────────────
Central helper to get a pyodbc connection to Shoper9 MSSQL.
Reads credentials from .env via os.environ / python-dotenv.

Machine : AITDL  (Hyper-V)
Database: SHOPER9WH1
Auth    : SQL Server (sa / netmanthan@123)

Usage:
    from mssql_connect import get_conn
    conn = get_conn()
    cursor = conn.cursor()
    ...
    conn.close()
"""

import os
import pyodbc
from dotenv import load_dotenv

# Load .env from backend dir (handles running from any CWD)
_ENV_PATH = os.path.join(os.path.dirname(__file__), ".env")
load_dotenv(_ENV_PATH)


def build_conn_str() -> str:
    server   = os.getenv("MSSQL_SERVER",   "AITDL")
    database = os.getenv("MSSQL_DATABASE", "SHOPER9WH1")
    user     = os.getenv("MSSQL_USER",     "sa")
    password = os.getenv("MSSQL_PASSWORD", "netmanthan@123")
    driver   = os.getenv("MSSQL_DRIVER",   "SQL Server")

    return (
        f"DRIVER={{{driver}}};"
        f"SERVER={server};"
        f"DATABASE={database};"
        f"UID={user};"
        f"PWD={password};"
    )


def get_conn() -> pyodbc.Connection:
    """Return a live pyodbc connection to Shoper9 MSSQL on AITDL."""
    conn_str = build_conn_str()
    try:
        conn = pyodbc.connect(conn_str, timeout=10)
        return conn
    except pyodbc.Error as e:
        safe_conn = conn_str.replace(os.getenv('MSSQL_PASSWORD', ''), '****')
        print("[mssql_connect] FAIL: Connection failed!")
        print(f"  Server  : {os.getenv('MSSQL_SERVER')}")
        print(f"  ConnStr : {safe_conn}")
        print("  Hint    : Try MSSQL_SERVER=AITDL\\SQLEXPRESS or use IP address")
        print(f"  Error   : {e}")
        raise


if __name__ == "__main__":
    server = os.getenv('MSSQL_SERVER', 'AITDL')
    db     = os.getenv('MSSQL_DATABASE', 'SHOPER9WH1')
    print(f"Testing connection to {server}\\{db} ...")
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute("SELECT @@SERVERNAME, @@VERSION")
    row = cur.fetchone()
    print("OK: Connected!")
    print(f"   Server  : {row[0]}")
    print(f"   Version : {str(row[1])[:80]}")
    conn.close()
