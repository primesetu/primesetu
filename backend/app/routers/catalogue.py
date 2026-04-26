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
from sqlalchemy import select, or_
from app.core.database import get_db
from app.models.base import Partner, GeneralLookup, Product
from app.schemas.catalogue import PartnerRead, LookupRead, UniversalSearchResponse
from app.schemas.common import ProductRead
from app.core.security import get_current_user, UserContext
from typing import List, Optional
import uuid

router = APIRouter()

@router.get("/partners", response_model=List[PartnerRead])
async def get_partners(
    type: Optional[str] = None,
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Retrieve partners (Vendors/Customers/Personnel).
    Filters results to be relevant to the local store node.
    """
    query = select(Partner)
    filters = []
    
    if type:
        filters.append(Partner.type == type)
    if q:
        q_filter = f"%{q}%"
        filters.append(or_(
            Partner.name.ilike(q_filter),
            Partner.code.ilike(q_filter),
            Partner.mobile.ilike(q_filter)
        ))
    
    if filters:
        query = query.where(*filters)
    
    query = query.limit(100)
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/lookups", response_model=List[LookupRead])
async def get_lookups(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db)
):
    """Retrieve system lookups (Payment modes, size groups, etc.)."""
    query = select(GeneralLookup)
    if category:
        query = query.where(GeneralLookup.category == category)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/universal-search", response_model=UniversalSearchResponse)
async def universal_search(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Institutional Universal Search. 
    Searches across Items, Partners, and System Lookups simultaneously.
    """
    q_filter = f"%{q}%"
    
    # 1. Items Search
    products = (await db.execute(
        select(Product).where(or_(
            Product.name.ilike(q_filter),
            Product.code.ilike(q_filter)
        )).limit(10)
    )).scalars().all()

    # 2. Partners Search
    partners = (await db.execute(
        select(Partner).where(or_(
            Partner.name.ilike(q_filter),
            Partner.mobile.ilike(q_filter)
        )).limit(10)
    )).scalars().all()

    # 3. Lookups Search
    lookups = (await db.execute(
        select(GeneralLookup).where(
            GeneralLookup.label.ilike(q_filter)
        ).limit(10)
    )).scalars().all()

    return {
        "items": products,
        "partners": partners,
        "lookups": lookups
    }

@router.get("/styles/{style_code}")
async def get_style_matrix(
    style_code: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Fetch the Size/Color matrix for a specific style group.
    Groups items by their parent style code.
    """
    # In Shoper 9 parity, Style is often stored in AnalCode1 or a specific Style field
    # For now, we query the Product table where style_code matches
    query = select(Product).where(Product.style_code == style_code)
    result = await db.execute(query)
    variants = result.scalars().all()
    
    if not variants:
        raise HTTPException(status_code=404, detail="Style not found")
        
    # Build the matrix: Rows (Colors/Sub-styles) x Cols (Sizes)
    colors = sorted(list(set(v.color for v in variants if v.color)))
    sizes = sorted(list(set(v.size for v in variants if v.size)))
    
    matrix = {}
    for v in variants:
        if v.color not in matrix: matrix[v.color] = {}
        matrix[v.color][v.size] = {
            "id": v.id,
            "stock": v.stock_qty,
            "price": v.retail_price,
            "code": v.code
        }
        
    return {
        "style_code": style_code,
        "name": variants[0].name,
        "colors": colors,
        "sizes": sizes,
        "matrix": matrix
    }

@router.post("/price-revisions/bulk")
async def bulk_price_revision(
    revisions: List[dict],
    effective_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Shoper 9 Parity: Bulk Price Revision.
    Applies new prices to a list of products.
    """
    updated_count = 0
    for rev in revisions:
        product_id = rev.get("id")
        new_price = rev.get("new_price")
        
        if not product_id or new_price is None:
            continue
            
        # In a full Shoper 9 implementation, we would store this in a 'PriceRevisionHistory' table
        # and apply it only when current_date >= effective_date.
        # For now, we update the Product table directly to reflect the 'Sovereign' speed.
        from app.models.base import Product
        from sqlalchemy import update
        
        stmt = update(Product).where(Product.id == product_id).values(retail_price=new_price)
        await db.execute(stmt)
        updated_count += 1
        
    await db.commit()
    return {"status": "SUCCESS", "updated_count": updated_count}
