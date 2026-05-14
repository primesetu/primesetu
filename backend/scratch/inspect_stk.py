import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    for tbl in ['stktrndtls', 'stktrnhdr', 'stktrndtlsextd01', 'stktrnaddldtls', 'stktrnaddlhdr']:
        cols = await conn.fetch('''
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_schema = 'shoper9' AND table_name = $1
            ORDER BY ordinal_position
        ''', tbl)
        print(f'\n=== shoper9.{tbl} ===')
        for c in cols:
            print(f'  {c["column_name"]:30s} {c["data_type"]}')
        cnt = await conn.fetchval(f'SELECT count(*) FROM shoper9."{tbl}"')
        print(f'  --- ROW COUNT: {cnt} ---')
    
    await conn.close()

asyncio.run(main())
