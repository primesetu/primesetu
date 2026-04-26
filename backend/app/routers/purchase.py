/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Document : backend/app/routers/purchase.py
 * © 2026 — All Rights Reserved
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from typing import List
import uuid

from app.core.database import get_db
from app.models.purchase import PurchaseOrder, PurchaseOrderItem, GRN, GRNItem
from app.models.base import ItemStock
from app.schemas.purchase import POCreate, PO as POSchema, GRNCreate, GRN as GRNSchema
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/purchase", tags=["purchase"])

@router.get("/", response_model=List[POSchema])
async def list_purchase_orders(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    query = select(PurchaseOrder).where(PurchaseOrder.store_id == store_id).options(selectinload(PurchaseOrder.items)).order_by(PurchaseOrder.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all()

@router.post("/", response_model=POSchema)
async def create_purchase_order(
    payload: POCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # 1. Create Header
    po = PurchaseOrder(
        store_id=store_id,
        vendor_id=payload.vendor_id,
        po_number=payload.po_number,
        expected_date=payload.expected_date,
        notes=payload.notes,
        status="DRAFT",
        created_by=uuid.UUID(current_user["id"])
    )
    db.add(po)
    await db.flush()
    
    total_paise = 0
    tax_paise = 0
    
    # 2. Create Items
    for item in payload.items:
        # Calculate item totals (integer arithmetic)
        item_tax = (item.qty_ordered * item.unit_cost_paise * item.tax_rate) // 100
        item_total = (item.qty_ordered * item.unit_cost_paise) + item_tax
        
        po_item = PurchaseOrderItem(
            po_id=po.id,
            item_id=item.item_id,
            size=item.size,
            colour=item.colour,
            qty_ordered=item.qty_ordered,
            unit_cost_paise=item.unit_cost_paise,
            tax_rate=item.tax_rate,
            tax_paise=item_tax,
            total_paise=item_total
        )
        total_paise += item_total
        tax_paise += item_tax
        db.add(po_item)
        
    po.total_paise = total_paise
    po.tax_paise = tax_paise
    
    await db.commit()
    await db.refresh(po)
    
    # Re-fetch with items loaded
    query = select(PurchaseOrder).where(PurchaseOrder.id == po.id).options(selectinload(PurchaseOrder.items))
    result = await db.execute(query)
    return result.scalar_one()

@router.get("/{po_id}", response_model=POSchema)
async def get_purchase_order(
    po_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    query = select(PurchaseOrder).where(
        and_(PurchaseOrder.id == po_id, PurchaseOrder.store_id == store_id)
    ).options(selectinload(PurchaseOrder.items))
    
    result = await db.execute(query)
    po = result.scalar_one_or_none()
    
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
    return po

@router.post("/grn", response_model=GRNSchema)
async def process_grn(
    payload: GRNCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # 1. Create GRN Header
    grn = GRN(
        store_id=store_id,
        po_id=payload.po_id,
        grn_number=payload.grn_number,
        received_by=uuid.UUID(current_user["id"]),
        vendor_id=payload.vendor_id,
        notes=payload.notes
    )
    db.add(grn)
    await db.flush()
    
    # 2. Process Items
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
        
        # Update PO Item if linked
        if item_data.po_item_id:
            po_item_query = select(PurchaseOrderItem).where(PurchaseOrderItem.id == item_data.po_item_id)
            po_item_result = await db.execute(po_item_query)
            po_item = po_item_result.scalar_one_or_none()
            if po_item:
                po_item.qty_received += item_data.qty_received
        
        # Update Item Stock
        stock_query = select(ItemStock).where(
            and_(
                ItemStock.item_id == item_data.item_id,
                ItemStock.store_id == store_id,
                ItemStock.size == item_data.size,
                ItemStock.colour == item_data.colour
            )
        )
        stock_result = await db.execute(stock_query)
        stock = stock_result.scalar_one_or_none()
        
        if stock:
            stock.qty_on_hand += item_data.qty_received
        else:
            # Create new stock entry if not exists
            new_stock = ItemStock(
                item_id=item_data.item_id,
                store_id=store_id,
                size=item_data.size,
                colour=item_data.colour,
                qty_on_hand=item_data.qty_received
            )
            db.add(new_stock)
            
    # 3. Update PO Status if linked
    if payload.po_id:
        po_query = select(PurchaseOrder).where(PurchaseOrder.id == payload.po_id).options(selectinload(PurchaseOrder.items))
        po_result = await db.execute(po_query)
        po = po_result.scalar_one_or_none()
        
        if po:
            # Check if all items received
            all_received = True
            for it in po.items:
                if it.qty_received < it.qty_ordered:
                    all_received = False
                    break
            po.status = "RECEIVED" if all_received else "SUBMITTED"
            
    await db.commit()
    await db.refresh(grn)
    
    # Re-fetch with items
    query = select(GRN).where(GRN.id == grn.id).options(selectinload(GRN.items))
    result = await db.execute(query)
    return result.scalar_one()
