import asyncio
import asyncpg
from app.core.config import settings

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    
    print("Altering general_lookup...")
    try:
        await conn.execute("ALTER TABLE general_lookup ADD COLUMN shoper_recid INTEGER")
        await conn.execute("CREATE INDEX idx_genlookup_shoper_recid ON general_lookup(shoper_recid)")
    except Exception as e:
        print(f"general_lookup error: {e}")

    print("Altering items...")
    try:
        await conn.execute("ALTER TABLE items ADD COLUMN shoper_recid INTEGER")
        await conn.execute("CREATE INDEX idx_items_shoper_recid ON items(shoper_recid)")
    except Exception as e:
        print(f"items error: {e}")
        
    await conn.close()
    print("Database altered.")

if __name__ == '__main__':
    asyncio.run(main())
