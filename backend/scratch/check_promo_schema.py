import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    for table in ['promomnheader', 'promomnitemlvldiscdtls', 'promomnbilllvldiscdtls']:
        print(f"--- Columns in {table} ---")
        cols = await conn.fetch(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = 'shoper9'")
        for c in cols:
            print(f"{c['column_name']}: {c['data_type']}")
            
    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
