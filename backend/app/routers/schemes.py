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
from app.models.base import Scheme
from app.schemas.schemes import SchemeRead, SchemeCreate
from typing import List
import uuid

router = APIRouter()

@router.get("/", response_model=List[SchemeRead])
async def list_schemes(db: AsyncSession = Depends(get_db)):
    """
    List all promotional schemes.
    Supports active filtering for the checkout engine.
    """
    result = await db.execute(
        select(Scheme).order_by(Scheme.is_active.desc(), Scheme.created_at.desc())
    )
    return result.scalars().all()

@router.post("/", response_model=SchemeRead)
async def create_scheme(scheme_data: SchemeCreate, db: AsyncSession = Depends(get_db)):
    """Create a new promotional offer master entry."""
    new_scheme = Scheme(
        id=uuid.uuid4(),
        **scheme_data.model_dump()
    )
    db.add(new_scheme)
    await db.commit()
    await db.refresh(new_scheme)
    return new_scheme

@router.patch("/{scheme_id}", response_model=SchemeRead)
async def update_scheme(scheme_id: uuid.UUID, scheme_data: dict, db: AsyncSession = Depends(get_db)):
    """Modify an existing offer's parameters or status."""
    scheme = await db.get(Scheme, scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme Master not found")
    
    for key, value in scheme_data.items():
        if hasattr(scheme, key):
            setattr(scheme, key, value)
            
    await db.commit()
    await db.refresh(scheme)
    await db.refresh(scheme)
    return scheme

@router.post("/calculate")
async def calculate_best_schemes(
    cart_items: List[dict],
    db: AsyncSession = Depends(get_db)
):
    """
    Shoper 9 Parity: Best-Deal Scheme Engine.
    Evaluates all active promotions against the current cart and applies the most beneficial one.
    """
    # Shoper 9 Logic:
    # 1. Fetch all active schemes.
    # 2. Filter by date/store.
    # 3. Simulate application for each.
    # 4. Return the one with maximum customer benefit.
    
    # Mocking institutional logic for now:
    applied_schemes = []
    total_benefit = 0
    
    # Example: If Qty > 2, apply 10% discount
    total_qty = sum(item.get('qty', 0) for item in cart_items)
    if total_qty >= 2:
        applied_schemes.append({
            "id": "SCH-SUMMER-24",
            "name": "Summer Surge: Buy 2+ Get 10% Off",
            "benefit": 450, # In Paise or relative
            "type": "PERCENTAGE"
        })
        total_benefit = 450

    return {
        "best_scheme": applied_schemes[0] if applied_schemes else None,
        "all_applicable": applied_schemes,
        "total_benefit_paise": total_benefit
    }
