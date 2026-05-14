import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    # Get stktrndtls columns
    for tbl in ['stktrndtls', 'stktrnhdr']:
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
    
    # Sample a few rows from stktrndtls to understand trntype values
    print('\n=== DISTINCT TRNTYPE in stktrndtls ===')
    rows = await conn.fetch('SELECT trntype, count(*) as cnt FROM shoper9.stktrndtls GROUP BY trntype ORDER BY cnt DESC LIMIT 20')
    for r in rows:
        print(f'  trntype={r["trntype"]:5d}  count={r["cnt"]}')

    # Sample stktrnhdr trntype
    print('\n=== DISTINCT TRNTYPE in stktrnhdr ===')
    rows = await conn.fetch('SELECT trntype, count(*) as cnt FROM shoper9.stktrnhdr GROUP BY trntype ORDER BY cnt DESC LIMIT 20')
    for r in rows:
        print(f'  trntype={r["trntype"]:5d}  count={r["cnt"]}')
    
    await conn.close()

asyncio.run(main())
