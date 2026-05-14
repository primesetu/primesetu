import pyodbc
import asyncio
import asyncpg
import os
from app.core.config import settings

async def check_ledger_volume(database="shoper9x01"):
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    pg_conn = await asyncpg.connect(url)
    active_skus = await pg_conn.fetch("SELECT stockno FROM shoper9.itemmaster")
    sku_list = [r['stockno'] for r in active_skus]
    await pg_conn.close()

    if not sku_list:
        print("No active SKUs in PostgreSQL.")
        return

    print(f"Checking ledger volume for {len(sku_list)} SKUs in MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # We use a batch query for counts
        # Note: MSSQL has a limit on parameters, so we might need chunks if we used IN (?)
        # But for counting, we can just join or use a temp table.
        # However, for 1200 items, we can use a string join.
        skus_str = ",".join([f"'{s}'" for s in sku_list])
        query = f"SELECT count(*) FROM StkTrnDtls WHERE StockNo IN ({skus_str})"
        cursor.execute(query)
        count = cursor.fetchone()[0]
        print(f"Total Ledger Records to migrate: {count}")
        conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_ledger_volume("shoper9x01"))
