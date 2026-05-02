
# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Logic: Institutional Counter Management
# Mapping: shoper9.genlookup (recid 101)
# ============================================================

from sqlalchemy import text, update
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException

class CounterManager:
    """
    Sovereign Counter Manager for Shoper9 compatibility.
    Manages recid 101 in genlookup for transaction IDs.
    """
    
    @staticmethod
    async def get_next_ctrl_no(db: AsyncSession, code: str) -> int:
        """
        Fetches and increments the next control number for a given trntype code.
        Thread-safe within the current transaction.
        """
        # 1. Fetch current number with ROW LOCK
        query = text("""
            SELECT number 
            FROM shoper9.genlookup 
            WHERE recid = 101 AND code = :code
            FOR UPDATE
        """)
        result = await db.execute(query, {"code": code})
        row = result.first()
        
        if not row:
            raise HTTPException(
                status_code=500, 
                detail=f"Institutional counter for '{code}' not found in genlookup (recid 101)"
            )
            
        current_no = int(row.number)
        next_no = current_no + 1
        
        # 2. Update to next number
        update_query = text("""
            UPDATE shoper9.genlookup 
            SET number = :next_no 
            WHERE recid = 101 AND code = :code
        """)
        await db.execute(update_query, {"next_no": next_no, "code": code})
        
        return next_no

    @staticmethod
    async def peek_ctrl_no(db: AsyncSession, code: str) -> int:
        """Just peek at the current number without incrementing."""
        query = text("SELECT number FROM shoper9.genlookup WHERE recid = 101 AND code = :code")
        result = await db.execute(query, {"code": code})
        row = result.first()
        return int(row.number) if row else 0
