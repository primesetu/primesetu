import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def test_search():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    query = "OTHERS" # We saw this in the failing row earlier
    print(f"Testing SKU Search for: {query}")
    
    store_id = await conn.fetchval("SELECT id FROM stores LIMIT 1")
    
    # Simulate the search logic
    stmt = """
        SELECT id, item_code, item_name, mrp_paise 
        FROM items 
        WHERE store_id = $1 AND (LOWER(item_code) LIKE $2 OR LOWER(item_name) LIKE $2)
        LIMIT 5
    """
    results = await conn.fetch(stmt, store_id, f"%{query.lower()}%")
    
    print(f"Found {len(results)} results:")
    for r in results:
        print(f"- {r['item_code']}: {r['item_name']} (@ {r['mrp_paise']/100})")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(test_search())
