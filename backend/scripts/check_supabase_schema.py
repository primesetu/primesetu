import asyncio
import asyncpg
from app.core.config import settings

async def check_schema():
    # Convert sqlalchemy url to asyncpg url
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    print("--- Table: stores ---")
    res = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'stores' AND table_schema = 'public'")
    for r in res:
        print(f"{r['column_name']}: {r['data_type']}")
        
    print("\n--- Table: items ---")
    res = await conn.fetch("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'items' AND table_schema = 'public'")
    for r in res:
        print(f"{r['column_name']}: {r['data_type']}")
        
    await conn.close()

if __name__ == "__main__":
    asyncio.run(check_schema())
