# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Domain Service: Institutional Sequencing (v1.2)
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.counters import CounterManager

class SequencingService:
    """
    Sovereign Sequencing Service.
    Handles counter resolution and bill number generation.
    """
    
    @staticmethod
    async def get_next_trn_ctrl_no(db: AsyncSession, trn_type: str = "2100") -> int:
        """
        Deterministic control number resolution using SELECT FOR UPDATE.
        """
        return await CounterManager.get_next_ctrl_no(db, trn_type)

    @staticmethod
    async def generate_bill_no(db: AsyncSession, store_id: str, trn_ctrl_no: int) -> str:
        """
        Generates a standard Smriti bill number: B-[Store]-[CtrlNo].
        """
        return f"B-{store_id}-{trn_ctrl_no}"
