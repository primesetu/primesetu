import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def alter_schema():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.begin() as conn:
        print("Altering smriti_item columns to TEXT...")
        await conn.execute(text("""
            ALTER TABLE smriti_item 
            ALTER COLUMN class1 TYPE TEXT, 
            ALTER COLUMN class2 TYPE TEXT, 
            ALTER COLUMN subclass1 TYPE TEXT, 
            ALTER COLUMN subclass2 TYPE TEXT, 
            ALTER COLUMN hsn_code TYPE TEXT
        """))
    print("Done.")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(alter_schema())
