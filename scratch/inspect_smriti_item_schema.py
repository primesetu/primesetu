import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"

async def main():
    engine = create_async_engine(DB_URL)
    async with engine.connect() as conn:
        r = await conn.execute(text("""
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'smriti_item'
            ORDER BY ordinal_position
        """))
        print(f"{'COLUMN':<30}  {'TYPE':<20}  NULLABLE  DEFAULT")
        print("-" * 90)
        for row in r:
            print(f"{row[0]:<30}  {row[1]:<20}  {row[2]:<8}  {row[3]}")
    await engine.dispose()

asyncio.run(main())
