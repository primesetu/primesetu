/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func
from app.core.database import get_db
from app.models.base import Partner, Item, ItemStock, GeneralLookup, SizeGroup
from app.core.auth import get_current_user
from typing import List, Optional
import uuid

router = APIRouter()

@router.get("/universal-search")
async def universal_search(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Shoper 9 Parity Universal Search.
    Searches items by code, name, brand, or style code.
    """
    query = q.strip().lower()
    store_id = current_user.store_id

    # Search in Items
    items_result = await db.execute(
        select(Item).where(
            and_(
                Item.store_id == store_id,
                or_(
                    func.lower(Item.item_code).like(f"%{query}%"),
                    func.lower(Item.item_name).like(f"%{query}%"),
                    func.lower(Item.brand).like(f"%{query}%")
                )
            )
        ).limit(10)
    )
    items = items_result.scalars().all()

    # Search in Partners (Customer/Vendor)
    partners_result = await db.execute(
        select(Partner).where(
            or_(
                func.lower(Partner.name).like(f"%{query}%"),
                func.lower(Partner.mobile).like(f"%{query}%"),
                func.lower(Partner.code).like(f"%{query}%")
            )
        ).limit(10)
    )
    partners = partners_result.scalars().all()

    return {
        "items": items,
        "partners": partners
    }

@router.get("/partners")
async def list_partners(
    type: Optional[str] = None,
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """List and filter institutional partners (Customers, Vendors, Salespersons)."""
    stmt = select(Partner)
    filters = []
    
    if type:
        filters.append(Partner.type == type)
    if q:
        filters.append(or_(
            func.lower(Partner.name).like(f"%{q.lower()}%"),
            func.lower(Partner.mobile).like(f"%{q.lower()}%")
        ))
        
    if filters:
        stmt = stmt.where(and_(*filters))
        
    result = await db.execute(stmt.limit(50))
    return result.scalars().all()

@router.get("/partners/{partner_id}/matrix")
async def get_partner_matrix(
    partner_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Shoper 9 Style Matrix Resolution.
    Returns size/color stock and pricing grid for a specific style (mapped via partner context).
    """
    # This is a simplified institutional resolution logic
    # In production, this would resolve via StyleCode -> Item List -> Stock
    
    result = await db.execute(
        select(ItemStock, Item).join(Item).where(
            and_(
                Item.store_id == current_user.store_id,
                Item.supplier_id == partner_id
            )
        )
    )
    stocks = result.all()
    
    matrix = {}
    for s, i in stocks:
        color = s.colour or "DEFAULT"
        size = s.size or "UNI"
        if color not in matrix: matrix[color] = {}
        matrix[color][size] = {
            "id": str(s.id),
            "stock": s.qty_on_hand,
            "price": i.mrp_paise,
            "code": i.item_code
        }
        
    return {
        "style_code": "RESOLVED-STYLE",
        "name": "Institutional Collection",
        "colors": list(matrix.keys()),
        "sizes": list(set([sz for c in matrix.values() for sz in c.keys()])),
        "matrix": matrix
    }

@router.get("/lookups")
async def get_lookups(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch institutional lookups (Colors, Sizes, Seasons, etc)."""
    stmt = select(GeneralLookup).where(
        or_(
            GeneralLookup.store_id == current_user.store_id,
            GeneralLookup.store_id == None
        )
    )
    if category:
        stmt = stmt.where(GeneralLookup.category == category)
        
    result = await db.execute(stmt.order_by(GeneralLookup.sort_order))
    return result.scalars().all()

@router.post("/price-revisions/bulk")
async def bulk_price_revision(
    revisions: List[dict],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Sovereign Price Surge Engine.
    Bulk updates MRP/Prices for institutional SKU groups.
    """
    count = 0
    for rev in revisions:
        item_id = rev.get('item_id')
        new_price = rev.get('new_price_paise')
        if not item_id or not new_price: continue
        
        item = await db.get(Item, item_id)
        if item and item.store_id == current_user.store_id:
            item.mrp_paise = new_price
            count += 1
            
    await db.commit()
    return {"status": "SUCCESS", "updated_count": count}
