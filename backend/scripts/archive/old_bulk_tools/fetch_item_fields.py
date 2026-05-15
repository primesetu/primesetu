import asyncio
import asyncpg
from app.core.config import settings

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    columns = await conn.fetch("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'items'
        ORDER BY ordinal_position
    """)
    print("--- SUPABASE (items) TABLE FIELDS ---")
    for col in columns:
        print(f"- {col['column_name']:<20} : {col['data_type']}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
