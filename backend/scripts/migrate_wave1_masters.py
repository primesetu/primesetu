import pyodbc
import os
import asyncio
import sys
from decimal import Decimal
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

load_dotenv("backend/.env")

# MSSQL Connection
def get_mssql_conn():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    return pyodbc.connect(conn_str)

# PostgreSQL Connection
PG_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"

async def migrate_items():
    print("Starting Wave 1: ItemMaster Migration...")
    
    mssql_conn = get_mssql_conn()
    cursor = mssql_conn.cursor()
    
    # Query ItemMaster from MSSQL
    print("Fetching items from MSSQL (Shoper9X01)...")
    cursor.execute("""
        SELECT 
            StockNo, 
            ItemDesc, 
            Class1Cd, 
            Class2Cd, 
            SubClass1Cd, 
            SubClass2Cd, 
            Retail_Price, 
            CurrentCost,
            IsInventoryItem
        FROM ItemMaster
    """)
    mssql_items = cursor.fetchall()
    print(f"Found {len(mssql_items)} items.")
    if mssql_items:
        print(f"Sample StockNo: '{mssql_items[0].StockNo}' (length: {len(mssql_items[0].StockNo)})")

    engine = create_async_engine(PG_URL)
    async with engine.connect() as pg_conn:
        insert_stmt = text("""
            INSERT INTO smriti_item (
                sku, name, class1, class2, subclass1, subclass2, mrp, cost_price, is_active, is_featured, last_sync
            ) VALUES (
                :sku, :name, :class1, :class2, :subclass1, :subclass2, :mrp, :cost_price, :is_active, :is_featured, :last_sync
            ) ON CONFLICT (sku) DO UPDATE SET
                name = EXCLUDED.name,
                class1 = EXCLUDED.class1,
                class2 = EXCLUDED.class2,
                subclass1 = EXCLUDED.subclass1,
                subclass2 = EXCLUDED.subclass2,
                mrp = EXCLUDED.mrp,
                cost_price = EXCLUDED.cost_price,
                is_active = EXCLUDED.is_active,
                is_featured = EXCLUDED.is_featured,
                last_sync = EXCLUDED.last_sync
        """)

        batch_size = 500
        count = 0
        for i in range(0, len(mssql_items), batch_size):
            batch = mssql_items[i:i+batch_size]
            pg_batch = []
            for item in batch:
                sku = item.StockNo.strip() if item.StockNo else ""
                pg_batch.append({
                    "sku": sku,
                    "name": (item.ItemDesc or "").strip(),
                    "class1": (item.Class1Cd or "").strip(),
                    "class2": (item.Class2Cd or "").strip(),
                    "subclass1": (item.SubClass1Cd or "").strip(),
                    "subclass2": (item.SubClass2Cd or "").strip(),
                    "mrp": Decimal(str(item.Retail_Price or 0)),
                    "cost_price": Decimal(str(item.CurrentCost or 0)),
                    "is_active": bool(item.IsInventoryItem),
                    "is_featured": False,
                    "last_sync": datetime.utcnow()
                })
            
            try:
                async with pg_conn.begin():
                    await pg_conn.execute(insert_stmt, pg_batch)
                count += len(batch)
                print(f"Migrated {count}/{len(mssql_items)} items...")
            except Exception as e:
                print(f"Batch starting at {i} failed. Error: {e}. Retrying individually...")
                for item_data in pg_batch:
                    try:
                        async with pg_conn.begin():
                            await pg_conn.execute(insert_stmt, [item_data])
                        count += 1
                    except Exception as inner_e:
                        print(f"CRITICAL FAILURE on item {item_data['sku']}: {inner_e}")
                        # Optionally continue or raise. For now, let's log and continue.
                        with open("failed_items.log", "a") as f:
                            f.write(f"{item_data['sku']}: {str(inner_e)}\n")
                print(f"Processed batch {i} with some failures. Total migrated: {count}/{len(mssql_items)}")

    print("Wave 1: ItemMaster Migration Complete.")
    mssql_conn.close()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(migrate_items())
