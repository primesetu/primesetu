#!/usr/bin/env python
# ============================================================
# SMRITI-OS — Local PostgreSQL Bootstrap Script
# Run this ONCE to initialize the offline sovereign database.
#
# Prerequisites:
#   1. Install PostgreSQL: https://www.postgresql.org/download/
#   2. Create the local database:
#        psql -U postgres -c "CREATE DATABASE smriti_local;"
#   3. Set in .env:
#        STORAGE_MODE=LOCAL_POSTGRES
#        LOCAL_DATABASE_URL=postgresql+asyncpg://postgres:YOUR_PW@localhost:5432/smriti_local
#
# Usage:
#   python scripts/init_local_db.py
#
# What this does:
#   1. Applies the full sovereign schema to local PostgreSQL
#   2. Creates smriti_sync_queue (JSONB-based, indexed by status)
#   3. Seeds default system parameters
#   4. Verifies connection successfully
# ============================================================
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text


def get_local_url() -> str:
    """Read LOCAL_DATABASE_URL from env or .env file."""
    from dotenv import load_dotenv
    load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))
    url = os.environ.get(
        "LOCAL_DATABASE_URL",
        "postgresql+asyncpg://postgres:postgres@localhost:5432/smriti_local"
    )
    return url


SYNC_QUEUE_DDL = """
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

DEFAULT_PARAMS = [
    ("STORE_MODE",    "Active data storage mode",      "LOCAL_POSTGRES", "SYSTEM"),
    ("SYNC_INTERVAL", "Cloud sync interval (seconds)", "30",             "SYNC"),
    ("CLOUD_ENABLED", "Sync to Supabase when online",  "true",          "SYNC"),
    ("STORE_CODE",    "Store identifier code",          "STORE01",       "STORE"),
]


async def main():
    local_url = get_local_url()

    print(f"\n{'═'*60}")
    print("  SMRITI-OS — Local PostgreSQL Database Bootstrap")
    print(f"{'═'*60}")
    print(f"  Target: {local_url.split('@')[-1]}\n")

    engine = create_async_engine(local_url, echo=True)

    # 1. Import all models to register with Base metadata
    print("  [1/4] Registering Sovereign models...")
    os.environ["STORAGE_MODE"] = "LOCAL_POSTGRES"
    from app.models.base import Base
    import app.models.sovereign    # noqa: F401
    import app.models.config       # noqa: F401
    import app.models.schemes      # noqa: F401

    # 2. Create all tables
    print("\n  [2/4] Applying schema to local PostgreSQL...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("  ✓ Sovereign tables created.")

    # 3. Create sync queue
    print("\n  [3/4] Creating sync queue...")
    async with engine.begin() as conn:
        for stmt in SYNC_QUEUE_DDL.strip().split(";"):
            s = stmt.strip()
            if s:
                await conn.execute(text(s))
    print("  ✓ smriti_sync_queue (JSONB) created with status index.")

    # 4. Seed system params
    print("\n  [4/4] Seeding system parameters...")
    async with engine.begin() as conn:
        for param_code, descr, value_txt, category in DEFAULT_PARAMS:
            await conn.execute(text("""
                INSERT INTO smriti_param (param_code, descr, value_txt, category)
                VALUES (:c, :d, :v, :cat)
                ON CONFLICT (param_code) DO NOTHING
            """), {"c": param_code, "d": descr, "v": value_txt, "cat": category})
    print("  ✓ Default system parameters seeded.")

    await engine.dispose()

    print(f"\n{'═'*60}")
    print("  Bootstrap complete!")
    print(f"\n  Add these to your backend/.env:")
    print(f"    STORAGE_MODE=LOCAL_POSTGRES")
    print(f"    LOCAL_DATABASE_URL={local_url}")
    print(f"\n  Then start the backend normally:")
    print(f"    uvicorn app.main:app --reload")
    print(f"{'═'*60}\n")


if __name__ == "__main__":
    asyncio.run(main())
