# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models.base import Till, Transaction
from app.models.legacy_s9 import Tillshiftdtls as TillSession, Poscashtrn as PosCashTrn
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
    # Create a legacy shift entry
    session = TillSession(
        tilltrndt=datetime.now().date(),
        nodeid=till.code,
        shiftno="1", # Default shift
        shiftstarttime=datetime.now(),
        cashierid=data.cashier_id or current_user.user_id,
        tillid=till.code,
        shiftstatus="O", # Open
        vacompcode=current_user.store_id,
        vauid=current_user.user_id
    )
    db.add(session)
    
    await db.commit()
    return {"status": "success", "message": f"Till {till.code} opened in Shoper9"}

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
    
    # Close legacy shift
    stmt = select(TillSession).where(
        TillSession.nodeid == till.code,
        TillSession.shiftstatus == "O",
        TillSession.vacompcode == current_user.store_id
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if session:
        session.shiftstatus = "C" # Closed
        session.shiftendtime = datetime.now()
    
    await db.commit()
    return {"status": "success", "message": f"Till {till.code} closed in Shoper9"}

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
    
    # Log the lift in Shoper9 poscashtrn
    lift_trn = PosCashTrn(
        entrytype=20, # Cash Lift type code in legacy often
        ctrlno=random.randint(10000, 99999), # Should use CounterManager later
        entsrlno=1,
        docdt=datetime.now(),
        doctime=datetime.now(),
        loccurrpaidamt=lift_data.amount,
        cashierid=current_user.user_id,
        vacompcode=current_user.store_id,
        vauid=current_user.user_id
    )
    db.add(lift_trn)
    
    await db.commit()
    return {"status": "success", "amount_lifted": lift_data.amount}
