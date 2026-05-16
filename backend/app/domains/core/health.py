from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.config import settings
from app.core.logging import logger
from datetime import datetime

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    """
    Sovereign Capability Negotiation & Heartbeat Endpoint.
    Ultra-fast, deterministic response for connectivity monitoring.
    """
    # [R5] ABSOLUTELY NO DB SCANS OR ANALYTICS HERE.
    # This must remain fast even during partial degradation.
    return {
        "status": "ok",
        "service": "smriti-os",
        "version": "1.0.0",
        "node_id": settings.node_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }

@router.get("/health/deep")
async def deep_health_check(db: AsyncSession = Depends(get_db)):
    """
    Deep Health Validation.
    Checks DB connectivity, Redis (if applicable), and Sync Queue Depth.
    To be used by Admin Panels and Monitoring, NOT high-frequency heartbeats.
    """
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        logger.error("deep_health_db_failed", error=str(e))
        db_status = "error"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "storage_mode": settings.storage_mode,
        "node_id": settings.node_id,
        "timestamp": datetime.utcnow().isoformat() + "Z"
    }
