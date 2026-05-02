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

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import Optional, List

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.base import Store
from app.models.legacy_s9 import Itemmaster, Stockmaster

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
    Print barcode label for a stockno.
    Resolves item details from Itemmaster for label data.
    """
    stockno = payload.get("stock_no") or payload.get("barcode")
    if not stockno:
        raise HTTPException(status_code=400, detail="stock_no is required")

    item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
    item = item_res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {stockno} not found")

    store = await db.get(Store, current_user.store_id)
    printer_ip = payload.get("printer_ip") or (
        store.metadata_json.get("label_printer_ip", "127.0.0.1") if store else "127.0.0.1"
    )
    copies = payload.get("copies", 1)

    mrp_paise = 0
    if item.retail_price:
        try: mrp_paise = int(float(item.retail_price) * 100)
        except: pass

    try:
        from app.services.barcode import print_barcode_label
        success_count = 0
        for _ in range(copies):
            if print_barcode_label(
                barcode=item.stockno,
                barcode_type="CODE128",
                item_name=item.itemdesc or "",
                mrp_paise=mrp_paise,
                size=item.sizecd or "",
                colour=item.subclass2cd or "",
                hsn_code=getattr(item, "hsncd", ""),
                store_name=store.name if store else "",
                printer_ip=printer_ip
            ):
                success_count += 1
        return {"printed": success_count, "barcode": item.stockno}
    except Exception as e:
        return {"printed": 0, "barcode": item.stockno, "error": str(e)}
