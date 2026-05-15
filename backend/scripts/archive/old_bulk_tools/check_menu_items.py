import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.routers.menu import MenuItem

async def check_menu():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(MenuItem))
        items = result.scalars().all()
        for item in items:
            print(f"ID: {item.id}, Label: {item.label}, Category: {item.category}")

if __name__ == "__main__":
    asyncio.run(check_menu())
