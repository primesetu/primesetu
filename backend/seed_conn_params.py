import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local"

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def seed_conn_params():
    params = [
        ('DB_HOST', 'Database Server IP/Host', '127.0.0.1', 'T', 'CONN', 'Database Connection Details', 1),
        ('DB_PORT', 'Database Port', '5434', 'I', 'CONN', 'Database Connection Details', 2),
        ('DB_USER', 'Database Username', 'postgres', 'T', 'CONN', 'Database Connection Details', 3),
        ('DB_PASS', 'Database Password (Encrypted)', '********', 'T', 'CONN', 'Database Connection Details', 4),
        ('DB_NAME', 'Database Name', 'smriti_local', 'T', 'CONN', 'Database Connection Details', 5),
        ('DB_SCHEMA', 'Default Schema (e.g. s9)', 's9', 'T', 'CONN', 'Database Connection Details', 6),
        ('SYNC_MODE', 'Cloud Sync Enable', 'true', 'B', 'CONN', 'Database Connection Details', 7),
    ]
    
    async with AsyncSessionLocal() as db:
        for code, descr, val, opt, cat, cat_descr, disp in params:
            # Check if exists
            res = await db.execute(text("SELECT 1 FROM smriti_param WHERE param_code = :code"), {"code": code})
            if not res.scalar():
                print(f"Seeding {code}...")
                await db.execute(text("""
                    INSERT INTO smriti_param 
                    (tenant_id, param_code, descr, value_txt, value_bool, value_int, opt_type, category, cat_descr, disp_order, fixed_type)
                    VALUES 
                    ('SYSTEM', :code, :descr, :txt, :bool, :int, :opt, :cat, :cat_descr, :disp, 'Variable')
                """), {
                    "code": code,
                    "descr": descr,
                    "txt": val if opt == 'T' else None,
                    "bool": val.lower() == 'true' if opt == 'B' else False,
                    "int": int(val) if opt == 'I' else 0,
                    "opt": opt,
                    "cat": cat,
                    "cat_descr": cat_descr,
                    "disp": disp
                })
        await db.commit()
    print("Done.")

if __name__ == "__main__":
    asyncio.run(seed_conn_params())
