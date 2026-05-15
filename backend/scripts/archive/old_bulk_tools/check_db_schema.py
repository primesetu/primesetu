import asyncio
import asyncpg
from app.core.config import settings

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    
    for table in ['general_lookup', 'items']:
        records = await conn.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
        print(f"Columns in {table}:", [r['column_name'] for r in records])
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
