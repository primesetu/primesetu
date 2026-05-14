import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_columns():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema = 'shoper9' AND table_name = 'sysparam'"))
        print([r[0] for r in result.all()])
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_columns())
