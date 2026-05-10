"""
tally.py — SMRITI-OS Tally Sync API Router

Exposes endpoints for:
  - Manual "Push to Tally" trigger (Day-End UI button)
  - Health check for the local Tally Gateway
  - Batch sync status overview
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_

from app.core.database import get_db
from app.models.sovereign import SmritiSaleHdr
from app.services.tally_gateway import TallyGatewayClient
from app.services.tally_sync import push_single_bill, MAX_RETRIES

router = APIRouter(prefix="/tally", tags=["Tally Sync"])


@router.get("/status")
async def tally_sync_status(db: AsyncSession = Depends(get_db)):
    """
    Returns a dashboard-ready summary of Tally sync state.
    Used by the Day-End module and the HO sync monitor.
    """
    total_synced = await db.scalar(
        select(func.count(SmritiSaleHdr.bill_no))
        .where(SmritiSaleHdr.tally_synced == True)
    )
    total_pending = await db.scalar(
        select(func.count(SmritiSaleHdr.bill_no))
        .where(
            and_(
                SmritiSaleHdr.tally_synced == False,
                SmritiSaleHdr.tally_retry_count < MAX_RETRIES,
            )
        )
    )
    total_failed = await db.scalar(
        select(func.count(SmritiSaleHdr.bill_no))
        .where(SmritiSaleHdr.tally_retry_count >= MAX_RETRIES)
    )

    return {
        "synced": total_synced or 0,
        "pending": total_pending or 0,
        "failed": total_failed or 0,
    }


@router.post("/push/{bill_no}")
async def push_bill_to_tally(
    bill_no: str,
    db: AsyncSession = Depends(get_db),
):
    """
    Manually push a single invoice to Tally.
    Called by the Day-End 'Push to Tally' button.
    """
    return await push_single_bill(bill_no, db)


@router.get("/gateway/health")
async def tally_gateway_health(gateway_url: str = "http://localhost:9000"):
    """
    Check if the local Tally Gateway is reachable.
    Useful for the store setup wizard to validate Tally connectivity.
    """
    client = TallyGatewayClient(gateway_url=gateway_url)
    alive = await client.health_check()
    return {
        "gateway_url": gateway_url,
        "status": "reachable" if alive else "unreachable",
        "message": (
            "Tally Gateway is online and accepting connections."
            if alive else
            "Tally Gateway not reachable. Ensure TallyPrime is running on this machine."
        ),
    }


@router.post("/sync/run")
async def trigger_sync_now():
    """
    Manually trigger the Tally sync batch (normally run by Celery Beat every 5 min).
    Useful for admins who need an immediate push after Day-End.
    """
    from app.services.tally_sync import run_tally_sync_async
    import asyncio

    try:
        await run_tally_sync_async()
        return {"status": "success", "message": "Tally sync cycle completed."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
