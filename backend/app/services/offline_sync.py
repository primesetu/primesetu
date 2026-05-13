# ============================================================
# SMRITI-OS — Offline Sync Engine
# Strategy: Local PostgreSQL ↔ Supabase (Cloud PostgreSQL)
#
# Why PostgreSQL locally?
#   • Same engine as cloud → zero SQL dialect friction
#   • MVCC supports concurrent POS tills
#   • Full JSON/JSONB, CTEs, Window Functions
#   • Native logical replication or REST upsert on reconnect
#   • Type-safe schema migration via Alembic works identically
# ============================================================
import asyncio
import logging
import json
import socket
from datetime import datetime
from typing import Optional

import httpx
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

from app.core.config import settings

logger = logging.getLogger("smriti.offline_sync")

STATUS_PENDING = "PENDING"
STATUS_SYNCED  = "SYNCED"
STATUS_FAILED  = "FAILED"

# ── Sync Queue DDL (in local PostgreSQL) ────────────────────
QUEUE_DDL = """
CREATE TABLE IF NOT EXISTS smriti_sync_queue (
    id          BIGSERIAL PRIMARY KEY,
    table_name  TEXT      NOT NULL,
    operation   TEXT      NOT NULL,   -- INSERT | UPDATE | DELETE
    record_json JSONB     NOT NULL,   -- Changed row as JSONB (native Postgres)
    status      TEXT      NOT NULL DEFAULT 'PENDING',
    retry_count INT       NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced_at   TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON smriti_sync_queue (status, id);
"""


# ── Connectivity Probe ───────────────────────────────────────
def _is_online(host: str = "8.8.8.8", port: int = 53, timeout: int = 2) -> bool:
    try:
        socket.setdefaulttimeout(timeout)
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.connect((host, port))
        return True
    except OSError:
        return False


