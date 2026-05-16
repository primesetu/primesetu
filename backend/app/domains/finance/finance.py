from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime
from uuid import UUID

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.finance import TillSession, PosCashTrn, TillHardware
from app.schemas.finance import (
    TillSessionCreate,
    TillSessionResponse,
    PosCashTrnCreate,
    PosCashTrnResponse,
    TillHardwareCreate,
    TillHardwareResponse
)

router = APIRouter(prefix="/api/v1/finance", tags=["Finance & Till Management"])

@router.get("/till", response_model=list[dict])
async def list_tills(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Retrieve all hardware tills and their current session status
    hw_result = await db.execute(
        select(TillHardware).where(TillHardware.store_id == current_user.store_id)
    )
    hardware_tills = hw_result.scalars().all()
    
    response = []
    for hw in hardware_tills:
        # Check if there is an active session
        session_res = await db.execute(
            select(TillSession).where(
                TillSession.till_hardware_id == hw.id,
                TillSession.status == "OPEN"
            )
        )
        active_session = session_res.scalar_one_or_none()
        
        response.append({
            "id": str(hw.id),
            "name": hw.name,
            "code": hw.code,
            "status": "Open" if active_session else "Closed",
            "cash_collected": active_session.opening_float if active_session else 0, # Mock logic, should include net movement
            "current_cashier_id": str(active_session.opened_by) if active_session else None,
            "last_opening_at": active_session.opened_at.isoformat() if active_session else None
        })
        
    return response

@router.post("/till", response_model=TillHardwareResponse)
async def create_till_hardware(
    payload: TillHardwareCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    new_hw = TillHardware(
        store_id=current_user.store_id,
        name=payload.name,
        code=payload.code
    )
    db.add(new_hw)
    await db.commit()
    await db.refresh(new_hw)
    return new_hw

@router.post("/till/{id}/open", response_model=TillSessionResponse)
async def open_till_session(
    id: UUID,
    payload: dict, # UI payload might be empty or have cashier_id
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Verify hardware exists
    hw_res = await db.execute(select(TillHardware).where(TillHardware.id == id, TillHardware.store_id == current_user.store_id))
    hw = hw_res.scalar_one_or_none()
    if not hw:
        raise HTTPException(status_code=404, detail="Till Hardware not found")

    # Check if a till session is already open for this hardware
    result = await db.execute(
        select(TillSession).where(
            TillSession.till_hardware_id == id,
            TillSession.status == "OPEN"
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="A Till is already OPEN for this node.")

    new_session = TillSession(
        store_id=current_user.store_id,
        till_hardware_id=id,
        opened_by=current_user.id,
        opening_float=payload.get("opening_float", 0),
        status="OPEN"
    )
    db.add(new_session)
    await db.commit()
    await db.refresh(new_session)
    return new_session

@router.post("/till/{id}/close", response_model=TillSessionResponse)
async def close_till_session(
    id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Retrieve the open till session for this hardware
    result = await db.execute(
        select(TillSession).where(
            TillSession.till_hardware_id == id,
            TillSession.store_id == current_user.store_id,
            TillSession.status == "OPEN"
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=400, detail="Till session not found or already closed.")

    # Calculate actuals (Mock logic: Opening float + Income - Expenses)
    cash_result = await db.execute(
        select(PosCashTrn).where(PosCashTrn.till_session_id == session.id)
    )
    trns = cash_result.scalars().all()
    
    net_movement = 0
    for t in trns:
        if t.trn_type in ("FLOAT_ADD", "INCOME"):
            net_movement += t.amount
        elif t.trn_type in ("SAFE_DROP", "EXPENSE"):
            net_movement -= t.amount
            
    # For now, expected closing = opening + net_movement (we would add Sales here)
    expected_closing = session.opening_float + net_movement
    
    session.status = "CLOSED"
    session.closed_by = current_user.id
    session.closed_at = datetime.utcnow()
    session.expected_closing = expected_closing
    
    # Ideally actual_closing is passed in the request by the cashier blindly counting
    session.actual_closing = expected_closing 
    session.variance = 0
    session.z_read_data = {
        "sales_cash": 0,
        "sales_card": 0,
        "net_movement": net_movement
    }

    await db.commit()
    await db.refresh(session)
    return session

@router.post("/till/{id}/lift", response_model=PosCashTrnResponse)
async def lift_cash(
    id: UUID,
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Safe Drop (Lift)
    result = await db.execute(
        select(TillSession).where(
            TillSession.till_hardware_id == id,
            TillSession.store_id == current_user.store_id,
            TillSession.status == "OPEN"
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=400, detail="Till is closed.")

    amount = payload.get("amount", 0)
    trn = PosCashTrn(
        store_id=current_user.store_id,
        till_session_id=session.id,
        user_id=current_user.id,
        trn_type="SAFE_DROP",
        amount=amount,
        remarks=payload.get("remarks", "Cash Lift")
    )
    db.add(trn)
    await db.commit()
    await db.refresh(trn)
    return trn
