import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def cleanup_legacy_collisions():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    collisions = ['customers', 'vendors', 'users', 'stores', 'menu_items']
    for table in collisions:
        print(f"Dropping conflicting legacy table: {table}")
        await conn.execute(f"DROP TABLE IF EXISTS public.{table} CASCADE")
    
    await conn.close()

if __name__ == '__main__':
    asyncio.run(cleanup_legacy_collisions())
