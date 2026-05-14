import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- SCHEMAS ---")
    schemas = await conn.fetch("SELECT schema_name FROM information_schema.schemata")
    for s in schemas:
        print(f"Schema: {s['schema_name']}")
        
    print("\n--- TABLES in shoper9 ---")
    try:
        tables = await conn.fetch("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'shoper9'")
        for t in tables:
            print(f"Table: {t['tablename']}")
    except Exception as e:
        print(f"Error checking shoper9: {e}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
