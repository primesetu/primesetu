
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_schema():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_schema = 's9' AND table_name = 'genlookup'"))
        columns = [row[0] for row in result]
        print(f"Columns in s9.genlookup: {columns}")

if __name__ == "__main__":
    asyncio.run(check_schema())
