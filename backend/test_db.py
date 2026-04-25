
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import os
from dotenv import load_dotenv

load_dotenv()

async def test_conn():
    url = os.getenv("DATABASE_URL")
    print(f"Connecting to: {url}")
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT 1"))
            print(f"Result: {res.scalar()}")
            print("Database connection SUCCESSFUL")
    except Exception as e:
        print(f"Database connection FAILED: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(test_conn())
