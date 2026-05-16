from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_

from app.core.database import get_db
from app.models.legacy_s9 import Itemmaster

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
async def compile_bulk_prn(payload: PrintPayload):
    # Dummy compile functionality
    total_labels = sum(item.qty for item in payload.items)
    print(f"Compiled {total_labels} labels using {payload.template}")
    return {"status": "success", "total_labels": total_labels, "message": "Spooling completed successfully"}
