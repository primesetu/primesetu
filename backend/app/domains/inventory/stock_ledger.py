# ============================================================
# SMRITI-OS — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List, Any
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import Stktrnhdr, Stktrndtls

router = APIRouter(prefix="/api/v1/stock-ledger", tags=["stock-ledger"])

@router.get("/transactions")
async def list_stock_transactions(
    limit: int = 50,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Sovereign Ledger: Directly reads Shoper 9 StkTrnHdr for high-fidelity parity.
    """
    stmt = (
        select(Stktrnhdr)
        .order_by(desc(Stktrnhdr.trndt))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/transactions/{trnctrlno}")
async def get_transaction_details(
    trnctrlno: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Fetches details for a specific Shoper 9 ledger entry."""
    stmt = select(Stktrndtls).where(Stktrndtls.trnctrlno == trnctrlno)
    result = await db.execute(stmt)
    return result.scalars().all()
