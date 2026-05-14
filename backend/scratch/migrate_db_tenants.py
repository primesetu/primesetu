import asyncio
import sys
import os
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add parent dir to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def migrate_tenants():
    print("--- SMRITI-OS: Database Tenant Injection ---")
    engine = create_async_engine(settings.local_database_url)
    
    schema = settings.LEGACY_SCHEMA # usually 's9'
    
    async with engine.begin() as conn:
        # 1. Get all tables in the legacy schema
        print(f"Fetching tables from schema '{schema}'...")
        res = await conn.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema='{schema}'"))
        tables = [r[0] for r in res.fetchall()]
        
        for table in tables:
            print(f"  Injecting tenant_id into {schema}.{table}...")
            await conn.execute(text(f"""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='{schema}' AND table_name='{table}' AND column_name='tenant_id') THEN
                        ALTER TABLE {schema}."{table}" ADD COLUMN tenant_id VARCHAR DEFAULT 'SYSTEM';
                        CREATE INDEX IF NOT EXISTS "idx_{table}_tenant_id" ON {schema}."{table}"(tenant_id);
                    END IF;
                END $$;
            """))

        # 2. Get all Smriti tables in public schema
        print("Fetching Smriti tables from public schema...")
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE 'smriti_%'"))
        smriti_tables = [r[0] for r in res.fetchall()]
        
        for table in smriti_tables:
            print(f"  Injecting tenant_id into public.{table}...")
            await conn.execute(text(f"""
                DO $$ 
                BEGIN 
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='{table}' AND column_name='tenant_id') THEN
                        ALTER TABLE public."{table}" ADD COLUMN tenant_id VARCHAR DEFAULT 'SYSTEM';
                        CREATE INDEX IF NOT EXISTS "idx_{table}_tenant_id" ON public."{table}"(tenant_id);
                    END IF;
                END $$;
            """))

    await engine.dispose()
    print("--- TENANT MIGRATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(migrate_tenants())
