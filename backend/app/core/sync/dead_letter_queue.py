# ============================================================
# SMRITI-OS — Dead-Letter Queue Logic
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Sync DLQ (v1.2)
# ============================================================

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.observability.logger import logger

class DeadLetterQueue:
    """
    Sovereign Dead-Letter Queue Handler.
    Handles isolation and manual audit pathing for poisoned packets.
    """
    
    @staticmethod
    async def isolate_packet(db: AsyncSession, packet_id: int, reason: str):
        """
        Explicitly isolates a packet from the main replay loop.
        """
        await db.execute(
            text("UPDATE shoper9.smriti_sync_queue SET status = 'dead_letter', last_error = :reason WHERE id = :id"),
            {"id": packet_id, "reason": reason}
        )
        
        logger.log('ERROR', f"Packet ISOLATED to DLQ: ID {packet_id}", {
            "module": "SYNC",
            "workflow": "DLQ",
            "packet_id": packet_id,
            "reason": reason
        })
