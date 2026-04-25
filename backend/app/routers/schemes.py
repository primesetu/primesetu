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
    return scheme
