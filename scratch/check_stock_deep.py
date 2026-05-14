import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_deep():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    print("--- DEEP DIVE INTO STOCK DATA ---")
    distinct_stockno = await pg.fetchval("SELECT count(distinct stockno) FROM stockmaster")
    print(f"Distinct stockno in stockmaster: {distinct_stockno}")
    
    total_stockmaster = await pg.fetchval("SELECT count(*) FROM stockmaster")
    print(f"Total rows in stockmaster: {total_stockmaster}")
    
    total_items = await pg.fetchval("SELECT count(*) FROM items")
    print(f"Total rows in items: {total_items}")
    
    total_item_stock = await pg.fetchval("SELECT count(*) FROM item_stock")
    print(f"Total rows in item_stock: {total_item_stock}")
    
    # Check if some item_ids are missing in item_stock
    items_without_stock = await pg.fetchval("SELECT count(*) FROM items WHERE id NOT IN (SELECT item_id FROM item_stock)")
    print(f"Items WITHOUT any stock record: {items_without_stock}")

    # Check if item_stock has duplicates for same item_id
    duplicate_stocks = await pg.fetchval("SELECT count(*) FROM (SELECT item_id FROM item_stock GROUP BY item_id HAVING count(*) > 1) as sub")
    print(f"Items with MULTIPLE stock records: {duplicate_stocks}")
    
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_deep())
