
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def audit_sysparams():
    async with engine.connect() as conn:
        q = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'shoper9' AND table_name ILIKE 'sysparam%'")
        tables = [r[0] for r in (await conn.execute(q)).fetchall()]
        for table in tables:
            cnt = (await conn.execute(text(f'SELECT COUNT(*) FROM shoper9."{table}"'))).scalar()
            print(f"{table}: {cnt} rows")

if __name__ == "__main__":
    asyncio.run(audit_sysparams())
