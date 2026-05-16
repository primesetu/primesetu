# ============================================================
# SMRITI-OS — Reconciliation Guard
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Sync Reconciliation (v1.2)
# ============================================================

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.observability.logger import logger

class ReconciliationGuard:
    """
    Sovereign Reconciliation Guard.
    Ensures zero-drift between local ledger and cloud acknowledgement.
    """
    
    @staticmethod
    async def check_drift(db: AsyncSession, transaction_id: str) -> bool:
        """
        Validates if all packets for a specific transaction are 'done'.
        """
        query = text("""
            SELECT COUNT(*) 
            FROM shoper9.smriti_sync_queue 
            WHERE payload->>'transaction_id' = :txid 
            AND status != 'done'
        """)
        
        result = await db.execute(query, {"txid": transaction_id})
        pending_count = result.scalar()
        
        return pending_count == 0
