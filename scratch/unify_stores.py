import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def unify_stores():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    # 1. Get correct store_id
    correct_store_id = await pg.fetchval("SELECT id FROM stores LIMIT 1")
    if not correct_store_id:
        print("Error: No store found.")
        return
        
    print(f"Unifying all tables to Store ID: {correct_store_id}")
    
    # 2. List all tables that have store_id column
    tables_query = """
        SELECT table_name 
        FROM information_schema.columns 
        WHERE column_name = 'store_id' 
        AND table_schema = 'public'
    """
    tables = await pg.fetch(tables_query)
    
    for row in tables:
        table = row['table_name']
        print(f"Updating {table}...")
        try:
            res = await pg.execute(f'UPDATE "{table}" SET store_id = $1 WHERE store_id != $1', correct_store_id)
            print(f"  {res}")
        except Exception as e:
            print(f"  FAILED to update {table}: {e}")
            
    await pg.close()

if __name__ == "__main__":
    asyncio.run(unify_stores())
