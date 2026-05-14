import asyncio
from app.core.database import engine
from sqlalchemy import text

async def main():
    async with engine.connect() as c:
        res = await c.execute(text("SELECT count(*) FROM items"))
        print(f"Items count: {res.scalar()}")

if __name__ == '__main__':
    asyncio.run(main())
