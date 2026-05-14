import asyncio
import asyncpg
import os

async def check():
    try:
        # Hardcoded URL from .env
        conn = await asyncpg.connect("postgresql://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local")
        row = await conn.fetchrow('SELECT MIN(dateinsert), MAX(dateinsert) FROM s9.itemmaster')
        print(f"MIN_DATE:{row[0]} MAX_DATE:{row[1]}")
        await conn.close()
    except Exception as e:
        print(f"ERROR:{e}")

if __name__ == "__main__":
    asyncio.run(check())
