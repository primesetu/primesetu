
import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def query_vamenu():
    url = os.getenv("DATABASE_URL")
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text("SELECT count(*) FROM s9sys_vamenu"))
            count = res.scalar()
            print(f"Total rows in s9sys_vamenu: {count}")
            
            if count > 0:
                res = await conn.execute(text("SELECT mnuno, menuopt, mnuname, mnucap FROM s9sys_vamenu LIMIT 5"))
                rows = res.fetchall()
                print("First 5 rows:")
                for row in rows:
                    print(row)
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(query_vamenu())
