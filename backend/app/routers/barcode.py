# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# Protocol: DB Sovereign v1.0 — No new tables. Shoper9 is truth.
# Barcode: stockno IS the scan key. No separate barcode table needed.
# ============================================================

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional, List
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.base import Store
from app.models.legacy_s9 import Itemmaster, Stockmaster

logger = logging.getLogger("smriti.barcode_router")
router = APIRouter(prefix="/barcodes", tags=["barcode"])


@router.get("/scan/{barcode}")
async def scan_barcode(
    barcode: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    HOT PATH: Resolve barcode / stockno to item details + live stock.
    In Shoper9, the stockno IS the barcode. This endpoint resolves both.
    Target: < 50ms via indexed stockno lookup.
    """
    # Direct Itemmaster lookup by stockno (Shoper9: stockno == barcode)
    item_res = await db.execute(
        select(Itemmaster).where(Itemmaster.stockno == barcode)
    )
    item = item_res.scalar_one_or_none()

    if not item:
        # Try partial match (some systems print truncated barcodes)
        item_res = await db.execute(
            select(Itemmaster).where(
                func.lower(Itemmaster.stockno).like(f"%{barcode.lower()}%")
            ).limit(1)
        )
        item = item_res.scalar_one_or_none()

    if not item:
        raise HTTPException(
            status_code=404,
            detail=f"Barcode/SKU '{barcode}' not found in Itemmaster."
        )

    # Live stock from Stockmaster
    stock_qty = await db.scalar(
        select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == item.stockno)
    )

    mrp_paise = 0
    if item.retail_price:
        try: mrp_paise = int(float(item.retail_price) * 100)
        except: pass

    return {
        "barcode": barcode,
        "barcode_type": "STOCKNO",
        "stock_no": item.stockno,
        "item_name": item.itemdesc or "Unknown",
        "brand": item.class1cd or "",
        "dept": item.deptcd or "",
        "subclass1": item.subclass1cd or "",
        "subclass2": item.subclass2cd or "",
        "colour": item.subclass2cd or "",
        "size": item.sizecd or "",
        "mrp_paise": mrp_paise,
        "qty_on_hand": float(stock_qty or 0),
        "in_stock": (stock_qty or 0) > 0
    }


@router.get("/scan-multi")
async def scan_multiple(
    barcodes: str,   # comma-separated
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Resolve multiple barcodes/stocknos in a single call.
    Useful for bulk validation before billing.
    """
    codes = [b.strip() for b in barcodes.split(",") if b.strip()]
    if not codes:
        return []

    # Batch fetch from Itemmaster
    items_res = await db.execute(
        select(Itemmaster).where(Itemmaster.stockno.in_(codes))
    )
    items = {i.stockno: i for i in items_res.scalars().all()}

    # Batch fetch from Stockmaster
    stock_res = await db.execute(
        select(Stockmaster.stockno, func.sum(Stockmaster.curbalqty).label("qty"))
        .where(Stockmaster.stockno.in_(codes))
        .group_by(Stockmaster.stockno)
    )
    stocks = {r.stockno: r.qty for r in stock_res.all()}

    results = []
    for code in codes:
        item = items.get(code)
        if not item:
            results.append({"stock_no": code, "found": False})
            continue

        mrp_paise = 0
        if item.retail_price:
            try: mrp_paise = int(float(item.retail_price) * 100)
            except: pass

        qty = stocks.get(code, 0)
        results.append({
            "stock_no": code,
            "found": True,
            "item_name": item.itemdesc or "Unknown",
            "brand": item.class1cd or "",
            "mrp_paise": mrp_paise,
            "qty_on_hand": float(qty or 0),
            "in_stock": (qty or 0) > 0
        })

    return results


@router.get("/item-info/{stockno}")
async def get_item_info(
    stockno: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Full item info from Itemmaster + Stockmaster for a given stockno.
    """
    item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
    item = item_res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {stockno} not found")

    # Stock breakdown by batch/grade/location
    matrix = await db.execute(text("""
        SELECT stockno, batchno, gradecd, locationcd, curbalqty
        FROM shoper9.stockmasterextd01
        WHERE stockno = :stockno
        ORDER BY batchno, gradecd, locationcd
    """), {"stockno": stockno})
    matrix_rows = matrix.mappings().all()

    total_stock = await db.scalar(
        select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == stockno)
    )

    mrp_paise = 0
    if item.retail_price:
        try: mrp_paise = int(float(item.retail_price) * 100)
        except: pass

    return {
        "stockno": item.stockno,
        "name": item.itemdesc,
        "brand": item.class1cd,
        "dept": item.deptcd,
        "subclass1": item.subclass1cd,
        "subclass2": item.subclass2cd,
        "size": item.sizecd,
        "mrp_paise": mrp_paise,
        "total_stock": float(total_stock or 0),
        "stock_matrix": [dict(r) for r in matrix_rows]
    }


@router.post("/print")
async def print_barcode(
    payload: dict,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Sovereign Print Engine — Hot Path.
    Resolves item from Itemmaster, generates ZPL, sends raw TCP to printer.
    
    Payload:
      - stock_no or barcode: item stockno
      - printer_ip: override printer IP (fallback to store config)
      - copies: number of labels (default 1)
      - template_id: optional custom Barcode Designer template ID
      - width_mm / height_mm: optional label dimensions
    """
    stockno = payload.get("stock_no") or payload.get("barcode")
    if not stockno:
        raise HTTPException(status_code=400, detail="stock_no is required")

    item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
    item = item_res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {stockno} not found")

    store = await db.get(Store, current_user.store_id)
    store_meta = getattr(store, "metadata_json", {}) or {}
    printer_ip = payload.get("printer_ip") or store_meta.get("label_printer_ip", "127.0.0.1")
    copies = int(payload.get("copies", 1))
    width_mm = float(payload.get("width_mm", 38.0))
    height_mm = float(payload.get("height_mm", 25.0))

    mrp_paise = 0
    if item.retail_price:
        try:
            mrp_paise = int(float(item.retail_price) * 100)
        except Exception:
            pass

    from app.services.barcode import print_barcode_label, print_from_template
    from app.models.sovereign import SmritiBarcodeTemplate

    try:
        # If a custom template_id is provided, use the designer layout
        template_id = payload.get("template_id")
        if template_id:
            tpl_res = await db.execute(
                select(SmritiBarcodeTemplate).where(SmritiBarcodeTemplate.id == template_id)
            )
            tpl = tpl_res.scalar_one_or_none()
            if tpl:
                item_data = {
                    "sku": item.stockno,
                    "name": item.itemdesc or "",
                    "mrp": mrp_paise / 100.0,
                    "class1": getattr(item, "class1cd", "") or "",
                    "class2": getattr(item, "class2cd", "") or "",
                    "barcode": item.stockno,
                    "size": getattr(item, "sizecd", "") or "",
                    "colour": getattr(item, "subclass2cd", "") or "",
                    "hsn_code": getattr(item, "hsncd", "") or "",
                    "store_name": store.name if store else "",
                }
                success = print_from_template(
                    layout_json=tpl.layout_json,
                    item_data=item_data,
                    printer_ip=printer_ip,
                    width_mm=tpl.width_mm,
                    height_mm=tpl.height_mm,
                    copies=copies,
                )
                return {"printed": copies if success else 0, "barcode": item.stockno, "mode": "template"}

        # Default: standard fast-path ZPL label
        success = print_barcode_label(
            barcode=item.stockno,
            barcode_type="CODE128",
            item_name=item.itemdesc or "",
            mrp_paise=mrp_paise,
            size=getattr(item, "sizecd", "") or "",
            colour=getattr(item, "subclass2cd", "") or "",
            hsn_code=getattr(item, "hsncd", "") or "",
            store_name=store.name if store else "",
            printer_ip=printer_ip,
            copies=copies,
            width_mm=width_mm,
            height_mm=height_mm,
        )
        return {"printed": copies if success else 0, "barcode": item.stockno, "mode": "standard"}

    except Exception as e:
        logger.error(f"[SMRITI-PRINT] Exception: {e}")
        return {"printed": 0, "barcode": item.stockno, "error": str(e)}

class PrintBatchItem(BaseModel):
    stock_no: str
    copies: int = 1

class PrintBatchRequest(BaseModel):
    items: List[PrintBatchItem]
    printer_ip: Optional[str] = None
    template_id: Optional[int] = None
    raw_prn_template: Optional[str] = None
    width_mm: float = 38.0
    height_mm: float = 25.0

@router.post("/print-batch")
async def print_barcode_batch(
    req: PrintBatchRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Sovereign Print Engine — Batch Mode.
    Resolves multiple items, generates concatenated ZPL, and sends raw TCP in a single socket session.
    """
    if not req.items:
        raise HTTPException(status_code=400, detail="items list cannot be empty")

    store = await db.get(Store, current_user.store_id)
    store_meta = getattr(store, "metadata_json", {}) or {}
    printer_ip = req.printer_ip or store_meta.get("label_printer_ip", "127.0.0.1")

    from app.services.barcode import build_zpl_simple, build_zpl_from_layout, send_zpl_to_printer, process_raw_template
    from app.models.sovereign import SmritiBarcodeTemplate

    tpl = None
    if req.template_id:
        tpl_res = await db.execute(
            select(SmritiBarcodeTemplate).where(SmritiBarcodeTemplate.id == req.template_id)
        )
        tpl = tpl_res.scalar_one_or_none()

    full_zpl = ""
    printed_count = 0
    errors = []

    for job in req.items:
        stockno = job.stock_no
        item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
        item = item_res.scalar_one_or_none()
        
        if not item:
            errors.append({"stock_no": stockno, "error": "Not found"})
            continue
            
        mrp_paise = 0
        if item.retail_price:
            try: mrp_paise = int(float(item.retail_price) * 100)
            except Exception: pass
            
        try:
            if req.raw_prn_template:
                item_data = {
                    "ITEM_NAME": item.itemdesc or "",
                    "MRP": mrp_paise / 100.0,
                    "BARCODE": item.stockno,
                    "SIZE": getattr(item, "sizecd", "") or "",
                    "COLOUR": getattr(item, "subclass2cd", "") or "",
                    "HSN": getattr(item, "hsncd", "") or "",
                    "STORE": store.name if store else "",
                }
                # PRN files use dynamic injection, so we duplicate it per copy
                zpl_bytes = process_raw_template(req.raw_prn_template, item_data)
                zpl = zpl_bytes.decode('utf-8')
                for _ in range(job.copies):
                    full_zpl += zpl + "\n"
                printed_count += job.copies
            elif tpl:
                item_data = {
                    "sku": item.stockno,
                    "name": item.itemdesc or "",
                    "mrp": mrp_paise / 100.0,
                    "class1": getattr(item, "class1cd", "") or "",
                    "class2": getattr(item, "class2cd", "") or "",
                    "barcode": item.stockno,
                    "size": getattr(item, "sizecd", "") or "",
                    "colour": getattr(item, "subclass2cd", "") or "",
                    "hsn_code": getattr(item, "hsncd", "") or "",
                    "store_name": store.name if store else "",
                }
                zpl = build_zpl_from_layout(
                    layout_json=tpl.layout_json,
                    item_data=item_data,
                    width_mm=tpl.width_mm if tpl.width_mm else req.width_mm,
                    height_mm=tpl.height_mm if tpl.height_mm else req.height_mm,
                    copies=job.copies,
                )
                full_zpl += zpl + "\n"
                printed_count += job.copies
            else:
                zpl = build_zpl_simple(
                    barcode=item.stockno,
                    barcode_type="CODE128",
                    item_name=item.itemdesc or "",
                    mrp_rupees=mrp_paise / 100.0,
                    size=getattr(item, "sizecd", "") or "",
                    colour=getattr(item, "subclass2cd", "") or "",
                    hsn_code=getattr(item, "hsncd", "") or "",
                    store_name=store.name if store else "",
                    width_mm=req.width_mm,
                    height_mm=req.height_mm,
                    copies=job.copies,
                )
                full_zpl += zpl + "\n"
                printed_count += job.copies
        except Exception as e:
            errors.append({"stock_no": stockno, "error": str(e)})

    if full_zpl:
        success = send_zpl_to_printer(full_zpl, printer_ip)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send to printer")

    return {
        "printed": printed_count,
        "dispatched_items": len(req.items) - len(errors),
        "errors": errors
    }
