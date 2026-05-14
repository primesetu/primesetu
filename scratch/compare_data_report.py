import pyodbc
import os
import asyncio
import asyncpg
from dotenv import load_dotenv

load_dotenv()

# MSSQL Connection Strings
MSSQL_RETAIL = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
MSSQL_SYS = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'

async def compare():
    print("--- DATA COMPARISON: SMRITI-OS (PG) vs MSSQL (SHOPER9) ---")
    
    # --- Postgres Connection ---
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_conn = await asyncpg.connect(db_url)
    
    # --- MSSQL Connections ---
    try:
        ms_retail_conn = pyodbc.connect(MSSQL_RETAIL)
        ms_retail_cur = ms_retail_conn.cursor()
    except Exception as e:
        print(f"Error connecting to MSSQL Retail: {e}")
        ms_retail_conn = None

    try:
        ms_sys_conn = pyodbc.connect(MSSQL_SYS)
        ms_sys_cur = ms_sys_conn.cursor()
    except Exception as e:
        print(f"Error connecting to MSSQL System: {e}")
        ms_sys_conn = None

    # Tables to check
    # (PG_TABLE_NAME, MSSQL_TABLE_NAME, MSSQL_DB_TYPE)
    tables_to_compare = [
        ('sysparam', 'sysparam', 'RETAIL'),
        ('s9sys_sissysparam', 'sissysparam', 'SYS'),
        ('items', 'itemmaster', 'RETAIL'),
        ('item_stock', 'stockmaster', 'RETAIL')
    ]

    print(f"\n{'TABLE':<25} {'PG COUNT':>10} | {'MSSQL COUNT':>12} | {'DATABASE':<10}")
    print("-" * 65)

    for pg_table, ms_table, db_type in tables_to_compare:
        # Get PG Count
        try:
            pg_count = await pg_conn.fetchval(f'SELECT COUNT(*) FROM "{pg_table}"')
        except Exception:
            pg_count = "ERROR"

        # Get MSSQL Count
        ms_count = "N/A"
        if db_type == 'RETAIL' and ms_retail_conn:
            try:
                ms_retail_cur.execute(f"SELECT COUNT(*) FROM [{ms_table}]")
                ms_count = ms_retail_cur.fetchone()[0]
            except Exception:
                ms_count = "MISSING"
        elif db_type == 'SYS' and ms_sys_conn:
            try:
                ms_sys_cur.execute(f"SELECT COUNT(*) FROM [{ms_table}]")
                ms_count = ms_sys_cur.fetchone()[0]
            except Exception:
                ms_count = "MISSING"

        print(f"{pg_table:<25} {pg_count:>10} | {ms_count:>12} | {db_type:<10}")

    # Detailed comparison for sysparam if possible
    if ms_retail_conn:
        print("\n--- SAMPLE DATA COMPARISON (sysparam) ---")
        try:
            ms_retail_cur.execute("SELECT TOP 5 code, value FROM sysparam")
            ms_rows = ms_retail_cur.fetchall()
            print("MSSQL (SHOPER9WH1) Sample:")
            for r in ms_rows:
                print(f"  {r.code}: {r.value}")
        except Exception:
            print("  Could not fetch from MSSQL sysparam")

        try:
            pg_rows = await pg_conn.fetch("SELECT code, value FROM sysparam LIMIT 5")
            print("\nSMRITI-OS (PG) Sample:")
            if not pg_rows:
                print("  (Empty Table)")
            for r in pg_rows:
                print(f"  {r['code']}: {r['value']}")
        except Exception:
            print("  Could not fetch from PG sysparam")

    await pg_conn.close()
    if ms_retail_conn: ms_retail_conn.close()
    if ms_sys_conn: ms_sys_conn.close()

if __name__ == "__main__":
    asyncio.run(compare())
