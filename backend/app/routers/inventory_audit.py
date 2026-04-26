/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from typing import List
from uuid import UUID
import uuid

from app.core.database import get_db
from app.models.base import InventoryAudit, InventoryAuditItem, ItemStock
from app.schemas.operational import AuditCreate, Audit, AuditEntryCreate
from app.core.auth import get_current_user

router = APIRouter(prefix="/api/v1/inventory-audit", tags=["inventory-audit"])

@router.post("/", response_model=Audit)
async def start_audit(
    payload: Optional[AuditCreate] = None,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    audit_no = payload.audit_no if payload and payload.audit_no else f"AUD-{uuid.uuid4().hex[:6].upper()}"
    
    audit = InventoryAudit(
        audit_no=audit_no,
        store_id=store_id,
        status="OPEN"
    )
    db.add(audit)
    await db.flush()
    
    if payload and payload.items:
        for item in payload.items:
        # Get current system stock
        stock_query = select(ItemStock.qty_on_hand).where(
            and_(
                ItemStock.item_id == item.item_id,
                ItemStock.store_id == store_id,
                ItemStock.size == item.size,
                ItemStock.colour == item.colour
            )
        )
        stock_res = await db.execute(stock_query)
        system_qty = stock_res.scalar_one_or_none() or 0
        
        audit_item = InventoryAuditItem(
            audit_id=audit.id,
            item_id=item.item_id,
            size=item.size,
            colour=item.colour,
            system_qty=system_qty,
            physical_qty=item.physical_qty
        )
        db.add(audit_item)
    
    await db.commit()
    await db.refresh(audit)
    return audit

@router.get("/", response_model=List[Audit])
async def list_audits(
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(InventoryAudit).where(InventoryAudit.store_id == current_user["store_id"])
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{audit_id}", response_model=Audit)
async def get_audit(
    audit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = select(InventoryAudit).where(
        InventoryAudit.id == audit_id,
        InventoryAudit.store_id == current_user["store_id"]
    )
    result = await db.execute(query)
    audit = result.scalar_one_or_none()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit

@router.post("/{audit_id}/entries")
async def add_audit_entry(
    audit_id: UUID,
    payload: AuditEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # Verify audit exists and is OPEN
    audit_query = select(InventoryAudit).where(
        and_(
            InventoryAudit.id == audit_id,
            InventoryAudit.store_id == store_id
        )
    )
    audit_res = await db.execute(audit_query)
    audit = audit_res.scalar_one_or_none()
    if not audit or audit.status != "OPEN":
        raise HTTPException(status_code=400, detail="Active audit session not found")

    # Upsert entry
    existing_query = select(InventoryAuditItem).where(
        and_(
            InventoryAuditItem.audit_id == audit_id,
            InventoryAuditItem.item_id == payload.item_id,
            InventoryAuditItem.size == payload.size,
            InventoryAuditItem.colour == payload.colour
        )
    )
    existing_res = await db.execute(existing_query)
    entry = existing_res.scalar_one_or_none()

    if entry:
        entry.physical_qty = payload.physical_qty
    else:
        # Get book qty
        stock_query = select(ItemStock.qty_on_hand).where(
            and_(
                ItemStock.item_id == payload.item_id,
                ItemStock.store_id == store_id,
                ItemStock.size == payload.size,
                ItemStock.colour == payload.colour
            )
        )
        stock_res = await db.execute(stock_query)
        system_qty = stock_res.scalar_one_or_none() or 0
        
        entry = InventoryAuditItem(
            audit_id=audit_id,
            item_id=payload.item_id,
            size=payload.size,
            colour=payload.colour,
            system_qty=system_qty,
            physical_qty=payload.physical_qty
        )
        db.add(entry)

    await db.commit()
    return {"status": "success"}

@router.post("/{audit_id}/submit", response_model=Audit)
async def submit_audit(
    audit_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    store_id = current_user["store_id"]
    
    # 1. Get Audit and Items
    audit_query = select(InventoryAudit).where(
        and_(
            InventoryAudit.id == audit_id,
            InventoryAudit.store_id == store_id
        )
    )
    audit_res = await db.execute(audit_query)
    audit = audit_res.scalar_one_or_none()
    
    if not audit or audit.status != "OPEN":
        raise HTTPException(status_code=400, detail="Audit not found or already submitted")
        
    audit_items_query = select(InventoryAuditItem).where(InventoryAuditItem.audit_id == audit_id)
    audit_items_res = await db.execute(audit_items_query)
    items = audit_items_res.scalars().all()
    
    # 2. Adjust Stock
    for item in items:
        # Physical stock becomes the new system stock
        stock_query = select(ItemStock).where(
            and_(
                ItemStock.item_id == item.item_id,
                ItemStock.store_id == store_id,
                ItemStock.size == item.size,
                ItemStock.colour == item.colour
            )
        )
        stock_res = await db.execute(stock_query)
        stock = stock_res.scalar_one_or_none()
        
        if stock:
            stock.qty_on_hand = item.physical_qty
        else:
            new_stock = ItemStock(
                item_id=item.item_id,
                store_id=store_id,
                size=item.size,
                colour=item.colour,
                qty_on_hand=item.physical_qty
            )
            db.add(new_stock)
            
    # 3. Finalize Audit
    audit.status = "SUBMITTED"
    from datetime import datetime
    audit.submitted_at = datetime.now()
    
    await db.commit()
    await db.refresh(audit)
    return audit
