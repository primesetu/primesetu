# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Acceptdisplaydtls

router = APIRouter(prefix="/masks", tags=["masks"])

@router.get("/entry")
async def get_entry_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the field entry mask for the billing grid.
    Derived from Shoper9's AcceptDisplayDtls.
    """
    stmt = select(Acceptdisplaydtls).where(
        Acceptdisplaydtls.trntype == trn_type,
        Acceptdisplaydtls.dispvisible == True
    ).order_by(Acceptdisplaydtls.disppos)
    
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    mask = []
    for row in rows:
        field_type = "text"
        if "qty" in row.columnname.lower(): field_type = "number"
        elif "rate" in row.columnname.lower() or "amt" in row.columnname.lower() or "total" in row.columnname.lower(): field_type = "readonly"
        elif "disc" in row.columnname.lower(): field_type = "number"
        elif "salesstaff" in row.columnname.lower(): field_type = "staff_select"
        elif "stockno" in row.columnname.lower(): field_type = "barcode"

        mask.append({
            "field": row.columnname,
            "headerName": row.dispcap or row.acptcap or row.columnname,
            "type": field_type,
            "visible": True,
            "pos": row.disppos,
            "width": (row.dispwidth * 12) if row.dispwidth else 100, # Increased multiplier for modern high-res screens
            "placeholder": f"Enter {row.dispcap or row.columnname}",
            "mandatory": True if row.acptvisible else False
        })
    
    # If no mask found, return a default billing mask for 2100 (Sales)
    if not mask:
        return [
            {"field": "barcode", "headerName": "Barcode", "type": "barcode", "visible": True, "pos": 1, "width": 150, "placeholder": "Scan Item..."},
            {"field": "description", "headerName": "Item Description", "type": "readonly", "visible": True, "pos": 2, "width": 300},
            {"field": "qty", "headerName": "Qty", "type": "number", "visible": True, "pos": 3, "width": 80, "min": 1},
            {"field": "rate", "headerName": "Rate", "type": "readonly", "visible": True, "pos": 4, "width": 100},
            {"field": "disc_per", "headerName": "Disc %", "type": "number", "visible": True, "pos": 5, "width": 80, "max": 100},
            {"field": "total", "headerName": "Total", "type": "readonly", "visible": True, "pos": 6, "width": 120}
        ]
        
    return mask

@router.get("/validation")
async def get_validation_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns business validation rules for the transaction."""
    return [
        {
            "rule_id": "VAL-001",
            "trigger": "on_item_add",
            "condition": {"type": "stock_zero"},
            "severity": "warn",
            "message": "Item is out of stock. Proceed?",
            "block": False
        },
        {
            "rule_id": "VAL-002",
            "trigger": "on_item_add",
            "condition": {"type": "qty_exceeds_stock"},
            "severity": "error",
            "message": "Requested quantity exceeds available stock.",
            "block": True,
            "field_key": "qty"
        }
    ]

@router.get("/hotkeys")
async def get_hotkey_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns institutional hotkey registry."""
    return [
        {"hotkey_id": "HK-001", "key": "f8", "label": "SETTLE", "action": "settle_bill", "variant": "primary", "visible": True, "order": 1, "enabled": True},
        {"hotkey_id": "HK-002", "key": "f2", "label": "CUST SEARCH", "action": "open_customer_search", "variant": "default", "visible": True, "order": 2, "enabled": True},
        {"hotkey_id": "HK-003", "key": "ctrl+4", "label": "ADDONS", "action": "open_addons", "variant": "default", "visible": True, "order": 3, "enabled": True},
        {"hotkey_id": "HK-004", "key": "f10", "label": "AUDIT", "action": "open_audit", "variant": "default", "visible": True, "order": 4, "enabled": True},
        {"hotkey_id": "HK-005", "key": "delete", "label": "VOID LINE", "action": "void_line", "variant": "danger", "visible": True, "order": 5, "enabled": True}
    ]

@router.get("/zone_c")
async def get_zone_c_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns Zone C (Right Panel) layout."""
    return {
        "customer_fields": [
            {"field_key": "name", "label": "Name", "visible": True, "order": 1},
            {"field_key": "code", "label": "Code", "visible": True, "order": 2},
            {"field_key": "outstanding", "label": "Outstanding", "visible": True, "order": 3, "format": "currency", "highlight_if_nonzero": True}
        ],
        "summary_lines": [
            {"line_key": "gross", "label": "Gross Total", "visible": True, "order": 1, "is_total": False},
            {"line_key": "item_discount", "label": "Item Discount", "visible": True, "order": 2, "is_total": False, "sign": "-"},
            {"line_key": "bill_discount", "label": "Bill Discount", "visible": True, "order": 3, "is_total": False, "sign": "-"},
            {"line_key": "tax", "label": "Tax Amount", "visible": True, "order": 4, "is_total": False, "sign": "+"},
            {"line_key": "roundoff", "label": "Round Off", "visible": True, "order": 5, "is_total": False},
            {"line_key": "net", "label": "Net Payable", "visible": True, "order": 6, "is_total": True}
        ],
        "payment_buttons": [
            {"mode": "CASH", "label": "CASH", "icon": "Wallet", "hotkey": "f6"},
            {"mode": "CARD", "label": "CARD", "icon": "CreditCard", "hotkey": "f7"},
            {"mode": "UPI", "label": "UPI", "icon": "QrCode", "hotkey": "f9"}
        ]
    }

@router.get("/permissions")
async def get_permission_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns sensitive action permissions."""
    return [
        {"action": "void_bill", "requires_pin": True, "pin_role": "manager", "log_to_audit": True, "block_if_denied": True},
        {"action": "price_override", "requires_pin": True, "pin_role": "manager", "log_to_audit": True, "block_if_denied": True},
        {"action": "discount_exceeds_limit", "requires_pin": True, "pin_role": "manager", "log_to_audit": True, "block_if_denied": False}
    ]
