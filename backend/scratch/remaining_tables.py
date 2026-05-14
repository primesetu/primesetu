import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    tables = await conn.fetch("""
        SELECT table_name FROM information_schema.tables
        WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    
    print(f"REMAINING TABLES IN public SCHEMA ({len(tables)} total)\n")
    print(f"{'TABLE':45s} {'ROWS':>8s}")
    print("-" * 56)
    
    for t in tables:
        name = t['table_name']
        try:
            cnt = await conn.fetchval(f'SELECT count(*) FROM public."{name}"')
        except:
            cnt = -1
        flag = " <-- HAS DATA" if cnt and cnt > 0 else ""
        print(f"  {name:43s} {cnt:>8,}{flag}")
    
    await conn.close()

asyncio.run(main())
