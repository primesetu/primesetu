import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Searching for class12combo ---")
    res = await conn.fetch("SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE tablename = 'class12combo'")
    if res:
        for r in res:
            print(f"Found: {r['schemaname']}.{r['tablename']}")
    else:
        print("NOT FOUND ANYWHERE.")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
