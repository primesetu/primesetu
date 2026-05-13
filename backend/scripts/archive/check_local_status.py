import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def check_local_counts():
    engine = create_async_engine(settings.local_database_url)
    tables = ['itemmaster', 'stockmaster', 'genlookup', 'customers', 'sysparam']
    print("--- Local Postgres Status ---")
    async with engine.connect() as conn:
        for t in tables:
            try:
                res = await conn.execute(text(f"SELECT count(*) FROM shoper9.{t}"))
                print(f"shoper9.{t}: {res.scalar()}")
            except:
                print(f"shoper9.{t}: ERROR")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_local_counts())
