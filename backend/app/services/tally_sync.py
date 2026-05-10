"""
tally_sync.py — SMRITI-OS Tally Sync Background Task

Polls SmritiSaleHdr for unsynced rows and pushes them to the
Tally Gateway via tally_xml.py + tally_gateway.py.

Delivery model:
  - Single-store: Gateway is localhost:9000 on the store PC.
  - Multi-store:  Gateway URL is fetched per store from SmritiParam
                  (param_code = 'TALLY_GATEWAY_URL').
                  The store-side relay accepts POST from cloud and
                  forwards to its own localhost:9000.

Retry policy:
  - On failure, tally_retry_count is incremented.
  - After MAX_RETRIES, row is skipped until manually re-queued.
  - Exponential backoff is handled by Celery Beat schedule.

Usage (Celery Beat config):
    CELERYBEAT_SCHEDULE = {
        'tally-sync': {
            'task': 'app.tasks.tally_sync.run_tally_sync',
            'schedule': crontab(minute='*/5'),   # every 5 minutes
        },
    }
"""

import asyncio
from datetime import datetime
from typing import Optional

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session        # sync-safe factory
from app.models.sovereign import SmritiSaleHdr, SmritiSaleDtl
from app.services.tally_xml import serialize_sales_voucher
from app.services.tally_gateway import TallyGatewayClient

MAX_RETRIES = 5
DEFAULT_GATEWAY_URL = "http://localhost:9000"


# ── Per-store gateway URL lookup ─────────────────────────────────────────────

async def _get_gateway_url(db: AsyncSession, store_id: Optional[str]) -> str:
    """
    Look up TALLY_GATEWAY_URL from SmritiParam for this store.
    Falls back to DEFAULT_GATEWAY_URL if not configured.
    In multi-store mode this URL points to the store-side relay.
    """
    try:
        from app.models.sovereign import SmritiParam
        param_code = f"TALLY_GATEWAY_URL_{store_id}" if store_id else "TALLY_GATEWAY_URL"
        res = await db.execute(
            select(SmritiParam.value_txt).where(SmritiParam.param_code == param_code)
        )
        url = res.scalar_one_or_none()
        return url or DEFAULT_GATEWAY_URL
    except Exception:
        return DEFAULT_GATEWAY_URL


# ── Main sync loop ────────────────────────────────────────────────────────────

async def run_tally_sync_async():
    """
    Async implementation.
    Fetches all unsynced SmritiSaleHdr rows (up to a safe batch size),
    serializes each, pushes to Tally, and stamps the result.
    """
    BATCH_SIZE = 50
    print("[TALLY SYNC] Starting sync cycle...")

    async with get_db_session() as db:
        # Fetch unsynced rows below retry limit
        stmt = (
            select(SmritiSaleHdr)
            .where(
                and_(
                    SmritiSaleHdr.tally_synced == False,
                    SmritiSaleHdr.tally_retry_count < MAX_RETRIES,
                )
            )
            .order_by(SmritiSaleHdr.bill_date.asc())
            .limit(BATCH_SIZE)
        )
        result = await db.execute(stmt)
        headers = result.scalars().all()

        if not headers:
            print("[TALLY SYNC] No pending invoices. Cycle complete.")
            return

        print(f"[TALLY SYNC] Processing {len(headers)} invoices...")

        for hdr in headers:
            try:
                # Fetch details for this bill
                dtl_res = await db.execute(
                    select(SmritiSaleDtl).where(SmritiSaleDtl.bill_no == hdr.bill_no)
                )
                details = dtl_res.scalars().all()

                # Determine gateway URL (multi-store aware)
                gateway_url = await _get_gateway_url(db, getattr(hdr, "store_id", None))
                client = TallyGatewayClient(gateway_url=gateway_url)

                # Serialize
                xml_payload = serialize_sales_voucher(
                    header=hdr,
                    details=details,
                    customer_name=hdr.cust_code or "Cash Sales",
                )

                # Push
                gateway_result = await client.push(xml_payload)

                if gateway_result.success:
                    hdr.tally_synced = True
                    hdr.tally_synced_at = datetime.utcnow()
                    print(f"[TALLY SYNC] ✓ {hdr.bill_no} synced — LineID: {gateway_result.lineid}")
                else:
                    hdr.tally_retry_count += 1
                    print(
                        f"[TALLY SYNC] ✗ {hdr.bill_no} failed "
                        f"(attempt {hdr.tally_retry_count}/{MAX_RETRIES}): "
                        f"{gateway_result.error_message}"
                    )

            except Exception as exc:
                hdr.tally_retry_count += 1
                print(f"[TALLY SYNC] EXCEPTION on {hdr.bill_no}: {exc}")

        await db.commit()
        print("[TALLY SYNC] Cycle committed.")


# ── Public entrypoints ────────────────────────────────────────────────────────

def run_tally_sync():
    """Synchronous wrapper — Celery task entrypoint."""
    asyncio.run(run_tally_sync_async())


# ── Manual trigger for a single bill ─────────────────────────────────────────

async def push_single_bill(bill_no: str, db: AsyncSession) -> dict:
    """
    Used by the Day-End 'Push to Tally' button.
    Returns a dict the API router can return directly.
    """
    hdr_res = await db.execute(
        select(SmritiSaleHdr).where(SmritiSaleHdr.bill_no == bill_no)
    )
    hdr = hdr_res.scalar_one_or_none()
    if not hdr:
        return {"status": "error", "message": f"Invoice {bill_no} not found."}

    dtl_res = await db.execute(
        select(SmritiSaleDtl).where(SmritiSaleDtl.bill_no == bill_no)
    )
    details = dtl_res.scalars().all()

    gateway_url = await _get_gateway_url(db, getattr(hdr, "store_id", None))
    client = TallyGatewayClient(gateway_url=gateway_url)

    xml_payload = serialize_sales_voucher(
        header=hdr,
        details=details,
        customer_name=hdr.cust_code or "Cash Sales",
    )

    result = await client.push(xml_payload)

    if result.success:
        hdr.tally_synced = True
        hdr.tally_synced_at = datetime.utcnow()
        await db.commit()
        return {"status": "success", "message": f"Bill {bill_no} pushed to Tally.", "lineid": result.lineid}
    else:
        hdr.tally_retry_count += 1
        await db.commit()
        return {"status": "error", "message": result.error_message}
