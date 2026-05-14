import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def verify():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        res = await conn.execute(text("SELECT count(*) FROM smriti_item"))
        print(f"Total Items in smriti_item: {res.scalar()}")
        
        res = await conn.execute(text("SELECT sku, name, mrp FROM smriti_item LIMIT 5"))
        print("\nSample Records:")
        for r in res.fetchall():
            print(f"SKU: {r.sku}, Name: {r.name}, MRP: {r.mrp}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(verify())
