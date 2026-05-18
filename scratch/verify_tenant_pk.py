import sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

PG_URL = 'postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local'
SCHEMA = 's9'
VERIFY_TABLES = ['genlookup','itemmaster','stockmaster','vendors','customers',
                 'prefixmaster','sysparam','genlookupextd','personnel','sizecat']

async def main():
    engine = create_async_engine(PG_URL)
    async with engine.connect() as conn:
        print('Verification - PK columns after migration:')
        all_ok = True
        for table in VERIFY_TABLES:
            r = await conn.execute(text(
                "SELECT kcu.column_name"
                " FROM information_schema.table_constraints tc"
                " JOIN information_schema.key_column_usage kcu"
                "   ON tc.constraint_name = kcu.constraint_name"
                "  AND tc.table_schema    = kcu.table_schema"
                f" WHERE tc.constraint_type = 'PRIMARY KEY'"
                f"   AND tc.table_schema = '{SCHEMA}'"
                f"   AND tc.table_name   = '{table}'"
                " ORDER BY kcu.ordinal_position"
            ))
            pk = [row[0] for row in r.fetchall()]
            has_tid = 'tenant_id' in pk
            status = '[OK]' if has_tid else '[MISSING]'
            if not has_tid: all_ok = False
            print(f'  {status} {table:<28} PK = {pk}')
        print()
        print('All OK!' if all_ok else 'SOME TABLES STILL MISSING!')
    await engine.dispose()

asyncio.run(main())
