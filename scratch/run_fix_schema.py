import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def run_sql():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        with open('scratch/alter_schema_v3.sql') as f:
            for q in f.read().split(';'):
                if q.strip():
                    print(f"Executing: {q.strip()}")
                    await conn.execute(text(q))
        await conn.commit()
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run_sql())
