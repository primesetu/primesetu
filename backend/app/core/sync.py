# ============================================================
# SMRITI-OS — Sovereign Sync Protocol
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================
"""
sync.py — Authoritative Sync Facade

This module is the SINGLE public interface for all data synchronisation
in Smriti-OS. Callers (billing, warehouse, inventory routers) should
never import offline_sync_engine directly.

Architecture: Async Outbox Pattern
  [Local Write] → [enqueue()] → [smriti_sync_queue table]
                                        ↓ (background, every 30s)
                              [OfflineSyncEngine._flush_queue()]
                                        ↓
                              [Supabase REST API (upsert/delete)]

Key properties:
  • Billing is ZERO-LATENCY — writes to local PG complete instantly.
  • Network failures cause retry with exponential backoff (30s → 2m → 5m → 15m → 60m).
  • SKIP LOCKED prevents double-processing if flush loop restarts mid-flight.
  • ON-DEMAND flush available via POST /api/v1/offline/flush.

Usage in a router:
    from app.core.sync import enqueue, flush_now

    # After a local write:
    await enqueue("smriti_sale_hdr", "INSERT", sale_dict)

    # To force an immediate sync (e.g. manager-triggered):
    synced, failed = await flush_now()
"""

import logging
from typing import Tuple

logger = logging.getLogger("smriti.sync")


async def enqueue(table_name: str, operation: str, record: dict, pk_column: str = "id") -> None:
    """
    Enqueue a local write for eventual cloud sync.

    This is a non-blocking, fire-and-forget call. It writes a single row
    into the local smriti_sync_queue table. The background OfflineSyncEngine
    will pick it up and push it to Supabase within the next sync interval.

    Args:
        table_name: Supabase target table (e.g. 'smriti_sale_hdr').
        operation:  'INSERT', 'UPDATE', or 'DELETE'.
        record:     Full row dict. For DELETE, must include pk_column key.
        pk_column:  Primary key column name (default 'id').

    Example:
        await enqueue("smriti_sale_hdr", "INSERT", {"id": 42, "total": 1500, ...})
        await enqueue("smriti_item", "UPDATE", {"sku": "ABC", "price": 999}, pk_column="sku")
        await enqueue("smriti_item", "DELETE", {"sku": "ABC"}, pk_column="sku")
    """
    from app.core.config import settings
    if settings.storage_mode != "LOCAL_POSTGRES":
        # In CLOUD or SOVEREIGN mode, data goes directly to Supabase —
        # no local queue needed.
        return

    try:
        from app.services.offline_sync import offline_sync_engine
        await offline_sync_engine.enqueue(table_name, operation, record, pk_column)
        logger.debug(f"[Sync] Enqueued {operation} → {table_name} (pk={pk_column})")
    except Exception as exc:
        # CRITICAL: Never let sync failure block the billing write path.
        # The local PG write already completed — this is just the cloud relay.
        logger.error(
            f"[Sync] Failed to enqueue {operation}→{table_name}: {exc}. "
            "Row is safe locally. Will not retry queue entry."
        )


async def flush_now() -> Tuple[int, int]:
    """
    On-demand flush: immediately push all PENDING rows to Supabase.

    Returns (synced_count, failed_count) for the caller to report.
    Used by the HO /sync endpoint and the /offline/flush API.
    """
    from app.core.config import settings
    if settings.storage_mode != "LOCAL_POSTGRES":
        return (0, 0)

    from app.services.offline_sync import offline_sync_engine

    # Get counts before flush to compute delta
    before = await offline_sync_engine.get_status()
    pending_before = before.get("pending", 0)

    await offline_sync_engine._flush_queue()

    after = await offline_sync_engine.get_status()
    synced_delta = after.get("synced", 0) - before.get("synced", 0)
    failed_now = after.get("failed", 0)

    logger.info(f"[Sync] On-demand flush complete: synced={synced_delta}, failed={failed_now}")
    return (max(synced_delta, 0), failed_now)


# ---------------------------------------------------------------------------
# Legacy compatibility shim — flush_pending_packets used to be the only
# function here (MOCK). Old callers (e.g. ho.py) that import this are safe.
# ---------------------------------------------------------------------------
async def flush_pending_packets(*args, **kwargs) -> int:
    """
    [DEPRECATED] Legacy shim — delegates to the real OfflineSyncEngine.

    The old MOCK version simply set status='SYNCED' in-process without
    actually reaching Supabase. This version calls the real flush path.

    Kept for backward compatibility. New code should call flush_now().
    """
    synced, _ = await flush_now()
    return synced
