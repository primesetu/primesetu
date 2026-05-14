
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def query_groups():
    url = os.getenv("DATABASE_URL")
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT name FROM va_groups"))
            print(f"Groups: {res.fetchall()}")
            
            res = await conn.execute(text("SELECT permission, is_allowed FROM va_group_permissions"))
            print(f"Permissions: {res.fetchall()}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(query_groups())
