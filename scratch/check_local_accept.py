import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def check_local():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        print("Checking shoper9.acceptdisplaydtls columns in LOCAL_POSTGRES:")
        try:
            result = await conn.execute(text("SELECT column_name, is_nullable FROM information_schema.columns WHERE table_schema = 'shoper9' AND table_name = 'acceptdisplaydtls'"))
            rows = result.all()
            for r in rows:
                print(f"  Column: {r[0]}, Nullable: {r[1]}")
        except Exception as e:
            print(f"  Error: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_local())
