import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def deep_debug():
    print("=== SMRITI-OS: Deep Backend Debug ===")
    print(f"STORAGE_MODE: {settings.storage_mode}")
    print(f"LEGACY_SCHEMA: {settings.LEGACY_SCHEMA}")
    
    engine = create_async_engine(settings.local_database_url)
    
    async with engine.connect() as conn:
        print("\n1. Testing Database Connection...")
        try:
            await conn.execute(text("SELECT 1"))
            print("[OK] Connection Successful.")
        except Exception as e:
            print(f"[FAIL] Connection Error: {e}")
            return

        print("\n2. Checking Schemas...")
        res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [r[0] for r in res.fetchall()]
        print(f"Existing Schemas: {', '.join(schemas)}")
        if settings.LEGACY_SCHEMA in schemas:
            print(f"[OK] Legacy schema '{settings.LEGACY_SCHEMA}' found.")
        else:
            print(f"[FAIL] Legacy schema '{settings.LEGACY_SCHEMA}' NOT found.")

        print("\n3. Checking for tenant_id in core tables...")
        tables_to_check = ['users', 'stores', 'transactions', 'customers', 'partners']
        for table in tables_to_check:
            res = await conn.execute(text(f"""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='{table}' AND column_name='tenant_id'
            """))
            exists = res.scalar() is not None
            status = "[OK]" if exists else "[MISSING]"
            print(f"{status} Table '{table}': tenant_id column")

        print("\n4. Checking System Parameters...")
        try:
            # Check SmritiParam table
            res = await conn.execute(text("SELECT COUNT(*) FROM smritiparam"))
            count = res.scalar()
            print(f"[OK] smritiparam table exists with {count} records.")
        except Exception as e:
            print(f"[MISSING] smritiparam table: {e}")

    await engine.dispose()
    print("\n=== DEBUG COMPLETE ===")

if __name__ == "__main__":
    asyncio.run(deep_debug())
