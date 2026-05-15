import pyodbc
import asyncio
import os
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv("backend/.env")

# MSSQL Connection
MSSQL_CONN_STR = f'DRIVER={{SQL Server}};SERVER=AITDL;DATABASE=Shoper9X01;UID={os.getenv("MSSQL_USER")};PWD={os.getenv("MSSQL_PASSWORD")};'

# Postgres Connection
PG_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
engine = create_async_engine(PG_URL)

async def migrate_stock():
    mssql_conn = pyodbc.connect(MSSQL_CONN_STR)
    cursor = mssql_conn.cursor()

    print("Fetching StockMaster records from Shoper9...")
    cursor.execute("SELECT StockNo, LocnId, CurBalQty FROM StockMaster")
    mssql_stock = cursor.fetchall()
    print(f"Found {len(mssql_stock)} stock records.")

    async with engine.connect() as pg_conn:
        insert_stmt = text("""
            INSERT INTO smriti_stock (
                sku, store_id, on_hand, on_order, min_stock, last_sync
            ) VALUES (
                :sku, :store_id, :on_hand, :on_order, :min_stock, :last_sync
            ) ON CONFLICT (sku, store_id) DO UPDATE SET
                on_hand = EXCLUDED.on_hand,
                on_order = EXCLUDED.on_order,
                min_stock = EXCLUDED.min_stock,
                last_sync = EXCLUDED.last_sync
        """)

        batch_size = 1000
        count = 0
        for i in range(0, len(mssql_stock), batch_size):
            batch = mssql_stock[i:i+batch_size]
            pg_batch = []
            for row in batch:
                pg_batch.append({
                    "sku": str(row.StockNo).strip(),
                    "store_id": str(row.LocnId).strip(),
                    "on_hand": Decimal(str(row.CurBalQty or 0)),
                    "on_order": Decimal(0),
                    "min_stock": Decimal(0),
                    "last_sync": datetime.utcnow()
                })
            
            try:
                async with pg_conn.begin():
                    await pg_conn.execute(insert_stmt, pg_batch)
                count += len(batch)
                print(f"Migrated {count}/{len(mssql_stock)} stock records...")
            except Exception as e:
                print(f"Batch starting at {i} failed. Error: {e}. Retrying individually...")
                for item_data in pg_batch:
                    try:
                        async with pg_conn.begin():
                            await pg_conn.execute(insert_stmt, [item_data])
                        count += 1
                    except Exception as inner_e:
                        print(f"CRITICAL FAILURE on stock {item_data['sku']}: {inner_e}")
                print(f"Processed batch {i} with some failures. Total migrated: {count}/{len(mssql_stock)}")

    print("Wave 2: Stock Migration Complete.")
    mssql_conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_stock())
