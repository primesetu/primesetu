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

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, update
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import Itemmaster, Stockmaster
from app.schemas.item_master import (
    ItemCreate, ItemResponse, PriceLevelUpdate, 
    StockMatrixEntry, StockMatrixResponse,
    ItemBatchCreate, BatchCreateResponse
)

router = APIRouter(prefix="/items", tags=["item-master"])

@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: ItemCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new item and its initial price/stock matrix.
    Ensures item_code uniqueness per store.
    """
    # 1. Check item_code uniqueness
    existing_q = await db.execute(
        select(Item).where(
            Item.store_id == current_user.store_id,
            Item.item_code == payload.item_code
        )
    )
    if existing_q.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"Item code '{payload.item_code}' already exists in this store."
        )

    # 2. Create Item
    new_item = Item(
        store_id=current_user.store_id,
        item_code=payload.item_code,
        item_name=payload.item_name,
        department_id=payload.department_id,
        brand=payload.brand,
        supplier_id=payload.supplier_id,
        size_group_id=payload.size_group_id,
        colour=payload.colour,
        colour_code=payload.colour_code,
        mrp_paise=payload.mrp_paise,
        cost_paise=payload.cost_paise,
        gst_rate=payload.gst_rate,
        hsn_code=payload.hsn_code,
        shoper_recid=payload.shoper_recid,
        anal_codes=payload.anal_codes or {}
    )
    db.add(new_item)
    await db.flush() # Get item ID

    # 3. Create initial MRP price level
    initial_price = ItemPriceLevel(
        item_id=new_item.id,
        store_id=current_user.store_id,
        price_level="mrp",
        price_paise=payload.mrp_paise,
        valid_from=date.today()
    )
    db.add(initial_price)

    # 4. Create stock matrix entries
    for entry in payload.stock_matrix:
        stock = ItemStock(
            item_id=new_item.id,
            store_id=current_user.store_id,
            size=entry.size,
            colour=entry.colour,
            qty_on_hand=entry.qty_on_hand
        )
        db.add(stock)

    await db.commit()
    await db.refresh(new_item)
    return new_item

@router.get("/")
async def list_items(
    search: Optional[str] = Query(None, description="Search by code or name"),
    department_id: Optional[str] = None,
    is_active: bool = True,
    limit: int = 50,
    offset: int = 0,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    List items from Shoper9 Itemmaster with pagination and search.
    Includes total stock across all locations.
    """
    # Subquery for total stock from Stockmaster
    stock_subq = (
        select(
            Stockmaster.stockno,
            func.sum(Stockmaster.curbalqty).label("total_stock")
        )
        .group_by(Stockmaster.stockno)
        .subquery()
    )

    query = (
        select(Itemmaster, func.coalesce(stock_subq.c.total_stock, 0))
        .outerjoin(stock_subq, Itemmaster.stockno == stock_subq.c.stockno)
    )

    if search:
        query = query.where(
            or_(
                Itemmaster.stockno.ilike(f"%{search}%"),
                Itemmaster.itemdesc.ilike(f"%{search}%"),
                Itemmaster.sfield1.ilike(f"%{search}%")
            )
        )
    
    if department_id:
        query = query.where(Itemmaster.class1cd == department_id)

    query = query.order_by(Itemmaster.itemdesc).limit(limit).offset(offset)
    
    result = await db.execute(query)
    items = []
    for row in result:
        item, total_stock = row
        items.append({
            "id": item.stockno,
            "item_code": item.stockno,
            "item_name": item.itemdesc,
            "department_id": item.class1cd,
            "brand": item.class2cd,
            "mrp_paise": int((item.retail_price or 0) * 100),
            "gst_rate": 0, # Shoper9 handles this in tax tables
            "hsn_code": "N/A", # Need to fetch from HSN table
            "is_active": True,
            "total_stock": int(total_stock or 0),
            "created_at": datetime.now()
        })
    
    return items

