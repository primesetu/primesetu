import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.base import Store

async def test():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Store))
        stores = result.scalars().all()
        for s in stores:
            print(f"ID: {s.id} (Type: {type(s.id)}) Name: {s.name}")

if __name__ == "__main__":
    asyncio.run(test())
