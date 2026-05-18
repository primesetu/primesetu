from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.core.database import get_db
from app.models.legacy_s9 import Itemmaster
from app.services.barcode import build_zpl_simple, send_zpl_to_printer, process_raw_template
from app.models.base import Store
from app.core.security import require_auth, CurrentUser

router = APIRouter()

class FetchCriteria(BaseModel):
    mode: str
    criteria: Dict[str, Any]

class PrintItem(BaseModel):
    code: str
    name: str
    mrp: float
    qty: int

class PrintPayload(BaseModel):
    template: str
    items: List[PrintItem]

@router.post("/fetch-matrix")
async def fetch_matrix(
    payload: FetchCriteria,
    db: AsyncSession = Depends(get_db)
):
    mode = payload.mode
    criteria = payload.criteria
    
    if mode == 'Manual Selection':
        query = select(Itemmaster).limit(50)
        
        # Apply filters
        stock_no = criteria.get('stockNo')
        if stock_no:
            query = query.where(Itemmaster.stockno.ilike(f"%{stock_no}%"))
            
        product = criteria.get('product')
        if product:
            query = query.where(Itemmaster.class1cd.ilike(f"%{product}%"))
            
        brand = criteria.get('brand')
        if brand:
            query = query.where(Itemmaster.class2cd.ilike(f"%{brand}%"))
            
        article = criteria.get('article')
        if article:
            query = query.where(Itemmaster.subclass1cd.ilike(f"%{article}%"))
            
        color = criteria.get('color')
        if color:
            query = query.where(Itemmaster.subclass2cd.ilike(f"%{color}%"))
            
        size = criteria.get('size')
        if size:
            query = query.where(Itemmaster.sizecd.ilike(f"%{size}%"))
            
        result = await db.execute(query)
        rows = result.scalars().all()
        
        data = []
        for i, r in enumerate(rows):
            # Construct a human readable name
            name_parts = [p for p in [r.class1cd, r.class2cd, r.subclass1cd] if p]
            name = " ".join(name_parts) if name_parts else f"Item {r.stockno}"
            
            data.append({
                "id": str(i),
                "code": r.stockno,
                "name": name,
                "mrp": float(r.retail_price or r.finalmrp or 0.0),
                "printQty": 0
            })
            
        return data

    elif mode == 'Against Purchase Order':
        dummy_data = [
            {"id": "3", "code": "PO-ITM-01", "name": f"PO Item ({criteria.get('prefix', 'PO')})", "mrp": 2999.00, "printQty": 5},
            {"id": "4", "code": "PO-ITM-02", "name": "Bulk Purchase Accessory", "mrp": 499.00, "printQty": 10},
        ]
        return dummy_data
    elif mode == 'Against Transactions':
        dummy_data = [
            {"id": "5", "code": "TXN-ITM-99", "name": f"Txn Item ({criteria.get('prefix', 'TXN')})", "mrp": 999.00, "printQty": 2},
        ]
        return dummy_data
    elif mode == 'Against Direct Scan':
        dummy_data = [
            {"id": "6", "code": criteria.get('stockNo', 'SCANNED-01'), "name": "Direct Scanned Article", "mrp": 1299.00, "printQty": criteria.get('qty', 1)},
        ]
        return dummy_data
    elif mode == 'Against Masters':
        query = select(Itemmaster).limit(100)
        from_date = criteria.get('fromDate')
        to_date = criteria.get('toDate')
        
        if from_date:
            query = query.where(Itemmaster.dateinsert >= from_date)
        if to_date:
            query = query.where(Itemmaster.dateinsert <= to_date)
            
        result = await db.execute(query)
        rows = result.scalars().all()
        
        data = []
        for i, r in enumerate(rows):
            name_parts = [p for p in [r.class1cd, r.class2cd, r.subclass1cd] if p]
            name = " ".join(name_parts) if name_parts else f"Item {r.stockno}"
            data.append({
                "id": f"m-{i}",
                "code": r.stockno,
                "name": name,
                "mrp": float(r.retail_price or r.finalmrp or 0.0),
                "printQty": 1 # For Masters, we usually want at least 1 by default
            })
        return data

    elif mode == 'Against Purchase (PT File)':
        # Dummy data for PT file as it requires file parsing logic
        dummy_data = [
            {"id": "pt-1", "code": "PT-001", "name": "PT File Item 1", "mrp": 1000.00, "printQty": 1},
            {"id": "pt-2", "code": "PT-002", "name": "PT File Item 2", "mrp": 2000.00, "printQty": 1},
        ]
        return dummy_data
        
    return []

