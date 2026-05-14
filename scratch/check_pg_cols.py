import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def check_columns():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    for table in ['ptinvoicehdr', 'ptinvoicedtl']:
        print(f"--- Columns for {table} ---")
        columns = await pg.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}'")
        print([r['column_name'] for r in columns])
        
    await pg.close()

if __name__ == "__main__":
    asyncio.run(check_columns())
