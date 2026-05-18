import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Ensure 'backend/' is on the path so 'app.*' resolves from any CWD
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from app.core.config import settings
from app.services.company_provisioner import provision_new_company

async def test_wizard():
    print("[E2E] Starting Company Provisioning Flow...")
    
    admin_url = settings.local_database_url.rsplit('/', 1)[0] + "/postgres"
    registry_url = settings.local_database_url.rsplit('/', 1)[0] + "/smriti_registry"
    engine_auto = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    engine_tx = create_async_engine(registry_url)
    
    test_prefix = "test_wiz"
    db_name = f"smriti_{test_prefix}"
    
    print(f"  [1/4] Running idempotent cleanup for {db_name}...")
    # Clean up from previous runs
    try:
        async with engine_auto.connect() as conn:
            # Drop database
            await conn.execute(text(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{db_name}' AND pid <> pg_backend_pid()"))
            await conn.execute(text(f"DROP DATABASE IF EXISTS {db_name}"))
            
        async with engine_tx.begin() as conn:
            # Make sure registry exists before deleting
            await conn.execute(text("""
                CREATE TABLE IF NOT EXISTS company_registry (
                    tenant_id UUID PRIMARY KEY,
                    company_name VARCHAR(255) NOT NULL,
                    invoice_prefix VARCHAR(50) UNIQUE NOT NULL,
                    gstin VARCHAR(50),
                    owner_mobile VARCHAR(20),
                    db_name VARCHAR(100) UNIQUE NOT NULL,
                    status VARCHAR(20) DEFAULT 'PROVISIONING',
                    created_at TIMESTAMPTZ DEFAULT NOW()
                )
            """))
            await conn.execute(text("DELETE FROM company_registry WHERE invoice_prefix = :prefix"), {"prefix": test_prefix})
    except Exception as e:
        print(f"Cleanup error (safe to ignore if first run): {e}")

    print("  [2/4] Executing provision_new_company...")
    try:
        result = await provision_new_company(
            company_name="Test Wizard Retailers",
            invoice_prefix=test_prefix,
            gstin="27AADCB2230M1Z2",
            owner_mobile="9999999999"
        )
        print(f"    -> Provisioned successfully: {result}")
    except Exception as e:
        print(f"    -> Provisioning failed: {e}")
        await engine_auto.dispose()
        await engine_tx.dispose()
        sys.exit(1)
        
    print("  [3/4] Validating database structure...")
    target_engine = create_async_engine(f"{settings.local_database_url.rsplit('/', 1)[0]}/{db_name}")
    try:
        async with target_engine.connect() as conn:
            # Check if smriti_param was seeded
            res = await conn.execute(text("SELECT COUNT(*) FROM smriti_param"))
            count = res.scalar()
            print(f"    -> Seeded params count: {count}")
            assert count >= 6, "smriti_param did not seed properly"
            
            # Check if shoper9 schema exists
            res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'shoper9'"))
            schema = res.scalar()
            print(f"    -> Found schema: {schema}")
            assert schema == 'shoper9', "shoper9 schema not found"
            
            # Check if s9 schema exists
            res_s9 = await conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 's9'"))
            schema_s9 = res_s9.scalar()
            print(f"    -> Found schema: {schema_s9}")
            assert schema_s9 == 's9', "s9 schema not found"
            
            # Assert legacy s9.sysparam seeding count
            res_s9_params = await conn.execute(text("SELECT COUNT(*) FROM s9.sysparam"))
            s9_params_count = res_s9_params.scalar()
            print(f"    -> Legacy s9.sysparam count: {s9_params_count}")
            assert s9_params_count >= 800, f"s9.sysparam count was {s9_params_count}, expected >= 800"
            
            # Assert specific PrintPreview param exists and has expected value_int (intg)
            res_preview = await conn.execute(text("SELECT intg FROM s9.sysparam WHERE paramcode = 'PrintPreview'"))
            preview_val = res_preview.scalar()
            print(f"    -> PrintPreview legacy value_int (intg): {preview_val}")
            assert preview_val == 1, f"PrintPreview intg was {preview_val}, expected 1"
    except Exception as e:
        print(f"    -> Validation failed: {e}")
        sys.exit(1)
    finally:
        await target_engine.dispose()
        
    print("  [4/4] Validating registry status...")
    try:
        async with engine_tx.connect() as conn:
            res = await conn.execute(text("SELECT status FROM company_registry WHERE invoice_prefix = :prefix"), {"prefix": test_prefix})
            status = res.scalar()
            print(f"    -> Registry status: {status}")
            assert status == 'ACTIVE', "Status not ACTIVE in registry"
    except Exception as e:
        print(f"    -> Registry check failed: {e}")
        sys.exit(1)
        
    print("\n[E2E] SUCCESS: Company Provisioning Flow validated.")
    await engine_auto.dispose()
    await engine_tx.dispose()

if __name__ == "__main__":
    asyncio.run(test_wizard())
