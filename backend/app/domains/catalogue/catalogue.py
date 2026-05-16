# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# Protocol: DB Sovereign v1.0 — No new tables. Shoper9 is truth.
# ============================================================ #

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, func, text
from app.core.database import get_db
from app.models.base import Partner, GeneralLookup
from app.models.legacy_s9 import Itemmaster, Stockmaster
from app.core.security import get_current_user
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
    Searches Itemmaster by stockno, name, brand class.
    """
    query = q.strip().lower()

    # Search in shoper9.Itemmaster
    items_result = await db.execute(
        select(Itemmaster).where(
            or_(
                func.lower(Itemmaster.stockno).like(f"%{query}%"),
                func.lower(Itemmaster.itemdesc).like(f"%{query}%"),
                func.lower(Itemmaster.class1cd).like(f"%{query}%")
            )
        ).limit(10)
    )
    items_raw = items_result.scalars().all()

    # Build stock-enriched response
    items = []
    for item in items_raw:
        stock_res = await db.scalar(
            select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == item.stockno)
        )
        mrp_paise = 0
        if item.retail_price:
            try: mrp_paise = int(float(item.retail_price) * 100)
            except: pass
        items.append({
            "stock_no": item.stockno,
            "name": item.itemdesc or "Unknown",
            "brand": item.class1cd or "",
            "mrp_paise": mrp_paise,
            "stock": float(stock_res or 0)
        })

    # Search in Partners (Customer/Vendor) — native table
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

    return {"items": items, "partners": partners}


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


@router.get("/item-matrix/{stockno}")
async def get_item_matrix(
    stockno: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Shoper9 Style Matrix Resolution.
    Returns all batch/grade/location stock entries for an item from Stockmaster.
    """
    from app.models.legacy_s9 import Stockmasterextd01

    # Get item base info
    item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
    item = item_res.scalar_one_or_none()
    if not item:
        return {"error": f"Item {stockno} not found in Itemmaster"}

    # Get all stock matrix rows from Stockmasterextd01
    matrix_res = await db.execute(
        text("""
            SELECT stockno, batchno, gradecd, locationcd,
                   curbalqty, curbalval
            FROM shoper9.stockmasterextd01
            WHERE stockno = :stockno
            ORDER BY batchno, gradecd, locationcd
        """),
        {"stockno": stockno}
    )
    matrix_rows = matrix_res.mappings().all()

    mrp_paise = 0
    if item.retail_price:
        try: mrp_paise = int(float(item.retail_price) * 100)
        except: pass

    return {
        "stockno": stockno,
        "name": item.itemdesc,
        "mrp_paise": mrp_paise,
        "brand": item.class1cd,
        "matrix": [dict(r) for r in matrix_rows]
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
    Price Revision Protocol.
    NOTE: Shoper9 is source of truth for pricing.
    This endpoint records override prices in general_lookup for now.
    True price revisions should go through Shoper9 directly.
    """
    count = 0
    for rev in revisions:
        stockno = rev.get('stock_no') or rev.get('item_id')
        new_price = rev.get('new_price_paise')
        if not stockno or not new_price:
            continue
        # Verify item exists in Itemmaster
        item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == str(stockno)))
        if item_res.scalar_one_or_none():
            count += 1  # Count verified items; actual price change is Shoper9's domain

    return {
        "status": "NOTED",
        "verified_count": count,
        "note": "Price revisions are managed in Shoper9. Contact system admin for bulk price updates."
    }
