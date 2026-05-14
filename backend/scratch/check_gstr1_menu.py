
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_gstr1():
    async with engine.connect() as conn:
        q = text("SELECT id FROM public.menu_items WHERE id = 'gstr1'")
        r = await conn.execute(q)
        for row in r:
            print(row[0])

if __name__ == "__main__":
    asyncio.run(check_gstr1())
