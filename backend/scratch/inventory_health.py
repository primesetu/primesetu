import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Inventory Health Check ---")
    
    item_count = await conn.fetchval("SELECT count(*) FROM shoper9.itemmaster")
    stock_count = await conn.fetchval("SELECT count(*) FROM shoper9.stockmaster")
    
    active_stock_nos = await conn.fetchval("""
        SELECT count(DISTINCT stockno) 
        FROM shoper9.stockmaster 
        WHERE curbalqty > 0
    """)
    
    print(f"Total Items in Itemmaster: {item_count}")
    print(f"Total Records in Stockmaster: {stock_count}")
    print(f"Items with Stock > 0: {active_stock_nos}")
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
