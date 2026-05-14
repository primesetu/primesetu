import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_constraints():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    print("--- Constraints for item_stock ---")
    query = """
        SELECT conname, pg_get_constraintdef(c.oid) 
        FROM pg_constraint c 
        JOIN pg_namespace n ON n.oid = c.connamespace 
        WHERE n.nspname = 'public' 
        AND c.conrelid = 'item_stock'::regclass
    """
    res = await pg.fetch(query)
    for r in res:
        print(f"Constraint: {r['conname']} -> {r['pg_get_constraintdef']}")
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_constraints())
