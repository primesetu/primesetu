# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import PriceRange          # closest sovereign equivalent
from app.models.sovereign import SmritiItem

router = APIRouter(prefix="/price-groups", tags=["price-group"])

@router.get("/", response_model=List[dict])
async def list_price_groups(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """List all active price ranges / groups for the store."""
    result = await db.execute(
        select(PriceRange).order_by(PriceRange.id)
    )
    rows = result.scalars().all()
    return [
        {"id": str(r.id), "name": getattr(r, "name", str(r.id)), "active": True}
        for r in rows
    ]


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_price_group(
    payload: dict,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Create a new price group — stub pending SmritiPriceGroup model."""
    return {
        "status":  "QUEUED",
        "message": "Price group model activation pending.",
        "payload": payload,
    }


@router.post("/resolve-prices")
async def resolve_prices(
    payload: dict,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Batch price resolution — returns MRP from SmritiItem."""
    item_ids: List[str] = payload.get("item_ids", [])
    if not item_ids:
        return []
    result = await db.execute(
        select(SmritiItem.sku, SmritiItem.mrp)
        .where(SmritiItem.sku.in_(item_ids))
    )
    return [
        {"sku": row.sku, "price": float(row.mrp), "source": "MRP"}
        for row in result.all()
    ]
