
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def cleanup_modern_tables():
    async with engine.begin() as conn:
        tables = ['menu_items', 'system_parameters', 'system_settings']
        for table in tables:
            try:
                await conn.execute(text(f"DROP TABLE IF EXISTS public.{table} CASCADE"))
                print(f"Dropped public.{table}")
            except Exception as e:
                print(f"Error dropping {table}: {e}")

if __name__ == "__main__":
    asyncio.run(cleanup_modern_tables())
