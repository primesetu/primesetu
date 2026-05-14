
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_and_fix_schema():
    print("[SMRITI-OS] Starting schema integrity check...")
    async with engine.begin() as conn:
        # Tables to check for tenant_id
        tables = [
            "s9.itemmaster", 
            "s9.stockmaster", 
            "s9.genlookup", 
            "s9.class12combo",
            "s9.subclass1cat",
            "s9.subclass2cat",
            "s9.sizecat"
        ]
        
        for table in tables:
            try:
                # Check if tenant_id column exists
                res = await conn.execute(text(f"""
                    SELECT column_name 
                    FROM information_schema.columns 
                    WHERE table_schema = 's9' 
                    AND table_name = '{table.split('.')[1]}' 
                    AND column_name = 'tenant_id'
                """))
                if not res.fetchone():
                    print(f"[SMRITI-OS] Missing tenant_id in {table}. Injecting...")
                    await conn.execute(text(f"ALTER TABLE {table} ADD COLUMN tenant_id VARCHAR DEFAULT 'SYSTEM'"))
                    await conn.execute(text(f"CREATE INDEX idx_{table.split('.')[1]}_tenant ON {table}(tenant_id)"))
                    print(f"[SMRITI-OS] Fixed {table}")
                else:
                    print(f"[SMRITI-OS] {table} is healthy.")
            except Exception as e:
                print(f"[SMRITI-OS] Could not check {table}: {e}")

    print("[SMRITI-OS] Schema check complete.")

if __name__ == "__main__":
    asyncio.run(check_and_fix_schema())
