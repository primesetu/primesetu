/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from typing import List
import uuid

from app.core.database import get_db
from app.models.base import PurchaseOrder, PurchaseOrderItem, GRN, ItemStock, Item
from app.schemas.operational import POCreate, PO, GRNCreate, GRN as GRNSchema
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/procurement", tags=["procurement"])

@router.get("/reorder-suggestions", response_model=List[dict])
async def get_reorder_suggestions(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # Select items where stock <= reorder_level
    query = select(ItemStock, Item).join(Item).where(
        and_(
            ItemStock.store_id == store_id,
            ItemStock.qty_on_hand <= ItemStock.reorder_level
        )
    )
    result = await db.execute(query)
    suggestions = []
    for stock, item in result.all():
        suggestions.append({
            "item_id": item.id,
            "item_code": item.item_code,
            "item_name": item.item_name,
            "size": stock.size,
            "colour": stock.colour,
            "qty_on_hand": stock.qty_on_hand,
            "reorder_level": stock.reorder_level,
            "suggested_qty": max(0, stock.reorder_level * 2 - stock.qty_on_hand), # Simple logic
            "last_cost_paise": item.cost_paise or 0
        })
    return suggestions

@router.post("/", response_model=PO)
async def create_purchase_order(
    payload: POCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # Generate PO Number (Simplified)
    po_no = f"PO-{uuid.uuid4().hex[:6].upper()}"
    
    po = PurchaseOrder(
        order_no=po_no,
        supplier_id=payload.supplier_id,
        store_id=store_id,
        expected_at=payload.expected_at,
        status="DRAFT"
    )
    db.add(po)
    await db.flush()
    
    total_amount = 0
    for item in payload.items:
        po_item = PurchaseOrderItem(
            po_id=po.id,
            item_id=item.item_id,
            size=item.size,
            colour=item.colour,
            qty_ordered=item.qty_ordered,
            unit_cost_paise=item.unit_cost_paise
        )
        total_amount += item.qty_ordered * item.unit_cost_paise
        db.add(po_item)
    
    po.total_amount_paise = total_amount
    await db.commit()
    await db.refresh(po)
    return po

@router.post("/grn", response_model=GRNSchema)
async def process_grn(
    payload: GRNCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # 1. Create GRN Record
    grn = GRN(
        po_id=payload.po_id,
        grn_no=payload.grn_no,
        received_by=uuid.UUID(current_user["id"]),
        remarks=payload.remarks
    )
    db.add(grn)
    
    # 2. Update Stock and PO Items
    for item_data in payload.items:
        po_item_id = item_data["po_item_id"]
        received_qty = item_data["qty"]
        
        # Get PO Item
        po_item_query = select(PurchaseOrderItem).where(PurchaseOrderItem.id == po_item_id)
        po_item_result = await db.execute(po_item_query)
        po_item = po_item_result.scalar_one()
        
        po_item.qty_received += received_qty
        
        # Update Item Stock
        stock_query = select(ItemStock).where(
            and_(
                ItemStock.item_id == po_item.item_id,
                ItemStock.store_id == store_id,
                ItemStock.size == po_item.size,
                ItemStock.colour == po_item.colour
            )
        )
        stock_result = await db.execute(stock_query)
        stock = stock_result.scalar_one_or_none()
        
        if stock:
            stock.qty_on_hand += received_qty
        else:
            # Create new stock entry if not exists
            new_stock = ItemStock(
                item_id=po_item.item_id,
                store_id=store_id,
                size=po_item.size,
                colour=po_item.colour,
                qty_on_hand=received_qty
            )
            db.add(new_stock)
            
    # 3. Check PO Status
    # (Simplified: if any item received, mark as PARTIAL; if all, RECEIVED)
    await db.execute(
        update(PurchaseOrder)
        .where(PurchaseOrder.id == payload.po_id)
        .values(status="RECEIVED")
    )
    
    await db.commit()
    await db.refresh(grn)
    return grn
