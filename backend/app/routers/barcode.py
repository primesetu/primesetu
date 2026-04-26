/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text, func
from uuid import UUID
import random

from app.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.base import ItemBarcode, Item, Store
from app.schemas.barcode import BarcodeResponse, BarcodeGenerateRequest

router = APIRouter(prefix="/barcodes", tags=["barcode"])

@router.get("/scan/{barcode}", response_model=BarcodeResponse)
async def scan_barcode(
    barcode: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    HOT PATH: Resolve barcode to item details + resolved stock.
    Target: < 50ms.
    """
    result = await db.execute(
        text("""
            SELECT
                ib.barcode, ib.barcode_type, ib.size, ib.colour,
                i.id AS item_id, i.item_code, i.item_name,
                i.mrp_paise, i.gst_rate, i.hsn_code,
                COALESCE(s.qty_on_hand, 0) AS qty_on_hand
            FROM public.item_barcodes ib
            JOIN public.items i ON i.id = ib.item_id
            LEFT JOIN public.item_stock s
                ON s.item_id = ib.item_id
                AND s.store_id = ib.store_id
                AND (ib.size IS NULL OR s.size = ib.size)
                AND (ib.colour IS NULL OR s.colour = ib.colour)
            WHERE ib.store_id = :store_id
              AND ib.barcode = :barcode
              AND ib.is_active = true
            LIMIT 1
        """),
        {"store_id": current_user.store_id, "barcode": barcode}
    )
    item = result.mappings().first()
    if not item:
        raise HTTPException(
            status_code=404, 
            detail=f"Barcode '{barcode}' not found."
        )
    return dict(item)

@router.post("/generate-internal")
async def generate_internal_barcode(
    payload: BarcodeGenerateRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate an internal CODE128 barcode.
    Format: {store_prefix}{item_seq:06d}{size_code}
    """
    # 1. Verify item exists
    item = await db.get(Item, payload.item_id)
    if not item or item.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. Check if variant already has a barcode
    existing = await db.execute(
        select(ItemBarcode).where(
            ItemBarcode.store_id == current_user.store_id,
            ItemBarcode.item_id == payload.item_id,
            ItemBarcode.size == payload.size,
            ItemBarcode.colour == payload.colour,
            ItemBarcode.is_active == True
        )
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=409, 
            detail="Barcode already exists for this variant."
        )

    # 3. Get Store Prefix (default to store_id's first 3 chars if not in metadata)
    store = await db.get(Store, current_user.store_id)
    store_prefix = store.metadata_json.get("barcode_prefix", str(store.id)[:3].upper())

    # 4. Get Item Sequence for this store
    count_res = await db.execute(
        select(func.count(Item.id)).where(Item.store_id == current_user.store_id)
    )
    item_seq = count_res.scalar() or 1
    
    # 5. Size Code (First 2 chars of size, or 'XX')
    size_code = (payload.size[:2].upper() if payload.size else "XX")

    # Final Format: {PREFIX}{000001}{SIZE}
    barcode = f"{store_prefix}{item_seq:06d}{size_code}"

    # 6. Save
    new_barcode = ItemBarcode(
        store_id=current_user.store_id,
        item_id=payload.item_id,
        barcode=barcode,
        barcode_type="CODE128",
        size=payload.size,
        colour=payload.colour,
        is_primary=payload.is_primary
    )
    db.add(new_barcode)
    await db.commit()
    
    return {"barcode": barcode, "type": "CODE128"}

@router.post("/generate-ean13")
async def generate_ean13_for_item(
    payload: BarcodeGenerateRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a GS1-compliant EAN-13 for an item/variant.
    """
    from app.services.barcode import generate_ean13
    
    # 1. Verify item
    item = await db.get(Item, payload.item_id)
    if not item or item.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Item not found")

    # 2. Get GS1 prefix from store metadata or use default dummy
    store = await db.get(Store, current_user.store_id)
    gs1_prefix = store.metadata_json.get("gs1_company_prefix", "8901234") # Dummy default for India
    
    # 3. Get next sequence
    count_res = await db.execute(
        select(func.count(ItemBarcode.id)).where(ItemBarcode.store_id == current_user.store_id, ItemBarcode.barcode_type == "EAN13")
    )
    next_ref = (count_res.scalar() or 0) + 1
    
    # 4. Generate
    digits_12 = (gs1_prefix + str(next_ref).zfill(12 - len(gs1_prefix)))[:12]
    barcode = generate_ean13(digits_12)

    # 5. Save
    new_barcode = ItemBarcode(
        store_id=current_user.store_id,
        item_id=payload.item_id,
        barcode=barcode,
        barcode_type="EAN13",
        size=payload.size,
        colour=payload.colour,
        is_primary=payload.is_primary
    )
    db.add(new_barcode)
    await db.commit()
    return {"barcode": barcode, "type": "EAN13"}

@router.post("/print")
async def print_barcode(
    payload: BarcodePrintRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Print barcode label(s)."""
    from app.services.barcode import print_barcode_label
    
    # Resolve item details
    result = await db.execute(
        select(ItemBarcode, Item).join(Item, Item.id == ItemBarcode.item_id).where(
            ItemBarcode.store_id == current_user.store_id,
            ItemBarcode.barcode == payload.barcode
        )
    )
    data = result.first()
    if not data:
        raise HTTPException(status_code=404, detail="Barcode not found")
    
    ib, item = data
    
    # Use provided IP or look up store printer
    store = await db.get(Store, current_user.store_id)
    printer_ip = payload.printer_ip or store.metadata_json.get("label_printer_ip", "127.0.0.1")

    from app.services.barcode import print_barcode_label, process_raw_template
    from app.utils.currency import format_currency
    
    success_count = 0
    
    if payload.custom_template:
        # Resolve Raw Template Data
        raw_data = {
            "ITEM_NAME": item.item_name,
            "ITEM_CODE": item.item_code,
            "MRP": format_currency(item.mrp_paise),
            "BARCODE": ib.barcode,
            "SIZE": ib.size or "-",
            "COLOUR": ib.colour or "-",
            "STORE_NAME": store.name
        }
        processed_commands = process_raw_template(payload.custom_template, raw_data)
        
        # Simulate or send raw commands
        print(f"[RAW-TEMPLATE] Sending {len(processed_commands)} bytes to {printer_ip}")
        success_count = payload.copies
    else:
        # Use Structured Shoper9 Generator
        for _ in range(payload.copies):
            if print_barcode_label(
                barcode=ib.barcode,
                barcode_type=ib.barcode_type,
                item_name=item.item_name,
                mrp_paise=item.mrp_paise,
                size=ib.size,
                colour=ib.colour,
                hsn_code=item.hsn_code,
                store_name=store.name,
                printer_ip=printer_ip
            ):
                success_count += 1
            
    return {"printed": success_count, "barcode": ib.barcode}

@router.post("/bulk-import")
async def bulk_import_barcodes(
    payload: List[BulkImportItem],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Bulk import barcodes for items."""
    from app.services.barcode import validate_ean13
    
    stats = {"imported": 0, "skipped": 0, "errors": []}
    
    for item_data in payload:
        # Validate EAN13 if type is EAN13
        if item_data.barcode_type == "EAN13" and not validate_ean13(item_data.barcode):
            stats["errors"].append(f"Invalid EAN-13: {item_data.barcode}")
            continue
            
        # Resolve item_id from item_code
        item_res = await db.execute(select(Item).where(Item.store_id == current_user.store_id, Item.item_code == item_data.item_code))
        item = item_res.scalar_one_or_none()
        if not item:
            stats["errors"].append(f"Item not found: {item_data.item_code}")
            continue
            
        # Check duplicate
        exists_res = await db.execute(select(ItemBarcode).where(ItemBarcode.store_id == current_user.store_id, ItemBarcode.barcode == item_data.barcode))
        if exists_res.scalar_one_or_none():
            stats["skipped"] += 1
            continue
            
        new_ib = ItemBarcode(
            store_id=current_user.store_id,
            item_id=item.id,
            barcode=item_data.barcode,
            barcode_type=item_data.barcode_type,
            size=item_data.size,
            colour=item_data.colour
        )
        db.add(new_ib)
        stats["imported"] += 1
        
    await db.commit()
    return stats
