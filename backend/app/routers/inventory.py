# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, func, and_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
import random

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import (
    Item, ItemStock, Transaction, TransactionItem, 
    InventoryAudit as AuditSession, InventoryAuditItem as AuditEntry
)
from app.schemas.common import ProductRead, PredictiveStats
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])

class AuditItemEntry(BaseModel):
    item_id: uuid.UUID
    physical_qty: int
    size: Optional[str] = None
    colour: Optional[str] = None

# --- STOCK OPERATIONS ---

@router.get("/stock", response_model=List[Dict[str, Any]])
async def get_inventory_status(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """Deep status of all SKU matrices in the store."""
    stmt = (
        select(ItemStock, Item)
        .join(Item, ItemStock.item_id == Item.id)
        .where(ItemStock.store_id == current_user.store_id)
    )
    result = await db.execute(stmt)
    
    return [{
        "sku": item.item_code,
        "name": item.item_name,
        "size": stock.size,
        "colour": stock.colour,
        "qty": stock.qty_on_hand,
        "reorder": stock.reorder_level,
        "status": "Critical" if stock.qty_on_hand <= stock.reorder_level else "Optimal"
    } for stock, item in result.all()]

@router.get("/predictive", response_model=PredictiveStats)
async def get_predictive_insights(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """AI-Governed procurement forecasting."""
    store_id = current_user.store_id
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # 1. Sales Velocity
    velocity_stmt = (
        select(
            TransactionItem.product_id,
            func.sum(TransactionItem.qty).label("total_sold")
        )
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(Transaction.store_id == store_id)
        .where(Transaction.created_at >= thirty_days_ago)
        .group_by(TransactionItem.product_id)
    )
    velocity_res = await db.execute(velocity_stmt)
    velocities = {v.product_id: v.total_sold / 30.0 for v in velocity_res.all()}
    
    # 2. Current Stock
    stock_stmt = (
        select(Item.id, Item.brand, ItemStock.qty_on_hand)
        .join(ItemStock, ItemStock.item_id == Item.id)
        .where(ItemStock.store_id == store_id)
    )
    stock_res = await db.execute(stock_stmt)
    stock_data = stock_res.all()
    
    risk_count = 0
    total_doc = 0.0
    doc_count = 0
    brand_sales = {}
    
    for item_id, brand, qty in stock_data:
        velocity = velocities.get(item_id, 0.0)
        if brand:
            brand_sales[brand] = brand_sales.get(brand, 0.0) + velocity
            
        if velocity > 0:
            doc = qty / velocity
            total_doc += doc
            doc_count += 1
            if doc < 7: risk_count += 1
        elif qty <= 0:
            risk_count += 1
            
    top_brand = max(brand_sales, key=brand_sales.get) if brand_sales else "N/A"
    avg_doc = total_doc / doc_count if doc_count > 0 else 0.0
    
    return PredictiveStats(
        stockout_forecast_count=risk_count,
        top_category=top_brand,
        predicted_days=round(avg_doc, 1)
    )

# --- AUDIT OPERATIONS ---

@router.post("/audit/sessions", status_code=201)
async def create_audit_session(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """Start a new Physical Stock Audit Session."""
    audit_no = f"AUD-{datetime.now().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    session = AuditSession(
        audit_no=audit_no,
        store_id=current_user.store_id,
        status="OPEN"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/audit/sessions")
async def list_audit_sessions(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """List all audit sessions for the current store."""
    result = await db.execute(
        select(AuditSession)
        .where(AuditSession.store_id == current_user.store_id)
        .order_by(AuditSession.created_at.desc())
    )
    return result.scalars().all()

@router.get("/audit/sessions/{session_id}")
async def get_audit_session(
    session_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Get audit session details with entries."""
    stmt = select(AuditSession).where(
        AuditSession.id == session_id,
        AuditSession.store_id == current_user.store_id
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session: 
        raise HTTPException(status_code=404, detail="Audit Session not found")
    
    # Load entries with item info
    entries_stmt = (
        select(AuditEntry, Item.item_name, Item.item_code)
        .join(Item, AuditEntry.item_id == Item.id)
        .where(AuditEntry.audit_id == session_id)
    )
    entries_res = (await db.execute(entries_stmt)).all()
    
    entries = []
    for e, name, code in entries_res:
        entries.append({
            "id": e.id,
            "item_id": e.item_id,
            "item_name": name,
            "item_code": code,
            "size": e.size,
            "colour": e.colour,
            "book_qty": e.system_qty,
            "physical_qty": e.physical_qty
        })
    
    return {
        "id": session.id,
        "audit_no": session.audit_no,
        "status": session.status,
        "created_at": session.created_at,
        "entries": entries
    }

@router.post("/audit/sessions/{session_id}/entries")
async def upsert_audit_entry(
    session_id: uuid.UUID, 
    data: AuditItemEntry, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Add or update a physical count entry in an active session."""
    session_stmt = select(AuditSession).where(
        AuditSession.id == session_id,
        AuditSession.store_id == current_user.store_id
    )
    session = (await db.execute(session_stmt)).scalar_one_or_none()
    
    if not session or session.status != "OPEN":
        raise HTTPException(status_code=400, detail="Audit session is not open or invalid")

    # Fetch book stock
    inv_stmt = select(ItemStock.qty_on_hand).where(
        ItemStock.item_id == data.item_id,
        ItemStock.store_id == current_user.store_id,
        ItemStock.size == data.size,
        ItemStock.colour == data.colour
    )
    book_qty = (await db.execute(inv_stmt)).scalar_one_or_none() or 0

    # Check for existing entry
    entry_stmt = select(AuditEntry).where(
        AuditEntry.audit_id == session_id,
        AuditEntry.item_id == data.item_id,
        And(AuditEntry.size == data.size, AuditEntry.colour == data.colour)
    )
    # Corrected the 'And' to 'and_'
    entry_stmt = select(AuditEntry).where(
        and_(
            AuditEntry.audit_id == session_id,
            AuditEntry.item_id == data.item_id,
            AuditEntry.size == data.size,
            AuditEntry.colour == data.colour
        )
    )
    existing_entry = (await db.execute(entry_stmt)).scalar_one_or_none()

    if existing_entry:
        existing_entry.physical_qty = data.physical_qty
    else:
        new_entry = AuditEntry(
            id=uuid.uuid4(),
            audit_id=session_id,
            item_id=data.item_id,
            size=data.size,
            colour=data.colour,
            system_qty=book_qty,
            physical_qty=data.physical_qty
        )
        db.add(new_entry)

    await db.commit()
    return {"status": "success"}

@router.post("/audit/sessions/{session_id}/finalize")
async def finalize_audit_session(
    session_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Post audit results to live stock. Sovereign stock correction protocol."""
    session_stmt = select(AuditSession).where(
        AuditSession.id == session_id,
        AuditSession.store_id == current_user.store_id
    )
    session = (await db.execute(session_stmt)).scalar_one_or_none()
    
    if not session or session.status != "OPEN":
        raise HTTPException(status_code=400, detail="Invalid session status")
    
    # 1. Load all entries
    stmt = select(AuditEntry).where(AuditEntry.audit_id == session_id)
    entries = (await db.execute(stmt)).scalars().all()
    
    # 2. Update stock for each entry
    for entry in entries:
        stock_stmt = select(ItemStock).where(
            ItemStock.item_id == entry.item_id,
            ItemStock.store_id == current_user.store_id,
            ItemStock.size == entry.size,
            ItemStock.colour == entry.colour
        )
        stock = (await db.execute(stock_stmt)).scalar_one_or_none()
        
        if stock:
            stock.qty_on_hand = entry.physical_qty
        else:
            # Create new stock record if missing
            new_stock = ItemStock(
                item_id=entry.item_id,
                store_id=current_user.store_id,
                size=entry.size,
                colour=entry.colour,
                qty_on_hand=entry.physical_qty
            )
            db.add(new_stock)
    
    # 3. Finalize session
    session.status = "SUBMITTED"
    session.submitted_at = datetime.now()
    
    await db.commit()
    return {"status": "success", "message": "Inventory balanced successfully."}
