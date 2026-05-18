import os
import uuid
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from app.models.base import Base

def get_root_url():
    base_url = settings.local_database_url.rsplit('/', 1)[0]
    return f"{base_url}/postgres"

def get_registry_url():
    base_url = settings.local_database_url.rsplit('/', 1)[0]
    return f"{base_url}/smriti_registry"

def get_target_url(db_name: str):
    base_url = settings.local_database_url.rsplit('/', 1)[0]
    return f"{base_url}/{db_name}"

async def provision_new_company(company_name: str, invoice_prefix: str, gstin: str, owner_mobile: str) -> dict:
    root_url = get_root_url()
    registry_url = get_registry_url()
    clean_prefix = "".join(c for c in invoice_prefix.lower() if c.isalnum() or c == "_")
    db_name = f"smriti_{clean_prefix}"
    tenant_id = str(uuid.uuid4())
    
    # Engine for creating databases requires root connection
    root_engine_auto = create_async_engine(root_url, isolation_level="AUTOCOMMIT")
    
    # Engine for locking and registry requires registry connection
    registry_engine_tx = create_async_engine(registry_url)
    
    db_created = False
    try:
        # Step 0: Ensure smriti_registry exists before connecting
        async with root_engine_auto.connect() as root_conn:
            res = await root_conn.execute(text("SELECT 1 FROM pg_database WHERE datname='smriti_registry'"))
            if not res.fetchone():
                await root_conn.execute(text("CREATE DATABASE smriti_registry"))
                
        # Step 1: Reserve in company_registry using advisory xact lock inside smriti_registry
        async with registry_engine_tx.begin() as tx_conn:
            # Create registry if not exists
            await tx_conn.execute(text("""
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
            
            # Obtain advisory lock on a hash of the prefix to prevent concurrent allocation
            lock_id = hash(clean_prefix) & 0x7FFFFFFF # pg_advisory_xact_lock takes 32-bit int
            await tx_conn.execute(text("SELECT pg_advisory_xact_lock(:lock_id)"), {"lock_id": lock_id})
            
            # Check if prefix exists
            res = await tx_conn.execute(text("SELECT 1 FROM company_registry WHERE invoice_prefix = :prefix"), {"prefix": clean_prefix})
            if res.fetchone():
                raise Exception("Invoice prefix already in use.")
                
            # Insert provisioning record
            await tx_conn.execute(text("""
                INSERT INTO company_registry (tenant_id, company_name, invoice_prefix, gstin, owner_mobile, db_name)
                VALUES (:tid, :name, :prefix, :gst, :mob, :db)
            """), {"tid": tenant_id, "name": company_name, "prefix": clean_prefix, "gst": gstin, "mob": owner_mobile, "db": db_name})
            
        # Step 2: Create DB (autocommit required using root engine)
        async with root_engine_auto.connect() as auto_conn:
            res = await auto_conn.execute(text(f"SELECT 1 FROM pg_database WHERE datname='{db_name}'"))
            if res.fetchone():
                raise Exception("Database already exists.")
            await auto_conn.execute(text(f"CREATE DATABASE {db_name}"))
            db_created = True
            
        # Step 3: Initialize DB
        target_engine = create_async_engine(get_target_url(db_name))
        try:
            async with target_engine.begin() as t_conn:
                await t_conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))
                await t_conn.execute(text("CREATE SCHEMA IF NOT EXISTS shoper9"))
                await t_conn.execute(text("CREATE SCHEMA IF NOT EXISTS s9"))
                
                # Ensure models are registered
                import app.models.sovereign
                import app.models.config
                import app.models.schemes
                
                await t_conn.run_sync(Base.metadata.create_all)
                
                # Sync queue DDL
                sync_queue_ddl = """
                CREATE TABLE IF NOT EXISTS smriti_sync_queue (
                    id          BIGSERIAL PRIMARY KEY,
                    table_name  TEXT        NOT NULL,
                    operation   TEXT        NOT NULL,
                    record_json JSONB       NOT NULL,
                    status      TEXT        NOT NULL DEFAULT 'PENDING',
                    retry_count INT         NOT NULL DEFAULT 0,
                    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                    synced_at   TIMESTAMPTZ
                );
                CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON smriti_sync_queue (status, id);
                """
                for stmt in sync_queue_ddl.strip().split(";"):
                    if stmt.strip():
                        await t_conn.execute(text(stmt.strip()))
                        
                # ── GOLDEN SEED ENGINE — Zero-Touch Automatic Provisioning ────────────
                # Runs automatically every time a new company is created.
                # NO manual intervention needed — engine provisions all 36 tables
                # (6,404 rows) in the correct dependency order, fully idempotent.
                #
                # What gets provisioned automatically:
                #   Phase 0: SysParam, GenLookup, AcceptDisplay, Templates, GST,
                #            PayModes, Prefixes, Staff, Vendors, Seasons
                #   Phase 1: PurchaseTaxCat, Sizes, SubClasses, Version, CommConfig,
                #            Terminal, ChainStores self-registration
                #   Phase 2: Card Agencies, Billing Schemes, Accounts, Payment UI,
                #            Shift Screen fields
                #   Phase 3: Print config, Accounting components, Browser layouts,
                #            Form field visibility, Surcharge/EMI rules
                # ─────────────────────────────────────────────────────────────────────
                from seeds.golden_seed_engine import GoldenSeedEngine, ensure_sysparam_golden
                ensure_sysparam_golden()   # no-op if golden/sysparam_gkp.json already exists
                seed_summary = await GoldenSeedEngine.provision(
                    conn         = t_conn,
                    tenant_id    = tenant_id,
                    company_info = {
                        "company_name":   company_name,
                        "invoice_prefix": invoice_prefix,
                        "gstin":          gstin,
                        "owner_mobile":   owner_mobile,
                    },
                )
                import logging as _log
                _log.getLogger("smriti.provisioner").info(
                    f"[Provisioner] {db_name} seeded: "
                    f"{sum(v for v in seed_summary.values() if isinstance(v, int)):,} rows "
                    f"across {len(seed_summary)} tables"
                )
                    
        except Exception as e:
            # Dispose engine so we can drop the DB
            await target_engine.dispose()
            raise Exception(f"Failed during schema initialization: {e}")
            
        finally:
            await target_engine.dispose()
            
        # Step 4: Update status to ACTIVE
        async with registry_engine_tx.begin() as tx_conn:
            await tx_conn.execute(text("UPDATE company_registry SET status = 'ACTIVE' WHERE tenant_id = :tid"), {"tid": tenant_id})
            
        return {"status": "success", "tenant_id": tenant_id, "db_name": db_name}
        
    except Exception as exc:
        # Rollback logic
        if db_created:
            try:
                # Terminate any active connections and drop db using root engine
                async with root_engine_auto.connect() as auto_conn:
                    await auto_conn.execute(text(f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{db_name}' AND pid <> pg_backend_pid()"))
                    await auto_conn.execute(text(f"DROP DATABASE IF EXISTS {db_name}"))
            except Exception as drop_exc:
                print(f"Failed to rollback DB creation: {drop_exc}")
        
        # Remove from registry
        try:
            async with registry_engine_tx.begin() as tx_conn:
                await tx_conn.execute(text("DELETE FROM company_registry WHERE invoice_prefix = :prefix"), {"prefix": clean_prefix})
        except Exception as del_exc:
            print(f"Failed to delete registry entry: {del_exc}")
            
        raise Exception(f"Provisioning failed: {exc}")
        
    finally:
        await registry_engine_tx.dispose()
        await root_engine_auto.dispose()
