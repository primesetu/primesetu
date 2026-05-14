
import asyncio
import sys
import os

# Add the current directory to sys.path to import app
sys.path.append(os.getcwd())

from app.core.database import engine
from sqlalchemy import text

async def check():
    try:
        async with engine.connect() as conn:
            res = await conn.execute(text('SELECT COUNT(*) FROM menu_items'))
            count = res.scalar()
            print(f'Menu items count: {count}')
            
            res = await conn.execute(text('SELECT * FROM menu_items'))
            rows = res.fetchall()
            for row in rows:
                print(row)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(check())