class LookupCriteria(BaseModel):
    field: str
    value: str

@router.post("/lookup-criteria")
async def lookup_criteria(
    payload: LookupCriteria,
    db: AsyncSession = Depends(get_db)
):
    field = payload.field
    val = payload.value.strip()
    
    if len(val) < 1:
        return []
        
    # Map frontend fields to ItemMaster columns:
    # stockNo -> stockno
    # product -> class1cd
    # brand -> class2cd
    # article -> subclass1cd
    # color -> subclass2cd
    # size -> sizecd
    
    query = select(Itemmaster).limit(15)
    
    if field == 'stockNo':
        query = query.where(Itemmaster.stockno.ilike(f"%{val}%"))
    elif field == 'article':
        query = query.where(Itemmaster.subclass1cd.ilike(f"%{val}%"))
    elif field == 'product':
        query = query.where(Itemmaster.class1cd.ilike(f"%{val}%"))
    elif field == 'brand':
        query = query.where(Itemmaster.class2cd.ilike(f"%{val}%"))
    else:
        return []
        
    result = await db.execute(query)
    rows = result.scalars().all()
    
    suggestions = []
    seen = set()
    
    for r in rows:
        s = {
            "stockNo": r.stockno or "",
            "product": r.class1cd or "",
            "brand": r.class2cd or "",
            "article": r.subclass1cd or "",
            "color": r.subclass2cd or "",
            "size": r.sizecd or ""
        }
        
        # Deduplicate based on the searched field to prevent spamming identical suggestions
        key = s.get(field, "")
        if key and key not in seen:
            seen.add(key)
            suggestions.append(s)
            
    return suggestions

@router.post("/compile-bulk-prn")
async def compile_bulk_prn(
    payload: PrintPayload,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="items list cannot be empty")

    store = await db.get(Store, current_user.store_id)
    store_meta = getattr(store, "metadata_json", {}) or {}
    printer_ip = store_meta.get("label_printer_ip", "127.0.0.1")

    full_zpl = ""
    printed_count = 0
    errors = []

    for job in payload.items:
        if job.qty <= 0:
            continue
            
        stockno = job.code
        item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
        item = item_res.scalar_one_or_none()
        
        if not item:
            errors.append({"stock_no": stockno, "error": "Not found in Itemmaster"})
            continue
            
        try:
            # Handle Raw PRN Template vs Simple ZPL
            if payload.template and payload.template.startswith("^"):
                item_data = {
                    "ITEM_NAME": item.itemdesc or job.name,
                    "MRP": job.mrp,
                    "BARCODE": item.stockno,
                    "SIZE": getattr(item, "sizecd", "") or "",
                    "COLOUR": getattr(item, "subclass2cd", "") or "",
                    "HSN": getattr(item, "analcode32", "") or "",
                    "STORE": store.name if store else "",
                }
                zpl_bytes = process_raw_template(payload.template, item_data)
                zpl = zpl_bytes.decode('utf-8')
                for _ in range(job.qty):
                    full_zpl += zpl + "\n"
                printed_count += job.qty
            else:
                zpl = build_zpl_simple(
                    barcode=item.stockno,
                    barcode_type="CODE128",
                    item_name=item.itemdesc or job.name,
                    mrp_rupees=job.mrp,
                    size=getattr(item, "sizecd", "") or "",
                    colour=getattr(item, "subclass2cd", "") or "",
                    hsn_code=getattr(item, "analcode32", "") or "",
                    store_name=store.name if store else "",
                    width_mm=38.0,
                    height_mm=25.0,
                    copies=job.qty,
                )
                full_zpl += zpl + "\n"
                printed_count += job.qty
        except Exception as e:
            errors.append({"stock_no": stockno, "error": str(e)})

    if full_zpl:
        success = send_zpl_to_printer(full_zpl, printer_ip)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send ZPL spool to printer socket")

    return {
        "status": "success", 
        "total_labels": printed_count, 
        "message": f"Spooling {printed_count} labels to {printer_ip} completed successfully",
        "errors": errors
    }
