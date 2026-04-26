# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List, Dict, Optional

from app.models.base import Item, ItemPriceLevel, CustomerPriceGroup
from app.schemas.price_group import ItemPriceResolutionResponse

async def resolve_prices_batch(
    db: AsyncSession,
    store_id: UUID,
    item_ids: List[UUID],
    price_group_id: Optional[UUID] = None
) -> List[ItemPriceResolutionResponse]:
    """
    Highly optimized batch price resolution for billing cart.
    Target: < 50ms for 50 items.
    """
    # 1. Fetch Items and their MRPs
    items_q = await db.execute(
        select(Item).where(Item.id.in_(item_ids), Item.store_id == store_id)
    )
    items_map = {i.id: i for i in items_q.scalars().all()}
    
    # 2. Fetch Price Group if provided
    pg = None
    if price_group_id:
        pg_q = await db.execute(
            select(CustomerPriceGroup).where(
                CustomerPriceGroup.id == price_group_id,
                CustomerPriceGroup.store_id == store_id
            )
        )
        pg = pg_q.scalar_one_or_none()

    # 3. If Price Group has a specific price_level, fetch those prices
    level_prices_map = {}
    if pg and pg.price_level:
        prices_q = await db.execute(
            select(ItemPriceLevel).where(
                ItemPriceLevel.item_id.in_(item_ids),
                ItemPriceLevel.price_level == pg.price_level,
                ItemPriceLevel.valid_to == None
            )
        )
        level_prices_map = {p.item_id: p.price_paise for p in prices_q.scalars().all()}

    # 4. Resolve each item
    results = []
    for item_id in item_ids:
        item = items_map.get(item_id)
        if not item: continue
        
        resolved_price = item.mrp_paise
        source = "mrp"
        
        if pg:
            # Priority 1: Price Level
            if pg.price_level and item_id in level_prices_map:
                resolved_price = level_prices_map[item_id]
                source = f"price_level:{pg.price_level}"
            # Priority 2: Discount % off MRP
            elif pg.discount_pct and pg.discount_pct > 0:
                discount_paise = int(item.mrp_paise * float(pg.discount_pct) / 100)
                resolved_price = item.mrp_paise - discount_paise
                source = f"discount_pct:{pg.discount_pct}%"
        
        results.append(ItemPriceResolutionResponse(
            item_id=item_id,
            resolved_price_paise=resolved_price,
            price_source=source
        ))
        
    return results
