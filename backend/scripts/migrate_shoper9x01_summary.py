import pyodbc
import asyncio
import asyncpg
import os
from app.core.config import settings

# ============================================================
# SMRITI-OS - Stock Summary Migration Engine
# Syncs: Stocktrnsummary for active SKUs
# ============================================================

async def migrate_summary(database="shoper9x01"):
    print(f"Starting Stock Summary sync from MSSQL [{database}]...")
    
    # 1. Get Active SKUs from PG
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    pg_conn = await asyncpg.connect(url)
    active_skus = await pg_conn.fetch("SELECT stockno FROM shoper9.itemmaster")
    sku_list = [r['stockno'] for r in active_skus]
    
    if not sku_list:
        print("No active SKUs found in Smriti-OS.")
        await pg_conn.close()
        return

    # 2. Fetch Summary from MSSQL
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        mssql_conn = pyodbc.connect(conn_str)
        cursor = mssql_conn.cursor()
        
        skus_str = ",".join([f"'{s}'" for s in sku_list])
        
        print("Fetching StockTrnSummary...")
        cursor.execute(f"SELECT * FROM StockTrnSummary WHERE StockNo IN ({skus_str})")
        summary_cols = [column[0].lower() for column in cursor.description]
        summary_rows = [dict(zip(summary_cols, row)) for row in cursor.fetchall()]
        
        mssql_conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")
        await pg_conn.close()
        return

    # 3. Sync to PostgreSQL
    try:
        await pg_conn.execute("SET search_path TO shoper9, public")

        if summary_rows:
            print(f"Syncing {len(summary_rows)} Summary records...")
            pg_sum_cols_res = await pg_conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'stocktrnsummary' AND table_schema = 'shoper9'")
            pg_sum_cols = [r['column_name'] for r in pg_sum_cols_res]
            target_sum_cols = [c for c in summary_cols if c in pg_sum_cols]
            
            insert_sum = [tuple(r.get(c) for c in target_sum_cols) for r in summary_rows]
            
            async with pg_conn.transaction():
                await pg_conn.execute("TRUNCATE TABLE stocktrnsummary")
                await pg_conn.copy_records_to_table('stocktrnsummary', records=insert_sum, columns=target_sum_cols)

        await pg_conn.close()
        print("Stock Summary Sync Complete. Monthly performance data ready.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_summary("shoper9x01"))
