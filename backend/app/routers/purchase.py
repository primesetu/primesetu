# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import (
    PurchaseOrder, PurchaseOrderItem, GRN, GRNItem, ItemStock, Partner
)
from app.schemas.purchase import POCreate, PO, GRNCreate, GRN as GRNSchema

router = APIRouter(prefix="/api/v1/purchase", tags=["purchase"])

@router.get("/", response_model=List[PO])
async def list_purchase_orders(
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """List all procurement orders for the store."""
    query = select(PurchaseOrder).where(PurchaseOrder.store_id == current_user.store_id)
    # If search provided, we could filter by po_number or vendor name
    result = await db.execute(query.order_by(PurchaseOrder.created_at.desc()))
    return result.scalars().all()

@router.post("/", response_model=PO)
async def create_purchase_order(
    payload: POCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Sovereign PO Generation Protocol."""
    po = PurchaseOrder(
        store_id=current_user.store_id,
        vendor_id=payload.vendor_id,
        po_number=payload.po_number,
        expected_date=payload.expected_date,
        notes=payload.notes,
        status="DRAFT",
        created_by=current_user.id
    )
    db.add(po)
    await db.flush()
    
    total_paise = 0
    for item_data in payload.items:
        item_total = item_data.qty_ordered * item_data.unit_cost_paise
        po_item = PurchaseOrderItem(
            po_id=po.id,
            item_id=item_data.item_id,
            size=item_data.size,
            colour=item_data.colour,
            qty_ordered=item_data.qty_ordered,
            unit_cost_paise=item_data.unit_cost_paise,
            total_paise=item_total
        )
        total_paise += item_total
        db.add(po_item)
    
    po.total_paise = total_paise
    await db.commit()
    await db.refresh(po)
    return po

@router.post("/grn", response_model=GRNSchema)
async def process_grn(
    payload: GRNCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Inwarding (GRN) Protocol.
    Updates stock and marks PO as RECEIVED.
    """
    grn = GRN(
        store_id=current_user.store_id,
        po_id=payload.po_id,
        grn_number=payload.grn_number,
        received_by=current_user.id,
        vendor_id=payload.vendor_id,
        notes=payload.notes
    )
    db.add(grn)
    await db.flush()
    
    for item_data in payload.items:
        # Create GRN Item
        grn_item = GRNItem(
            grn_id=grn.id,
            po_item_id=item_data.po_item_id,
            item_id=item_data.item_id,
            size=item_data.size,
            colour=item_data.colour,
            qty_received=item_data.qty_received,
            unit_cost_paise=item_data.unit_cost_paise
        )
        db.add(grn_item)
        
        # Update PO Item received qty if po_item_id provided
        if item_data.po_item_id:
            po_item = await db.get(PurchaseOrderItem, item_data.po_item_id)
            if po_item:
                po_item.qty_received += item_data.qty_received
        
        # Update Live Stock
        stock_stmt = select(ItemStock).where(
            and_(
                ItemStock.item_id == item_data.item_id,
                ItemStock.store_id == current_user.store_id,
                ItemStock.size == item_data.size,
                ItemStock.colour == item_data.colour
            )
        )
        stock = (await db.execute(stock_stmt)).scalar_one_or_none()
        
        if stock:
            stock.qty_on_hand += item_data.qty_received
        else:
            new_stock = ItemStock(
                item_id=item_data.item_id,
                store_id=current_user.store_id,
                size=item_data.size,
                colour=item_data.colour,
                qty_on_hand=item_data.qty_received
            )
            db.add(new_stock)
            
    # Mark PO as RECEIVED if applicable
    if payload.po_id:
        po = await db.get(PurchaseOrder, payload.po_id)
        if po:
            po.status = "CLOSED" # Simplified
            
    await db.commit()
    await db.refresh(grn)
    return grn
