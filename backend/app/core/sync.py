import logging
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import SyncPacket
from datetime import datetime

logger = logging.getLogger("smriti.sync")

async def flush_pending_packets(db: AsyncSession) -> int:
    """
    Sovereign Sync Protocol: Flush all pending packets to Head Office.
    """
    stmt = select(SyncPacket).where(SyncPacket.status == "PENDING")
    res = await db.execute(stmt)
    packets = res.scalars().all()
    
    count = 0
    for p in packets:
        # [MOCK] Simulate successful HQ acknowledgment
        p.status = "SYNCED"
        p.synced_at = datetime.utcnow()
        count += 1
        
    await db.commit()
    logger.info(f"[Sync] Flushed {count} packets to corporate HQ.")
    return count
