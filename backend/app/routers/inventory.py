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
import json

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import (
    Itemmaster, Stockmaster, Chainstores,
    Phystkhdr as AuditSession, Phystkdtls as AuditEntry
)
from app.models.sovereign import (
    SmritiStock, SmritiStockMovement, SmritiStockTransfer, SmritiAuditLog
)
from app.models import Transaction, TransactionItem
from app.schemas.common import (
    ProductRead, PredictiveStats, StockoutForecast, 
    NetworkStock, ISTRequest, ISTRead
)
from app.core.inventory.predictive import (
    calc_days_of_cover, get_stockout_tier, get_reorder_days
)
from app.schemas.item_master import AdvancedSearchRequest, SearchFilter
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/inventory", tags=["inventory"])

class BulkUpdateItem(BaseModel):
    id: str # StockNo
    item_name: Optional[str] = None
    barcode: Optional[str] = None
    brand: Optional[str] = None
    department: Optional[str] = None
    subclass1: Optional[str] = None
    colour: Optional[str] = None
    size: Optional[str] = None
    mrp_paise: Optional[int] = None
    sales_price: Optional[int] = None
    cost_price: Optional[int] = None
    hsn_code: Optional[str] = None

class BulkUpdateRequest(BaseModel):
    items: List[BulkUpdateItem]

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


@router.get("/forecast", response_model=List[StockoutForecast])
async def get_inventory_forecast(
    tier: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Optimized Stockout Forecast using SQL Aggregation.
    """
    from app.core.inventory.predictive import get_all_forecasts
    
    store_id = current_user.store_id
    forecasts = await get_all_forecasts(db, store_id)
    
    if tier:
        forecasts = [f for f in forecasts if f["tier"] == tier.upper()]
        
    return forecasts

@router.get("/predictive", response_model=PredictiveStats)
async def get_predictive_insights(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    """
    AI-Governed procurement forecasting using the optimized DoC engine.
    """
    forecasts = await get_inventory_forecast(db=db, current_user=current_user)
    
    risk_count = sum(1 for f in forecasts if f["tier"] == "CRITICAL")
    valid_docs = [f["doc"] for f in forecasts if f["doc"] is not None]
    avg_doc = sum(valid_docs) / len(valid_docs) if valid_docs else 0
    
    return PredictiveStats(
        stockout_forecast_count=risk_count,
        top_category="N/A",
        predicted_days=round(avg_doc, 1)
    )


@router.post("/ist/request", response_model=ISTRead)
async def create_ist_request(
    payload: ISTRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Initiate a sovereign stock transfer request to a sister store.
    """
    new_request = SmritiStockTransfer(
        sku=payload.sku,
        from_store_id=payload.from_store_id,
        to_store_id=current_user.store_id,
        qty=payload.qty,
        status="PENDING"
    )
    db.add(new_request)
    await db.commit()
    await db.refresh(new_request)
    
    # Audit Log
    db.add(SmritiAuditLog(
        entity_type="IST",
        entity_id=str(new_request.id),
        action="REQUEST_CREATED",
        user_id=current_user.id,
        new_value=json.dumps({"sku": payload.sku, "qty": payload.qty, "from": payload.from_store_id})
    ))
    await db.commit()
    
    return new_request

@router.get("/ist/pending", response_model=List[ISTRead])
async def list_pending_ist(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    List all pending IST requests where the current store is a party.
    """
    stmt = select(SmritiStockTransfer).where(
        or_(
            SmritiStockTransfer.from_store_id == current_user.store_id,
            SmritiStockTransfer.to_store_id == current_user.store_id
        ),
        SmritiStockTransfer.status == "PENDING"
    )
    res = await db.execute(stmt)
    return res.scalars().all()

@router.get("/{sku}/network-stock", response_model=List[NetworkStock])
async def get_network_stock(
    sku: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Look up stock for a specific SKU across the store network.
    In production, this queries the HQ-synced network cache.
    """
    # 1. Fetch other stores in the chain
    stmt = select(Chainstores).where(Chainstores.code != current_user.store_id)
    res = await db.execute(stmt)
    stores = res.scalars().all()
    
    # 2. Simulate/Fetch stock from other nodes (Relayed via HQ logic)
    # [MOCK] For Phase 6.2 demonstration
    import random
    network_results = []
    for s in stores:
        qty = random.randint(0, 50)
        doc = random.uniform(5, 45) if qty > 0 else 0
        tier = "HEALTHY" if doc > 20 else ("WARNING" if doc > 10 else "CRITICAL")
        
        network_results.append(NetworkStock(
            store_name=s.nm or f"Store {s.code}",
            store_code=s.code,
            on_hand=float(qty),
            doc=round(doc, 1),
            tier=tier,
            distance_km=random.uniform(2, 15)
        ))
        
    return network_results

@router.post("/sync-movements")
async def trigger_movement_sync(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Backfill movements from sales history."""
    from app.core.inventory.predictive import sync_movements_from_sales
    await sync_movements_from_sales(db, current_user.store_id)
    return {"status": "success", "message": "Movement log synchronized from sales history."}

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

@router.post("/bulk-update")
async def bulk_update_inventory(
    req: BulkUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Bulk Synchronizer: Updates authoritative Shoper 9 Itemmaster tables.
    """
    updated_count = 0
    created_count = 0
    for item_data in req.items:
        # Find the item by StockNo (id)
        stmt = select(Itemmaster).where(Itemmaster.stockno == item_data.id)
        result = await db.execute(stmt)
        item = result.scalar_one_or_none()
        
        if item:
            # UPDATE existing
            if item_data.item_name is not None: item.itemdesc = item_data.item_name
            if item_data.barcode is not None: item.sfield1 = item_data.barcode
            if item_data.brand is not None: item.class2cd = item_data.brand 
            if item_data.department is not None: item.class1cd = item_data.department
            if item_data.subclass1 is not None: item.subclass1cd = item_data.subclass1
            if item_data.colour is not None: item.subclass2cd = item_data.colour
            if item_data.size is not None: item.sizecd = item_data.size
            if item_data.mrp_paise is not None: item.retail_price = float(item_data.mrp_paise) / 100.0
            if item_data.sales_price is not None: item.saleprice = float(item_data.sales_price) / 100.0
            if item_data.cost_price is not None: item.currentcost = float(item_data.cost_price) / 100.0
            if item_data.hsn_code is not None: item.sfield2 = item_data.hsn_code
            updated_count += 1
        else:
            # CREATE new
            new_item = Itemmaster(
                stockno=item_data.id,
                itemdesc=item_data.item_name or "NEW ITEM",
                sfield1=item_data.barcode,
                class2cd=item_data.brand or "SMRITI",
                class1cd=item_data.department or "GENERAL",
                subclass1cd=item_data.subclass1,
                subclass2cd=item_data.colour,
                sizecd=item_data.size,
                retail_price=float(item_data.mrp_paise or 0) / 100.0,
                saleprice=float(item_data.sales_price or 0) / 100.0,
                currentcost=float(item_data.cost_price or 0) / 100.0,
                sfield2=item_data.hsn_code
            )
            db.add(new_item)
            created_count += 1
            
    await db.commit()
    return {
        "status": "success", 
        "updated_count": updated_count,
        "created_count": created_count,
        "message": f"Ledger Updated: {updated_count} existing items modified, {created_count} new items created."
    }
