# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.base import CustomerPriceGroup
from app.schemas.price_group import (
    PriceGroupCreate, PriceGroupResponse, 
    ItemPriceResolutionRequest, ItemPriceResolutionResponse
)
from app.services.pricing import resolve_prices_batch

router = APIRouter(prefix="/price-groups", tags=["price-group"])

@router.get("/", response_model=List[PriceGroupResponse])
async def list_price_groups(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    List all active price groups for the store.
    """
    result = await db.execute(
        select(CustomerPriceGroup)
        .where(
            CustomerPriceGroup.store_id == current_user.store_id,
            CustomerPriceGroup.is_active == True
        )
        .order_by(CustomerPriceGroup.name)
    )
    return result.scalars().all()

@router.post("/", response_model=PriceGroupResponse, status_code=status.HTTP_201_CREATED)
async def create_price_group(
    payload: PriceGroupCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new price group.
    """
    # Validation: Cannot have both price_level and discount_pct
    if payload.price_level and payload.discount_pct > 0:
        raise HTTPException(
            status_code=400,
            detail="Cannot define both price_level and discount_pct simultaneously."
        )

    new_pg = CustomerPriceGroup(
        store_id=current_user.store_id,
        name=payload.name,
        code=payload.code,
        price_level=payload.price_level,
        discount_pct=payload.discount_pct,
        is_taxable=payload.is_taxable,
        is_active=True
    )
    db.add(new_pg)
    await db.commit()
    await db.refresh(new_pg)
    return new_pg

@router.post("/resolve-prices", response_model=List[ItemPriceResolutionResponse])
async def resolve_prices(
    payload: ItemPriceResolutionRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Batch price resolution for billing cart.
    """
    return await resolve_prices_batch(
        db, 
        current_user.store_id, 
        payload.item_ids, 
        payload.price_group_id
    )
