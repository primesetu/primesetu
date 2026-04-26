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
from sqlalchemy import select, text
from uuid import UUID
import random

from app.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.base import ItemBarcode, Item
from app.schemas.barcode import BarcodeResponse, BarcodeGenerateRequest
from app.services.barcode import generate_ean13

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

@router.post("/generate-ean13")
async def generate_ean13_for_item(
    payload: BarcodeGenerateRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a GS1-compliant EAN-13 for an item variant.
    Uses store prefix + random sequence for internal EANs.
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

    # 3. Generate internal EAN-13
    # Format: 890 (India) + StoreSeq(5) + ItemSeq(4) + CheckDigit
    # For now, simplified random 12-digit base
    while True:
        digits_12 = f"890{random.randint(100000000, 999999999)}"
        barcode = generate_ean13(digits_12)
        
        # Check uniqueness
        dup = await db.execute(
            select(ItemBarcode).where(
                ItemBarcode.store_id == current_user.store_id,
                ItemBarcode.barcode == barcode
            )
        )
        if not dup.scalar_one_or_none():
            break

    # 4. Save
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