@router.get("/{stockno}/stock-matrix")
async def get_stock_matrix(
    stockno: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the location-wise stock for a specific item from Shoper9.
    """
    result = await db.execute(
        select(Stockmaster)
        .where(Stockmaster.stockno == stockno)
    )
    stocks = result.scalars().all()
    
    matrix = [
        {
            "size": "ALL", # Shoper9 often flattens size or uses separate stockno for variants
            "colour": "ALL",
            "qty_on_hand": int(s.curbalqty or 0),
            "location": s.locnid
        } for s in stocks
    ]
    
    return {"item_id": stockno, "matrix": matrix}

@router.patch("/{item_id}/price", status_code=status.HTTP_200_OK)
async def update_price_level(
    item_id: UUID,
    payload: PriceLevelUpdate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Update a price level (MRP, Wholesale, etc.).
    Preserves history by setting valid_to on the previous price.
    """
    # 1. Set valid_to = yesterday for the existing active price of this level
    yesterday = date.today() # Simplified for today's logic
    
    await db.execute(
        update(ItemPriceLevel)
        .where(
            ItemPriceLevel.item_id == item_id,
            ItemPriceLevel.store_id == current_user.store_id,
            ItemPriceLevel.price_level == payload.price_level,
            ItemPriceLevel.valid_to == None
        )
        .values(valid_to=payload.valid_from) # previous ends when new starts
    )

    # 2. Insert new price
    new_price = ItemPriceLevel(
        item_id=item_id,
        store_id=current_user.store_id,
        price_level=payload.price_level,
        price_paise=payload.price_paise,
        valid_from=payload.valid_from,
        valid_to=None
    )
    db.add(new_price)
    
    # 3. If price_level is 'mrp', update the main item mrp_paise too
    if payload.price_level == "mrp":
        await db.execute(
            update(Item)
            .where(Item.id == item_id)
            .values(mrp_paise=payload.price_paise, updated_at=datetime.now())
        )

    await db.commit()
    return {"status": "success", "message": f"Price level '{payload.price_level}' updated."}

@router.post("/batch", response_model=BatchCreateResponse)
async def batch_create_items(
    payload: ItemBatchCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Bulk create items. 
    Parity with Shoper9 Excel Import: Omits duplicates if requested.
    """
    success_count = 0
    skipped_count = 0
    error_count = 0
    created_items = []
    skipped_codes = []

    # 1. Fetch existing item codes for this store to avoid N+1 queries
    existing_codes_q = await db.execute(
        select(Item.item_code).where(Item.store_id == current_user.store_id)
    )
    existing_codes = set(existing_codes_q.scalars().all())

    for item_data in payload.items:
        try:
            if item_data.item_code in existing_codes:
                if payload.omit_duplicates:
                    skipped_count += 1
                    skipped_codes.append(item_data.item_code)
                    continue
                else:
                    raise HTTPException(
                        status_code=409,
                        detail=f"Item code '{item_data.item_code}' already exists."
                    )

            # Create Item
            new_item = Item(
                store_id=current_user.store_id,
                item_code=item_data.item_code,
                item_name=item_data.item_name,
                department_id=item_data.department_id,
                brand=item_data.brand,
                supplier_id=item_data.supplier_id,
                size_group_id=item_data.size_group_id,
                colour=item_data.colour,
                colour_code=item_data.colour_code,
                mrp_paise=item_data.mrp_paise,
                cost_paise=item_data.cost_paise,
                gst_rate=item_data.gst_rate,
                hsn_code=item_data.hsn_code,
                shoper_recid=item_data.shoper_recid
            )
            db.add(new_item)
            await db.flush()

            # Create MRP
            initial_price = ItemPriceLevel(
                item_id=new_item.id,
                store_id=current_user.store_id,
                price_level="mrp",
                price_paise=item_data.mrp_paise,
                valid_from=date.today()
            )
            db.add(initial_price)

            # Create Stock Matrix
            for entry in item_data.stock_matrix:
                stock = ItemStock(
                    item_id=new_item.id,
                    store_id=current_user.store_id,
                    size=entry.size,
                    colour=entry.colour,
                    qty_on_hand=entry.qty_on_hand
                )
                db.add(stock)

            success_count += 1
            created_items.append(new_item)
            existing_codes.add(item_data.item_code) # Add to set to avoid duplicates within same batch

        except Exception as e:
            error_count += 1
            print(f"[SMRITI-OS] Error creating item {item_data.item_code}: {str(e)}")
            continue

    await db.commit()
    
    return BatchCreateResponse(
        success_count=success_count,
        skipped_count=skipped_count,
        error_count=error_count,
        items=created_items,
        skipped_codes=skipped_codes
    )