class OfflineSyncEngine:
    """
    PostgreSQL ↔ PostgreSQL Sync Engine.

    Local PostgreSQL (offline/LAN store) → Supabase Cloud PostgreSQL.

    Uses Supabase PostgREST REST API for upserts (no direct DB link needed).
    Switches to direct asyncpg replication when Supabase pg_dump endpoint
    is available (future: logical replication slot).

    Lifecycle:
      1. Startup  → create smriti_sync_queue table in LOCAL PG
      2. Per write → enqueue(table, operation, record_dict)
      3. Every N seconds → probe connectivity → flush queue to Supabase REST
    """

    def __init__(self, local_db_url: str, interval: int = 30):
        self.local_db_url = local_db_url
        self.interval = interval
        self._running = False
        self._task: Optional[asyncio.Task] = None

        self._cloud_base = settings.supabase_url.rstrip("/")
        self._cloud_headers = {
            "apikey": settings.supabase_service_role_key,
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "resolution=merge-duplicates,return=minimal",
        }

        # Local PG engine (writes happen here offline)
        self._local_engine = create_async_engine(
            local_db_url,
            echo=False,
            pool_size=5,
            max_overflow=2,
        )
        self._local_session = async_sessionmaker(
            bind=self._local_engine,
            class_=AsyncSession,
            expire_on_commit=False
        )

    # ── Bootstrap ────────────────────────────────────────────
    async def initialize(self):
        """Create sync queue table in local PostgreSQL."""
        async with self._local_engine.begin() as conn:
            for stmt in QUEUE_DDL.strip().split(";"):
                s = stmt.strip()
                if s:
                    await conn.execute(text(s))
        logger.info("[OfflineSync] Local PG queue initialized.")

    # ── Public API ───────────────────────────────────────────
    async def enqueue(self, table_name: str, operation: str, record: dict):
        """
        Call after any local PG write to register it for cloud sync.

        Example:
            await offline_sync.enqueue("smriti_sale_hdr", "INSERT", sale_dict)
        """
        async with self._local_session() as session:
            await session.execute(
                text("""
                    INSERT INTO smriti_sync_queue (table_name, operation, record_json)
                    VALUES (:tbl, :op, CAST(:rec AS JSONB))
                """),
                {"tbl": table_name, "op": operation, "rec": json.dumps(record, default=str)}
            )
            await session.commit()

    async def start(self):
        self._running = True
        self._task = asyncio.create_task(self._sync_loop())
        logger.info(f"[OfflineSync] Background sync started (interval={self.interval}s)")

    async def stop(self):
        self._running = False
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        await self._local_engine.dispose()
        logger.info("[OfflineSync] Sync engine stopped.")

    # ── Background Loop ──────────────────────────────────────
    async def _sync_loop(self):
        while self._running:
            await asyncio.sleep(self.interval)
            try:
                if _is_online():
                    await self._flush_queue()
                else:
                    logger.debug("[OfflineSync] No internet — queue held in local PG.")
            except Exception as e:
                logger.error(f"[OfflineSync] Flush error: {e}")

    # ── Flush to Supabase REST ────────────────────────────────
    async def _flush_queue(self):
        async with self._local_session() as session:
            result = await session.execute(
                text("""
                    SELECT id, table_name, operation, record_json
                    FROM smriti_sync_queue
                    WHERE status = 'PENDING' AND retry_count < 5
                    ORDER BY id
                    LIMIT 100
                """)
            )
            rows = result.fetchall()

        if not rows:
            return

        logger.info(f"[OfflineSync] Flushing {len(rows)} records to Supabase...")

        async with httpx.AsyncClient(timeout=15) as client:
            for row in rows:
                row_id, table, operation, record = row
                record_dict = record if isinstance(record, dict) else json.loads(record)

                try:
                    url = f"{self._cloud_base}/rest/v1/{table}"

                    if operation in ("INSERT", "UPDATE"):
                        resp = await client.post(url, headers=self._cloud_headers, json=record_dict)
                    elif operation == "DELETE":
                        # Use primary key for delete — try common PK patterns
                        pk_val = (
                            record_dict.get("id")
                            or record_dict.get("bill_no")
                            or record_dict.get("sku")
                        )
                        resp = await client.delete(
                            f"{url}?id=eq.{pk_val}",
                            headers=self._cloud_headers
                        )
                    else:
                        continue

                    ok = resp.status_code in (200, 201, 204)
                    await self._set_status(row_id, STATUS_SYNCED if ok else STATUS_FAILED)

                    if ok:
                        logger.debug(f"[OfflineSync] ✓ {operation} → {table} (id={row_id})")
                    else:
                        logger.warning(
                            f"[OfflineSync] ✗ {operation} → {table} "
                            f"HTTP {resp.status_code}: {resp.text[:120]}"
                        )

                except Exception as e:
                    logger.error(f"[OfflineSync] Exception row {row_id}: {e}")
                    await self._set_status(row_id, STATUS_FAILED)

    async def _set_status(self, row_id: int, status: str):
        async with self._local_session() as session:
            if status == STATUS_SYNCED:
                await session.execute(
                    text("UPDATE smriti_sync_queue SET status='SYNCED', synced_at=NOW() WHERE id=:id"),
                    {"id": row_id}
                )
            else:
                await session.execute(
                    text("UPDATE smriti_sync_queue SET status='FAILED', retry_count=retry_count+1 WHERE id=:id"),
                    {"id": row_id}
                )
            await session.commit()

    # ── Status Summary ───────────────────────────────────────
    async def get_status(self) -> dict:
        async with self._local_session() as session:
            result = await session.execute(
                text("SELECT status, COUNT(*) FROM smriti_sync_queue GROUP BY status")
            )
            counts = {row[0]: row[1] for row in result.fetchall()}

        return {
            "mode": "LOCAL_POSTGRES",
            "local_db": self.local_db_url.split("@")[-1],   # hide credentials
            "is_online": _is_online(),
            "pending": counts.get(STATUS_PENDING, 0),
            "synced":  counts.get(STATUS_SYNCED, 0),
            "failed":  counts.get(STATUS_FAILED, 0),
        }


# ── Singleton (imported in main.py) ─────────────────────────
offline_sync_engine = OfflineSyncEngine(
    local_db_url=settings.local_database_url,
    interval=settings.offline_sync_interval,
)
