import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def show_itemmaster():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        print("Checking shoper9.itemmaster in LOCAL_POSTGRES:")
        try:
            # Count rows
            result = await conn.execute(text("SELECT COUNT(*) FROM shoper9.itemmaster"))
            count = result.scalar()
            print(f"  Total rows: {count}")
            
            if count > 0:
                # Show top 5 rows
                result = await conn.execute(text("SELECT code, nm, class1cd, class2cd FROM shoper9.itemmaster LIMIT 5"))
                rows = result.all()
                print("  Sample rows:")
                for r in rows:
                    print(f"    Code: {r[0]}, Name: {r[1]}, Class1: {r[2]}, Class2: {r[3]}")
        except Exception as e:
            print(f"  Error: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(show_itemmaster())
