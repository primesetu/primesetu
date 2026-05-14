import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_schema():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [r[0] for r in res.fetchall()]
        for table in tables:
            print(f"\n--- {table.upper()} SCHEMA ---")
            res = await conn.execute(text(f"SELECT column_name, data_type, character_maximum_length FROM information_schema.columns WHERE table_name = '{table}' ORDER BY ordinal_position"))
            for r in res.fetchall():
                print(f"Col: {r[0]:<15} | Type: {r[1]:<20} | MaxLen: {r[2]}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_schema())
