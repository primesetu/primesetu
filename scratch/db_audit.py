import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def audit_db():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        print("\n--- SMRITI-OS LOCAL DATABASE AUDIT ---")
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'"))
        tables = [r[0] for r in res.fetchall()]
        
        for table in sorted(tables):
            try:
                count_res = await conn.execute(text(f"SELECT count(*) FROM {table}"))
                count = count_res.scalar()
                print(f"[OK] {table:25} | {count:7} records")
            except Exception as e:
                print(f"[ERR] {table:25} | Error: {e}")
        
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(audit_db())
