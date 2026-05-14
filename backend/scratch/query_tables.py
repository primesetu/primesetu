
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def query_tables():
    url = os.getenv("DATABASE_URL")
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            for table in ["s9sys_vamenu", "menu_items"]:
                try:
                    res = await conn.execute(text(f"SELECT count(*) FROM {table}"))
                    count = res.scalar()
                    print(f"Total rows in {table}: {count}")
                except Exception as e:
                    print(f"Error querying {table}: {e}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(query_tables())
