# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/routers/warehouse.py
# (c) 2026 - All Rights Reserved
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Dict, Any, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser, require_manager
from app.models import ItemStock, StockLedger, Item, Store
from app.schemas.warehouse import (
    StockAdjustmentRequest, StockTransferRequest, BinAssignmentRequest
)

router = APIRouter(prefix="/api/v1/warehouse", tags=["warehouse"])


class StoreListItem(BaseModel):
    model_config = {"from_attributes": True}
    id: str
    name: str
    code: str


@router.get("/stores", response_model=List[StoreListItem])
async def list_stores(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Return all active stores for transfer routing dropdowns."""
    stmt = select(Store).where(Store.is_active == True).order_by(Store.name)
    result = await db.execute(stmt)
    stores = result.scalars().all()
    return [StoreListItem(id=s.id, name=s.name, code=s.code) for s in stores]


@router.post("/transfer")
async def stock_transfer(
    payload: StockTransferRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    Sovereign Multi-location Stock Transfer.
    Atomic debit/credit protocol.
    """
    # Verify Source Store Permissions
    if payload.source_store_id != current_user.store_id:
        raise HTTPException(status_code=403, detail="Unauthorized source location")

    transfer_id = f"TRF-{uuid.uuid4().hex[:6].upper()}"

    for item_data in payload.items:
        # 1. Debit Source
        source_stock_stmt = select(ItemStock).where(
            and_(
                ItemStock.item_id == item_data.item_id,
                ItemStock.store_id == payload.source_store_id,
                ItemStock.size == item_data.size,
                ItemStock.colour == item_data.colour,
                ItemStock.batch_no == item_data.batch_no
            )
        )
        source_stock = (await db.execute(source_stock_stmt)).scalar_one_or_none()
        
        if not source_stock or source_stock.qty_on_hand < item_data.qty:
            raise HTTPException(status_code=400, detail=f"Insufficient stock for item {item_data.item_id}")
        
        source_stock.qty_on_hand -= item_data.qty
        
        # Log Transfer Out
        db.add(StockLedger(
            store_id=payload.source_store_id,
            item_id=item_data.item_id,
            txn_type="Transfer_Out",
            qty=-item_data.qty,
            ref_no=transfer_id
        ))

        # 2. Credit Destination
        dest_stock_stmt = select(ItemStock).where(
            and_(
                ItemStock.item_id == item_data.item_id,
                ItemStock.store_id == payload.destination_store_id,
                ItemStock.size == item_data.size,
                ItemStock.colour == item_data.colour,
                ItemStock.batch_no == item_data.batch_no
            )
        )
        dest_stock = (await db.execute(dest_stock_stmt)).scalar_one_or_none()
        
        if dest_stock:
            dest_stock.qty_on_hand += item_data.qty
        else:
            db.add(ItemStock(
                item_id=item_data.item_id,
                store_id=payload.destination_store_id,
                size=item_data.size,
                colour=item_data.colour,
                batch_no=item_data.batch_no,
                qty_on_hand=item_data.qty
            ))
            
        # Log Transfer In
        db.add(StockLedger(
            store_id=payload.destination_store_id,
            item_id=item_data.item_id,
            txn_type="Transfer_In",
            qty=item_data.qty,
            ref_no=transfer_id
        ))

    await db.commit()
    return {"status": "success", "transfer_id": transfer_id}

@router.post("/adjustment")
async def stock_adjustment(
    payload: StockAdjustmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """Manual Stock Correction Protocol with mandatory reason."""
    stmt = select(ItemStock).where(
        and_(
            ItemStock.item_id == payload.item_id,
            ItemStock.store_id == current_user.store_id,
            ItemStock.size == payload.size,
            ItemStock.colour == payload.colour,
            ItemStock.batch_no == payload.batch_no
        )
    )
    stock = (await db.execute(stmt)).scalar_one_or_none()
    
    if not stock:
        # Create if doesn't exist for positive adjustment
        if payload.qty_change < 0:
            raise HTTPException(status_code=404, detail="Stock record not found for debit adjustment")
        stock = ItemStock(
            item_id=payload.item_id,
            store_id=current_user.store_id,
            size=payload.size,
            colour=payload.colour,
            batch_no=payload.batch_no,
            qty_on_hand=0
        )
        db.add(stock)

    stock.qty_on_hand += payload.qty_change
    
    # Log Adjustment
    db.add(StockLedger(
        store_id=current_user.store_id,
        item_id=payload.item_id,
        txn_type=f"Adjustment_{payload.reason_code}",
        qty=payload.qty_change,
        ref_no=f"ADJ-{uuid.uuid4().hex[:6].upper()}"
    ))
    
    await db.commit()
    return {"status": "success", "new_qty": stock.qty_on_hand}

@router.post("/bin-assignment")
async def bin_assignment(
    payload: BinAssignmentRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Assign Warehouse Bin/Shelf location to SKU."""
    stmt = select(ItemStock).where(
        and_(
            ItemStock.item_id == payload.item_id,
            ItemStock.store_id == current_user.store_id,
            ItemStock.size == payload.size,
            ItemStock.colour == payload.colour,
            ItemStock.batch_no == payload.batch_no
        )
    )
    stock = (await db.execute(stmt)).scalar_one_or_none()
    
    if not stock:
        raise HTTPException(status_code=404, detail="Stock record not found")

    stock.bin_location = payload.bin_location
    stock.shelf_no = payload.shelf_no
    
    await db.commit()
    return {"status": "success"}

@router.get("/dashboard")
async def warehouse_dashboard(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Live Warehouse Pulse Dashboard."""
    # 1. Total Stock Valuation (Placeholder logic)
    # 2. Fast/Slow Movers
    # 3. Bin Occupancy
    
    stmt = (
        select(Item.item_name, ItemStock.qty_on_hand, ItemStock.bin_location)
        .join(ItemStock, Item.id == ItemStock.item_id)
        .where(ItemStock.store_id == current_user.store_id)
        .limit(10)
    )
    result = await db.execute(stmt)
    
    return {
        "metrics": {
            "total_items": 1250, # Placeholder
            "valuation_paise": 45000000,
            "low_stock_count": 12
        },
        "recent_movements": [],
        "bin_highlights": [dict(zip(["name", "qty", "bin"], r)) for r in result.all()]
    }
