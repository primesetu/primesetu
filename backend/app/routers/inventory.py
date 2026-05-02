# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from sqlalchemy import select, or_, func, and_
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
import random

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import (
    Itemmaster, Stockmaster, 
    Phystkhdr as AuditSession, Phystkdtls as AuditEntry
)
from app.models import Transaction, TransactionItem
from app.schemas.common import ProductRead, PredictiveStats
from app.schemas.item_master import AdvancedSearchRequest, SearchFilter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])

@router.get("")
async def list_inventory(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Alias for stock listing at the root of inventory."""
    return await get_inventory_status(db, current_user)

class AuditItemEntry(BaseModel):
    stock_no: str
    physical_qty: int
    size: Optional[str] = None
    colour: Optional[str] = None

# --- STOCK OPERATIONS ---

@router.get("/search")
async def search_inventory(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Legacy Search Engine: Directly queries Shoper 9 Itemmaster and Stockmaster.
    Bypasses empty SMRITI-OS native tables to fix 'SKU Not Found'.
    """
    query = q.strip()
    if not query:
        return []

    # 1. Robust StockNo match (Exact, Padded 10/12/13/15)
    search_patterns = [query.lower()]
    if query.isdigit():
        for length in [10, 12, 13, 15]:
            search_patterns.append(query.zfill(length))
    
    stmt = (
        select(Itemmaster)
        .where(
            or_(
                func.lower(Itemmaster.stockno).in_(search_patterns),
                func.lower(Itemmaster.sfield1).in_(search_patterns) # Common barcode fallback
            )
        )
    )
    result = await db.execute(stmt)
    item = result.scalars().first()
    
    items = []
    if item:
        items = [item]
    else:
        # 2. Fuzzy search on Name
        search_query = f"%{query.lower()}%"
        stmt = (
            select(Itemmaster)
            .where(func.lower(Itemmaster.itemdesc).like(search_query))
            .limit(50)
        )
        result = await db.execute(stmt)
        items = result.scalars().all()
    
    # Enrich with Stock Data from Stockmaster
    enriched_items = []
    for item in items:
        stock_stmt = select(func.sum(Stockmaster.curbalqty)).where(
            Stockmaster.stockno == item.stockno
        )
        total_stock = await db.scalar(stock_stmt) or 0
        
        mrp_paise = 0
        if item.retail_price:
            try:
                mrp_paise = int(float(item.retail_price) * 100)
            except:
                pass
                
        enriched_items.append({
            "id": item.stockno,
            "real_id": item.stockno,
            "stock_no": item.stockno,
            "item_code": item.stockno,
            "sku": item.stockno,
            "code": item.stockno,
            "name": item.itemdesc or "Unknown",
            "descr": item.itemdesc or "Unknown",
            "brand": item.class1cd or "SMRITI",
            "mrp_paise": mrp_paise,
            "tax_rate": 18,
            "stock": float(total_stock),
            "category": item.class2cd or "Retail",
            "uom": "Pcs",
            "colour": item.subclass2cd or "",
            "subclass1": item.subclass1cd or "",
            "subclass2": item.subclass2cd or "",
            "size": item.sizecd or ""
        })
        
    return enriched_items

@router.post("/advanced-search")
async def advanced_search(
    req: AdvancedSearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Advanced Search: Multi-field filtering with Shoper 9 operators.
    Queries legacy Itemmaster.
    """
    stmt = select(Itemmaster)
    filter_clauses = []
    
    field_map = {
        'item_code': Itemmaster.stockno,
        'item_name': Itemmaster.itemdesc,
        'brand': Itemmaster.class1cd,
        'colour': Itemmaster.subclass2cd
    }
    
    for f in req.filters:
        if f.field not in field_map:
            continue
            
        col = field_map[f.field]
        val = f.value.strip().lower()
        if not val:
            continue
            
        if f.operator == "contains":
            clause = func.lower(col).like(f"%{val}%")
        elif f.operator == "starts_with":
            clause = func.lower(col).like(f"{val}%")
        elif f.operator == "ends_with":
            clause = func.lower(col).like(f"%{val}")
        elif f.operator == "equals":
            clause = func.lower(col) == val
        else:
            continue
            
        filter_clauses.append(clause)
        
    if filter_clauses:
        if req.logic == "OR":
            stmt = stmt.where(or_(*filter_clauses))
        else:
            stmt = stmt.where(and_(*filter_clauses))
            
    stmt = stmt.limit(100)
    result = await db.execute(stmt)
    items = result.scalars().unique().all()
    
    enriched_items = []
    for item in items:
        # Stock check
        stock_data = (await db.execute(select(Stockmaster).filter(Stockmaster.stockno == item.stockno))).scalars().all()
        total_stock = sum([float(s.curbalqty or 0) for s in stock_data])
        
        mrp_paise = 0
        if item.retail_price:
            mrp_paise = int(float(item.retail_price) * 100)
            
        enriched_items.append({
            "id": item.stockno,
            "real_id": item.stockno,
            "stock_no": item.stockno,
            "stockno": item.stockno,
            "item_code": item.stockno,
            "sku": item.stockno,
            "code": item.stockno,
            "name": item.itemdesc or "Unknown",
            "itemdesc": item.itemdesc or "Unknown",
            "descr": item.itemdesc or "Unknown",
            "brand": item.class1cd or "SMRITI",
            "mrp_paise": mrp_paise,
            "retail_price": float(item.retail_price or 0),
            "cost_price": float(item.currentcost or item.lastpurchprice or 0),
            "tax_rate": 18,
            "stock": float(total_stock),
            "category": item.class2cd or "Retail",
            "uom": "Pcs",
            "colour": item.subclass2cd or "",
            "subclass1": item.subclass1cd or "",
            "subclass2": item.subclass2cd or "",
            "size": item.sizecd or ""
        })
        
    return enriched_items

@router.get("/stock", response_model=List[Dict[str, Any]])
async def get_inventory_status(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """Deep status of all SKU matrices from Shoper 9 Stockmaster."""
    stmt = (
        select(
            Itemmaster.stockno.label("id"),
            Itemmaster.stockno.label("code"),
            Itemmaster.itemdesc.label("name"),
            Itemmaster.class1cd.label("category"),
            Itemmaster.class2cd.label("brand"),
            func.sum(Stockmaster.curbalqty).label("total_qty")
        )
        .join(Stockmaster, Stockmaster.stockno == Itemmaster.stockno)
        .group_by(Itemmaster.stockno, Itemmaster.itemdesc, Itemmaster.class1cd, Itemmaster.class2cd)
        .limit(200) # Limit for UI performance
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    return [{
        "id": r.id,
        "code": r.code,
        "name": r.name,
        "category": r.category or "General",
        "brand": r.brand or "N/A",
        "x01_qty": float(r.total_qty or 0),
        "wh1_qty": 0,
        "min_stock": 10,
        "mrp": 0,
        "stocks": [
            {"store_id": "X01", "quantity": float(r.total_qty or 0)},
            {"store_id": "WH1", "quantity": 0}
        ]
    } for r in rows]

@router.get("/predictive", response_model=PredictiveStats)
async def get_predictive_insights(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """AI-Governed procurement forecasting using Shoper 9 authoritative ledger."""
    store_id = current_user.store_id
    thirty_days_ago = datetime.now() - timedelta(days=30)
    
    # 1. Sales Velocity from SMRITI Transactions
    velocity_stmt = (
        select(
            TransactionItem.stock_no,
            func.sum(TransactionItem.qty).label("total_sold")
        )
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(Transaction.store_id == store_id)
        .where(Transaction.created_at >= thirty_days_ago)
        .group_by(TransactionItem.stock_no)
    )
    velocity_res = await db.execute(velocity_stmt)
    velocities = {v.stock_no: float(v.total_sold) / 30.0 for v in velocity_res.all()}
    
    # 2. Current Stock from Stockmaster
    stock_stmt = (
        select(Itemmaster.stockno, Itemmaster.class1cd, func.sum(Stockmaster.curbalqty))
        .join(Stockmaster, Stockmaster.stockno == Itemmaster.stockno)
        .group_by(Itemmaster.stockno, Itemmaster.class1cd)
    )
    stock_res = await db.execute(stock_stmt)
    stock_data = stock_res.all()
    
    risk_count = 0
    total_doc = 0.0
    doc_count = 0
    brand_sales = {}
    
    for stock_no, brand, qty in stock_data:
        velocity = velocities.get(stock_no, 0.0)
        if brand:
            brand_sales[brand] = brand_sales.get(brand, 0.0) + velocity
            
        if velocity > 0:
            doc = float(qty or 0) / velocity
            total_doc += doc
            doc_count += 1
            if doc < 7: risk_count += 1
        elif (qty or 0) <= 0:
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
    audit_no = f"AUD-{datetime.now().strftime('%y%m%d')}-{random.randint(1000, 9999)}"
    session = AuditSession(
        phystkbatchno=audit_no,
        vauid=current_user.id,
        vacompcode=current_user.store_id
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
        .where(AuditSession.vacompcode == current_user.store_id)
        .order_by(AuditSession.smriti_id.desc())
    )
    return result.scalars().all()

@router.get("/audit/sessions/{session_id}")
async def get_audit_session(
    session_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Get audit session details with Shoper 9 enrichment."""
    stmt = select(AuditSession).where(
        AuditSession.smriti_id == int(session_id),
        AuditSession.vacompcode == current_user.store_id
    )
    session = (await db.execute(stmt)).scalar_one_or_none()
    if not session: 
        raise HTTPException(status_code=404, detail="Audit Session not found")
    
    # Load entries with Shoper 9 item info
    entries_stmt = (
        select(AuditEntry, Itemmaster.itemdesc)
        .join(Itemmaster, AuditEntry.stkno == Itemmaster.stockno)
        .where(AuditEntry.phystkbatchno == session.phystkbatchno)
    )
    entries_res = (await db.execute(entries_stmt)).all()
    
    entries = []
    for e, name in entries_res:
        # Fetch actual book stock for variance calculation
        stock_stmt = select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == e.stkno)
        book_qty = (await db.execute(stock_stmt)).scalar() or 0
        
        entries.append({
            "id": e.smriti_id,
            "stock_no": e.stkno,
            "item_name": name,
            "size": e.c1,
            "colour": e.c2,
            "book_qty": float(book_qty),
            "physical_qty": float(e.phystkqty or 0),
            "variance": float((e.phystkqty or 0) - (book_qty or 0))
        })
    
    return {
        "id": session.smriti_id,
        "audit_no": session.phystkbatchno,
        "status": "OPEN", # Shoper9 phystkhdr doesn't have a simple status field in the same way
        "created_at": session.batchstdt,
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
        AuditSession.smriti_id == int(session_id),
        AuditSession.vacompcode == current_user.store_id
    )
    session = (await db.execute(session_stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=400, detail="Audit session not found")

    # Fetch book stock from Stockmaster
    stock_stmt = select(func.sum(Stockmaster.curbalqty)).where(
        Stockmaster.stockno == data.stock_no
    )
    book_qty = (await db.execute(stock_stmt)).scalar() or 0

    # Check for existing entry in this session
    entry_stmt = select(AuditEntry).where(
        and_(
            AuditEntry.phystkbatchno == session.phystkbatchno,
            AuditEntry.stkno == data.stock_no
        )
    )
    existing_entry = (await db.execute(entry_stmt)).scalar_one_or_none()

    if existing_entry:
        existing_entry.phystkqty = data.physical_qty
    else:
        # Get max entsrlno for this batch
        srl_stmt = select(func.max(AuditEntry.entsrlno)).where(AuditEntry.phystkbatchno == session.phystkbatchno)
        max_srl = (await db.execute(srl_stmt)).scalar() or 0
        
        new_entry = AuditEntry(
            phystkbatchno=session.phystkbatchno,
            stkno=data.stock_no,
            entsrlno=max_srl + 1,
            phystkqty=data.physical_qty,
            entdt=datetime.now(),
            vauid=current_user.id,
            vacompcode=current_user.store_id
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
    """
    Finalize audit results: Updates Stockmaster and seals the session.
    Atomic Reconciliation Logic.
    """
    session_stmt = select(AuditSession).where(
        AuditSession.smriti_id == int(session_id),
        AuditSession.vacompcode == current_user.store_id
    )
    session = (await db.execute(session_stmt)).scalar_one_or_none()
    
    if not session:
        raise HTTPException(status_code=400, detail="Invalid session")
    
    # 1. Fetch all physical counts
    entries_stmt = select(AuditEntry).where(AuditEntry.phystkbatchno == session.phystkbatchno)
    entries = (await db.execute(entries_stmt)).scalars().all()
    
    # 2. Update Stockmaster atomically
    for entry in entries:
        # Find the stock record
        stock_stmt = select(Stockmaster).where(Stockmaster.stockno == entry.stkno)
        stock_rec = (await db.execute(stock_stmt)).scalar_one_or_none()
        
        if stock_rec:
            # Variance calculation
            old_qty = stock_rec.curbalqty or 0
            new_qty = entry.phystkqty or 0
            
            # Atomic mutation
            stock_rec.curbalqty = new_qty
            stock_rec.lastupdatedt = datetime.now()
            
            # TODO: Create a Transaction (Type 1500 - Stock Correction) for accounting
            
    # 3. Seal the session
    session.batchenddt = datetime.now()
    
    await db.commit()
    return {"status": "success", "message": f"Stock reconciled for {len(entries)} items. Stockmaster Updated."}
