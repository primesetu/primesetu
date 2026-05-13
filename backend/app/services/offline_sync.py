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
    id           BIGSERIAL PRIMARY KEY,
    table_name   TEXT        NOT NULL,
    operation    TEXT        NOT NULL,   -- INSERT | UPDATE | DELETE
    record_json  JSONB       NOT NULL,   -- Changed row as JSONB (native Postgres)
    pk_column    TEXT        NOT NULL DEFAULT 'id', -- Primary key column name for DELETE ops
    status       TEXT        NOT NULL DEFAULT 'PENDING',
    retry_count  INT         NOT NULL DEFAULT 0,
    next_retry   TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Exponential backoff gate
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    synced_at    TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON smriti_sync_queue (status, next_retry, id);
"""

# Exponential backoff delays per retry attempt (seconds)
RETRY_BACKOFF_SECS = [0, 30, 120, 300, 900]  # up to 15 min on 4th retry


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
    async def enqueue(self, table_name: str, operation: str, record: dict, pk_column: str = "id"):
        """
        Call after any local PG write to register it for cloud sync.

        Args:
            table_name: Target Supabase table name.
            operation:  INSERT | UPDATE | DELETE
            record:     Full row dict (for DELETE, must include pk_column value).
            pk_column:  Primary key column name for DELETE URL construction.

        Example:
            await offline_sync.enqueue("smriti_sale_hdr", "INSERT", sale_dict)
            await offline_sync.enqueue("smriti_item", "DELETE", {"sku": "XYZ"}, pk_column="sku")
        """
        async with self._local_session() as session:
            await session.execute(
                text("""
                    INSERT INTO smriti_sync_queue (table_name, operation, record_json, pk_column)
                    VALUES (:tbl, :op, CAST(:rec AS JSONB), :pk_col)
                """),
                {
                    "tbl": table_name,
                    "op": operation,
                    "rec": json.dumps(record, default=str),
                    "pk_col": pk_column,
                }
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
        """
        Fetch PENDING rows with FOR UPDATE SKIP LOCKED so that if two flush
        cycles ever run concurrently (e.g. after a crash-restart overlap) they
        never double-process the same row. The lock is held only for the
        duration of the status update within the same transaction.
        """
        async with self._local_session() as session:
            # SKIP LOCKED: rows being processed by another session are skipped,
            # preventing duplicate PK violations on the Supabase upsert.
            result = await session.execute(
                text("""
                    SELECT id, table_name, operation, record_json, pk_column
                    FROM smriti_sync_queue
                    WHERE status = 'PENDING'
                      AND retry_count < 5
                      AND next_retry <= NOW()
                    ORDER BY id
                    LIMIT 100
                    FOR UPDATE SKIP LOCKED
                """)
            )
            rows = result.fetchall()

            if not rows:
                await session.rollback()
                return

            # Mark all selected rows as IN_PROGRESS within the same transaction
            # so concurrent flusher sessions see them as locked.
            ids = [r[0] for r in rows]
            await session.execute(
                text("UPDATE smriti_sync_queue SET status='IN_PROGRESS' WHERE id = ANY(:ids)"),
                {"ids": ids}
            )
            await session.commit()

        logger.info(f"[OfflineSync] Flushing {len(rows)} records to Supabase...")

        async with httpx.AsyncClient(timeout=15) as client:
            for row in rows:
                row_id, table, operation, record, pk_column = row
                record_dict = record if isinstance(record, dict) else json.loads(record)

                try:
                    url = f"{self._cloud_base}/rest/v1/{table}"

                    if operation in ("INSERT", "UPDATE"):
                        # Supabase PostgREST: Prefer merge-duplicates → safe upsert
                        resp = await client.post(url, headers=self._cloud_headers, json=record_dict)
                    elif operation == "DELETE":
                        # Use the registered pk_column (not a guess) for the filter
                        pk_val = record_dict.get(pk_column)
                        if pk_val is None:
                            logger.warning(
                                f"[OfflineSync] DELETE row {row_id}: pk_column '{pk_column}' "
                                f"not found in record — skipping to avoid full-table delete."
                            )
                            await self._set_status(row_id, STATUS_FAILED, current_retry=0)
                            continue
                        resp = await client.delete(
                            f"{url}?{pk_column}=eq.{pk_val}",
                            headers=self._cloud_headers
                        )
                    else:
                        logger.warning(f"[OfflineSync] Unknown operation '{operation}' for row {row_id}, skipping.")
                        await self._set_status(row_id, STATUS_FAILED, current_retry=0)
                        continue

                    ok = resp.status_code in (200, 201, 204)
                    await self._set_status(row_id, STATUS_SYNCED if ok else STATUS_FAILED)

                    if ok:
                        logger.debug(f"[OfflineSync] ✓ {operation} → {table} (queue_id={row_id})")
                    else:
                        logger.warning(
                            f"[OfflineSync] ✗ {operation} → {table} "
                            f"HTTP {resp.status_code}: {resp.text[:120]}"
                        )

                except Exception as e:
                    logger.error(f"[OfflineSync] Exception queue_id={row_id}: {e}")
                    await self._set_status(row_id, STATUS_FAILED)

    async def _set_status(self, row_id: int, status: str, current_retry: int = -1):
        """Update row status with exponential backoff on failure."""
        async with self._local_session() as session:
            if status == STATUS_SYNCED:
                await session.execute(
                    text("""
                        UPDATE smriti_sync_queue
                        SET status='SYNCED', synced_at=NOW()
                        WHERE id=:id
                    """),
                    {"id": row_id}
                )
            else:
                # Compute next_retry with exponential backoff
                backoff_sql = (
                    "NOW() + INTERVAL '" +
                    " seconds' * LEAST(retry_count, 4) * 60"
                )
                await session.execute(
                    text(f"""
                        UPDATE smriti_sync_queue
                        SET status='PENDING',
                            retry_count = retry_count + 1,
                            next_retry  = CASE
                                WHEN retry_count = 0 THEN NOW() + INTERVAL '30 seconds'
                                WHEN retry_count = 1 THEN NOW() + INTERVAL '2 minutes'
                                WHEN retry_count = 2 THEN NOW() + INTERVAL '5 minutes'
                                WHEN retry_count = 3 THEN NOW() + INTERVAL '15 minutes'
                                ELSE NOW() + INTERVAL '60 minutes'
                            END
                        WHERE id=:id
                    """),
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
