
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_all_sysparams():
    async with engine.connect() as conn:
        query = text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'shoper9' AND table_name ILIKE '%sysparam%'")
        result = await conn.execute(query)
        tables = [r[0] for r in result.fetchall()]
        
        for table in tables:
            try:
                cnt = await conn.execute(text(f'SELECT COUNT(*) FROM shoper9."{table}"'))
                print(f"{table}: {cnt.scalar()} rows")
            except Exception as e:
                print(f"Error checking {table}: {e}")

if __name__ == "__main__":
    asyncio.run(check_all_sysparams())
