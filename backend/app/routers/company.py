from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import app.models.sovereign  # Register all retail/inventory schemas
from app.models.base import Base
from app.core.config import settings

router = APIRouter(prefix="/companies", tags=["companies"])


class CompanyCreateRequest(BaseModel):
    name: str
    dbName: str
    state: str = "Delhi"
    gst: str = ""


# default system params to seed in every new company
DEFAULT_PARAMS = [
    ("STORE_MODE", "Active data storage", "LOCAL_POSTGRES", "SYSTEM"),
    ("STRICT_MASTER_MODE", "Enforce pre-defined masters", "true", "LOGIC"),
    ("AUTO_CREATE_STOCK", "Auto stock row creation", "true", "LOGIC"),
]


def get_admin_url():
    # settings.local_database_url: postgresql+asyncpg://postgres:pass@127.0.0.1:5434/smriti_local
    # We need to replace the db name with postgres, or just use the same URL.
    # Connecting to the default 'postgres' db is safer for creating new databases.
    base_url = settings.local_database_url.rsplit("/", 1)[0]
    return f"{base_url}/postgres"


def get_registry_url():
    base_url = settings.local_database_url.rsplit("/", 1)[0]
    return f"{base_url}/smriti_registry"


@router.get("")
async def list_companies():
    """
    Connects to the master postgres database and lists all databases starting with 'smriti_'.
    Returns actual company names from smriti_registry if found, otherwise falls back to friendly names.
    """
    admin_url = get_admin_url()
    registry_url = get_registry_url()

    # 1. Fetch physical pg databases
    admin_engine = create_async_engine(admin_url)
    databases_map = {}
    try:
        async with admin_engine.connect() as conn:
            result = await conn.execute(
                text(
                    "SELECT datname, pg_size_pretty(pg_database_size(datname)) as size FROM pg_database WHERE datname LIKE 'smriti_%' AND datname != 'smriti_registry'"
                )
            )
            for db in result.fetchall():
                db_name = db.datname
                size_str = db.size
                size_mb = 0.0
                if "MB" in size_str:
                    size_mb = float(size_str.replace(" MB", ""))
                elif "kB" in size_str:
                    size_mb = float(size_str.replace(" kB", "")) / 1024.0
                elif "bytes" in size_str:
                    size_mb = float(size_str.replace(" bytes", "")) / (1024.0 * 1024.0)
                databases_map[db_name] = size_mb
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to scan databases: {e}")
    finally:
        await admin_engine.dispose()

    # 2. Query company_registry in smriti_registry
    registry_engine = create_async_engine(registry_url)
    registered_companies = {}
    try:
        async with registry_engine.connect() as conn:
            await conn.execute(
                text(
                    """
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
            """
                )
            )

            result = await conn.execute(
                text(
                    "SELECT tenant_id, company_name, db_name, status FROM company_registry"
                )
            )
            for row in result.fetchall():
                registered_companies[row.db_name] = {
                    "id": str(row.tenant_id),
                    "name": row.company_name,
                    "status": row.status,
                }
    except Exception as e:
        print(f"Registry table lookup warning: {e}")
    finally:
        await registry_engine.dispose()

    # 3. Merge databases with registry
    companies = []
    for db_name, size_mb in databases_map.items():
        if db_name in registered_companies:
            companies.append(
                {
                    "id": registered_companies[db_name]["id"],
                    "name": registered_companies[db_name]["name"],
                    "db_name": db_name,
                    "db_size": size_mb,
                    "status": registered_companies[db_name]["status"],
                }
            )
        else:
            # Fallback for smriti_local or unregistered databases
            companies.append(
                {
                    "id": db_name,
                    "name": db_name.replace("smriti_", "").replace("_", " ").title(),
                    "db_name": db_name,
                    "db_size": size_mb,
                    "status": "ACTIVE",
                }
            )

    return companies


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_new_company_database(payload: CompanyCreateRequest):
    """
    1. Connects to Postgres root database.
    2. Provisions new database container.
    3. Triggers dynamic tables creation.
    4. Seeds sovereign default values.
    """
    # Sanitize inputs
    clean_db_name = "".join(
        c for c in payload.dbName.lower() if c.isalnum() or c == "_"
    )
    if not clean_db_name.startswith("smriti_"):
        clean_db_name = f"smriti_{clean_db_name}"

    admin_url = get_admin_url()

    # STEP 1: Connect to Postgres root to execute database creation
    admin_engine = create_async_engine(admin_url, isolation_level="AUTOCOMMIT")
    try:
        async with admin_engine.connect() as conn:
            # Check if exists
            result = await conn.execute(
                text(f"SELECT 1 FROM pg_database WHERE datname='{clean_db_name}'")
            )
            if result.fetchone():
                raise HTTPException(
                    status_code=400, detail="Database name already exists."
                )

            print(f"Creating database {clean_db_name}...")
            await conn.execute(text(f"CREATE DATABASE {clean_db_name}"))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        await admin_engine.dispose()

    # STEP 2: Instantly spin up a temporary pool to target database to run migrations
    base_url = settings.local_database_url.rsplit("/", 1)[0]
    target_url = f"{base_url}/{clean_db_name}"
    target_engine = create_async_engine(target_url)

    try:
        print(f"Applying schemas and base tables to {clean_db_name}...")
        async with target_engine.begin() as conn:
            # Create extension
            await conn.execute(text('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"'))

            # Create namespaces
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS shoper9"))
            await conn.execute(text("CREATE SCHEMA IF NOT EXISTS s9"))

            # Build all models defined in metadata
            await conn.run_sync(Base.metadata.create_all)

            # Build core sync queue DDL and distributed ledger schemas
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

            -- 1. True Immutable Event Journal (Append-Only Log)
            CREATE TABLE IF NOT EXISTS s9.transaction_event_journal (
                id BIGSERIAL PRIMARY KEY,
                event_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
                device_id VARCHAR(50) NOT NULL,
                device_sequence BIGINT NOT NULL,
                event_type VARCHAR(40) NOT NULL,
                payload JSONB NOT NULL,
                idempotency_hash VARCHAR(64) UNIQUE NOT NULL,
                operator_id UUID NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE UNIQUE INDEX IF NOT EXISTS idx_device_sequence_lock 
            ON s9.transaction_event_journal (device_id, device_sequence);

            -- 2. Device Synchronization Matrix Tracking
            CREATE TABLE IF NOT EXISTS s9.device_watermarks (
                device_id VARCHAR(50) PRIMARY KEY,
                trusted_terminal_token VARCHAR(100) UNIQUE NOT NULL,
                last_processed_sequence BIGINT NOT NULL DEFAULT 0,
                last_sync_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                is_authorized BOOLEAN NOT NULL DEFAULT TRUE,
                minimum_app_version VARCHAR(20) NOT NULL DEFAULT '1.0.0'
            );

            -- 3. Dead Letter Recovery Queue
            CREATE TABLE IF NOT EXISTS s9.sync_dead_letter_queue (
                id BIGSERIAL PRIMARY KEY,
                event_id UUID UNIQUE NOT NULL,
                device_id VARCHAR(50) NOT NULL,
                failure_reason TEXT NOT NULL,
                raw_payload JSONB NOT NULL,
                quarantine_status VARCHAR(20) NOT NULL DEFAULT 'UNRESOLVED',
                captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                resolved_at TIMESTAMPTZ
            );
            """
            for stmt in sync_queue_ddl.strip().split(";"):
                if stmt.strip():
                    await conn.execute(text(stmt.strip()))

            # Seed system params
            for param, descr, val, cat in DEFAULT_PARAMS:
                await conn.execute(
                    text(
                        """
                    INSERT INTO smriti_param (tenant_id, param_code, descr, value_txt, category, value_bool, value_int, disp_order, last_sync)
                    VALUES ('SYSTEM', :c, :d, :v, :cat, false, 0, 0, NOW())
                """
                    ),
                    {"c": param, "d": descr, "v": val, "cat": cat},
                )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to seed new DB: {e}")
    finally:
        await target_engine.dispose()

    print(f"Database {clean_db_name} fully provisioned and seeded successfully!")
    return {
        "status": "success",
        "db_name": clean_db_name,
        "message": "Company database provisioned successfully!",
    }
