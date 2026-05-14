import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_sysparam():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        print("Checking shoper9.sysparam in LOCAL_POSTGRES:")
        try:
            result = await conn.execute(text("SELECT COUNT(*) FROM shoper9.sysparam"))
            count = result.scalar()
            print(f"  Total rows: {count}")
            
            if count > 0:
                result = await conn.execute(text("SELECT parmcd, descr, parmval FROM shoper9.sysparam LIMIT 5"))
                rows = result.all()
                for r in rows:
                    print(f"    Code: {r[0]}, Descr: {r[1]}, Value: {r[2]}")
        except Exception as e:
            print(f"  Error: {e}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_sysparam())
