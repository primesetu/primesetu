import asyncio
import asyncpg
from app.core.config import settings
import json

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    records = await conn.fetch("SELECT anal_codes FROM items LIMIT 20")
    for r in records:
        print(r['anal_codes'])
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
