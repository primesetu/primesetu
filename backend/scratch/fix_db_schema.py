import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def fix_db():
    print("--- SMRITI-OS: Database Repair & Sync ---")
    engine = create_async_engine(settings.local_database_url)
    
    async with engine.begin() as conn:
        # 1. Add tenant_id to core tables if missing
        tables = ['users', 'stores', 'transactions', 'customers', 'partners', 'menu_items']
        for table in tables:
            print(f"Checking table '{table}' for tenant_id...")
            await conn.execute(text(f"""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='{table}' AND column_name='tenant_id') THEN
                        ALTER TABLE {table} ADD COLUMN tenant_id VARCHAR DEFAULT 'SYSTEM';
                    END IF;
                END $$;
            """))
            await conn.execute(text(f"CREATE INDEX IF NOT EXISTS idx_{table}_tenant_id ON {table}(tenant_id)"))
            print(f"  [OK] Table '{table}' updated.")

        # 2. Add required_sysparam to menu_items if missing
        print("Checking table 'menu_items' for required_sysparam...")
        await conn.execute(text("""
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='menu_items' AND column_name='required_sysparam') THEN
                    ALTER TABLE menu_items ADD COLUMN required_sysparam VARCHAR;
                END IF;
            END $$;
        """))
        print("  [OK] Table 'menu_items' updated.")

        # 3. Create SmritiParam table (smritiparam) if missing
        print("Creating 'smritiparam' table if missing...")
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS smritiparam (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                tenant_id VARCHAR DEFAULT 'SYSTEM',
                param_code VARCHAR NOT NULL,
                descr VARCHAR,
                value_txt VARCHAR,
                category VARCHAR,
                is_active BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_smritiparam_code ON smritiparam(param_code)"))
        await conn.execute(text("CREATE INDEX IF NOT EXISTS idx_smritiparam_tenant ON smritiparam(tenant_id)"))
        print("  [OK] 'smritiparam' table verified.")

    await engine.dispose()
    print("--- DB SYNC COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(fix_db())
