# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.base import CreditNote, AdvanceDeposit, Partner
from app.core.security import get_current_user, UserContext
from pydantic import BaseModel
from typing import List, Optional
import uuid
import random
import string
from datetime import datetime, timedelta

router = APIRouter()

class CreditNoteCreate(BaseModel):
    customer_id: uuid.UUID
    original_transaction_id: Optional[uuid.UUID] = None
    amount: float
    validity_days: int = 90

class AdvanceCreate(BaseModel):
    customer_id: uuid.UUID
    amount: float
    purpose: Optional[str] = None

@router.post("/credit-notes", response_model=dict)
async def issue_credit_note(
    data: CreditNoteCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Issues a Sovereign Credit Note for returns or adjustments.
    Enforces validity periods and provides a unique verifiable token.
    """
    note_no = "CN-" + "".join(random.choices(string.digits, k=8))
    expiry = datetime.now() + timedelta(days=data.validity_days)
    
    cn = CreditNote(
        id=uuid.uuid4(),
        note_no=note_no,
        customer_id=data.customer_id,
        original_transaction_id=data.original_transaction_id,
        initial_amount=data.amount,
        balance_amount=data.amount,
        expiry_date=expiry,
        status="Active",
        store_id=current_user.store_id
    )
    db.add(cn)
    await db.commit()
    return {"status": "success", "note_no": note_no, "amount": data.amount, "expiry": expiry}

@router.get("/credit-notes/{customer_id}", response_model=List[dict])
async def get_customer_credit_notes(
    customer_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Retrieves all active credit notes for a specific customer within the store context."""
    stmt = (
        select(CreditNote)
        .where(CreditNote.customer_id == customer_id)
        .where(CreditNote.status == "Active")
        .where(CreditNote.store_id == current_user.store_id)
    )
    result = await db.execute(stmt)
    notes = result.scalars().all()
    return [{"note_no": n.note_no, "balance": float(n.balance_amount), "expiry": n.expiry_date} for n in notes]

@router.post("/advances", response_model=dict)
async def receive_advance(
    data: AdvanceCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Records an Advance Deposit from a customer (e.g., for bulk orders).
    Generates a secure receipt for the institutional ledger.
    """
    receipt_no = "ADV-" + "".join(random.choices(string.digits, k=8))
    
    adv = AdvanceDeposit(
        id=uuid.uuid4(),
        receipt_no=receipt_no,
        customer_id=data.customer_id,
        purpose=data.purpose,
        initial_amount=data.amount,
        balance_amount=data.amount,
        status="Active",
        store_id=current_user.store_id
    )
    db.add(adv)
    await db.commit()
    return {"status": "success", "receipt_no": receipt_no, "amount": data.amount}

@router.get("/advances/{customer_id}", response_model=List[dict])
async def get_customer_advances(
    customer_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Retrieves all active advances for a customer."""
    stmt = (
        select(AdvanceDeposit)
        .where(AdvanceDeposit.customer_id == customer_id)
        .where(AdvanceDeposit.status == "Active")
        .where(AdvanceDeposit.store_id == current_user.store_id)
    )
    result = await db.execute(stmt)
    advances = result.scalars().all()
    return [{"receipt_no": a.receipt_no, "balance": float(a.balance_amount), "purpose": a.purpose} for a in advances]
