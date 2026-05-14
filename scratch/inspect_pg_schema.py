import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def inspect_pg():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    print("--- INSPECTING SMRITI-OS (PG) TABLE: sysparam ---")
    columns = await pg.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'sysparam'")
    for col in columns:
        print(f"Column: {col['column_name']} ({col['data_type']})")
        
    print("\n--- FETCHING 5 ROWS ---")
    rows = await pg.fetch("SELECT * FROM sysparam LIMIT 5")
    if not rows:
        print("  (Empty Table)")
    for row in rows:
        print(dict(row))
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(inspect_pg())
