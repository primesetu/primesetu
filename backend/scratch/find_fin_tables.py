import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Searching for Financial & Tax Tables ---")
    patterns = ['tax', 'paym', 'mop', 'mode', 'acmast', 'acgroup', 'hsn']
    
    query = """
        SELECT schemaname, tablename 
        FROM pg_catalog.pg_tables 
        WHERE tablename ~* $1
    """
    
    for p in patterns:
        print(f"Pattern: {p}")
        res = await conn.fetch(query, p)
        for r in res:
            print(f"  - {r['schemaname']}.{r['tablename']}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
