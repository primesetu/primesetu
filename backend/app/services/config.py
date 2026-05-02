# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/services/config.py
# (c) 2026 - All Rights Reserved
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.legacy_s9 import Sysparam, Genlookup
from typing import Any, Optional

class ConfigService:
    @staticmethod
    async def get_sysparam(db: AsyncSession, param_code: str, store_id: str) -> Optional[Any]:
        """Fetch system parameter value by code."""
        stmt = select(Sysparam).where(
            Sysparam.paramcode == param_code,
            Sysparam.vacompcode == store_id
        )
        result = await db.execute(stmt)
        param = result.scalar_one_or_none()
        
        if not param:
            return None
            
        # Return the first non-null value among boolean, intg, txt, dt, sng, cur
        if param.boolean is not None: return param.boolean
        if param.intg is not None: return param.intg
        if param.txt is not None: return param.txt
        if param.dt is not None: return param.dt
        if param.sng is not None: return param.sng
        if param.cur is not None: return float(param.cur)
        
        return None

    @staticmethod
    async def get_genlookup_value(db: AsyncSession, recid: int, code: str) -> Optional[str]:
        """Fetch general lookup description by recid and code."""
        stmt = select(Genlookup).where(
            Genlookup.recid == recid,
            Genlookup.code == code
        )
        result = await db.execute(stmt)
        lookup = result.scalar_one_or_none()
        return lookup.descr if lookup else None

    @staticmethod
    async def get_stock_out_action(db: AsyncSession, store_id: str) -> str:
        """
        Determine action when item is out of stock (Block, Warn, Ignore).
        Legacy param often: 'StockOutActionInBill'
        """
        val = await ConfigService.get_sysparam(db, "StockOutActionInBill", store_id)
        return str(val) if val else "Warn" # Default to Warn
