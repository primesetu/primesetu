# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.base import Till, Transaction
from app.schemas.tills import TillCreate, TillResponse, TillUpdateStatus, CashLiftCreate
from app.core.security import get_current_user, UserContext
from typing import List
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/", response_model=List[TillResponse])
async def list_tills(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    stmt = select(Till).where(Till.store_id == current_user.store_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=TillResponse)
async def create_till(
    till_data: TillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    new_till = Till(
        id=uuid.uuid4(),
        **till_data.dict()
    )
    db.add(new_till)
    await db.commit()
    await db.refresh(new_till)
    return new_till

@router.post("/{till_id}/open")
async def open_till(
    till_id: uuid.UUID,
    data: TillUpdateStatus,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    stmt = select(Till).where(Till.id == till_id, Till.store_id == current_user.store_id)
    till = (await db.execute(stmt)).scalar_one_or_none()
    
    if not till:
        raise HTTPException(status_code=404, detail="Till not found")
    
    till.status = "Open"
    till.current_cashier_id = data.cashier_id or current_user.user_id
    till.last_opening_at = datetime.now()
    
    await db.commit()
    return {"status": "success", "message": f"Till {till.code} opened"}

@router.post("/{till_id}/close")
async def close_till(
    till_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    stmt = select(Till).where(Till.id == till_id, Till.store_id == current_user.store_id)
    till = (await db.execute(stmt)).scalar_one_or_none()
    
    if not till:
        raise HTTPException(status_code=404, detail="Till not found")
    
    till.status = "Closed"
    till.current_cashier_id = None
    till.last_closing_at = datetime.now()
    till.cash_collected = 0.0 # Reset for next session
    
    await db.commit()
    return {"status": "success", "message": f"Till {till.code} closed"}

@router.post("/{till_id}/lift")
async def cash_lift(
    till_id: uuid.UUID,
    lift_data: CashLiftCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    stmt = select(Till).where(Till.id == till_id, Till.store_id == current_user.store_id)
    till = (await db.execute(stmt)).scalar_one_or_none()
    
    if not till:
        raise HTTPException(status_code=404, detail="Till not found")
    
    if till.cash_collected < lift_data.amount:
        raise HTTPException(status_code=400, detail="Insufficient cash in till for lift")
    
    till.cash_collected -= lift_data.amount
    # Log the lift in a separate Audit table if needed
    
    await db.commit()
    return {"status": "success", "amount_lifted": lift_data.amount, "remaining_cash": till.cash_collected}
