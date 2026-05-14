# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Router : /masks  — Screen Schema & Rules Engine
# ============================================================
# Drives all POS/transaction screen layouts from sovereign S9
# config tables (AcceptDisplayDtls, 2,349 rows migrated).
#
# FIX: dispvisible stored as INTEGER 1 in PostgreSQL after
# migration from MSSQL BIT. Use .in_([True, 1]) not == True.
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, cast, Integer
from typing import List, Dict, Any, Optional
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Acceptdisplaydtls, LegacyPospaymodes

router = APIRouter(prefix="/masks", tags=["masks"])

# ── DataType → UI editor map ──────────────────────────────────────────────────
DATATYPE_MAP = {1: "text", 2: "number", 3: "float", 4: "date", 5: "boolean", 6: "dropdown", 7: "memo"}

# ── PosPaymodes.paymodetype → semantic name ──────────────────────────────────
PAYMODE_TYPE_NAMES = {1: "CASH", 2: "CARD", 3: "CHEQUE", 4: "UPI", 5: "GIFT_VOUCHER", 6: "WALLET"}


def _classify_field(col: str, acpt_datatype: Optional[int]) -> str:
    """Derive the best UI editor type from column name + datatype."""
    c = col.lower()
    if c in ("stockno", "barcode"):
        return "barcode"
    if c == "salespersoncd":
        return "staff_select"
    if "qty" in c:
        return "number"
    if any(x in c for x in ("rate", "value", "netvalue", "total", "amt", "amount", "tax", "disc")):
        return "readonly"
    if "date" in c or "dt" == c[-2:]:
        return "date"
    # fall back to S9 datatype hint
    return DATATYPE_MAP.get(acpt_datatype or 0, "text")


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 1: Entry Mask — Billing Grid Column Schema
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/entry")
async def get_entry_mask(
    trn_type: int = Query(..., description="Transaction type: 2100=Sales, 2200=Purchase, 1000=ItemMaster"),
    mode: str = Query("display", description="'display' (grid) or 'entry' (form)"),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Returns the field schema for any transaction screen.
    Driven by AcceptDisplayDtls (2,349 sovereign rows).

    FIX: Uses .in_([True, 1]) to handle MSSQL BIT → PostgreSQL INTEGER migration.
    Previously == True returned 0 rows, causing hardcoded 6-column fallback always firing.
    """
    # Choose visibility column based on mode
    vis_col = Acceptdisplaydtls.dispvisible if mode == "display" else Acceptdisplaydtls.acptvisible
    pos_col = Acceptdisplaydtls.disppos if mode == "display" else Acceptdisplaydtls.acptpos

    stmt = (
        select(Acceptdisplaydtls)
        .where(
            Acceptdisplaydtls.trntype == trn_type,
            # ── CRITICAL FIX: handle both Python True and integer 1 ──────────
            vis_col.in_([True, 1])
        )
        .order_by(pos_col)
    )

    result = await db.execute(stmt)
    rows = result.scalars().all()

    mask = []
    for row in rows:
        col = (row.columnname or "").strip()
        if not col:
            continue

        ui_type = _classify_field(col, row.acptdatatype)
        width = (row.dispwidth or 8) * 12 if mode == "display" else (row.acptwidth or 8) * 12
        pos   = row.disppos if mode == "display" else row.acptpos

        field_entry: Dict[str, Any] = {
            "field":       col,
            "headerName":  row.dispcap or row.acptcap or col,
            "type":        ui_type,
            "visible":     True,
            "mandatory":   bool(row.acptvisible) if row.acptvisible else False,
            "pos":         pos or 99,
            "width":       max(80, int(width)),
            "placeholder": f"Scan {col}" if ui_type == "barcode" else f"Enter {row.acptcap or col}",
            "isExtension": bool(row.fieldind and row.fieldind > 0),
        }

        # Attach lookup info if this field has a GenLookup dropdown
        if row.linkid and row.linkid > 0:
            field_entry["lookupRecid"] = row.linkid
            field_entry["type"] = "dropdown"
        elif col.lower() == "class1cd":
            field_entry["lookupRecid"] = 1
            field_entry["type"] = "dropdown"
        elif col.lower() == "class2cd":
            field_entry["lookupRecid"] = 2
            field_entry["type"] = "dropdown"

        # Attach FK table name (for custom lookups like Personnel, Customers)
        if row.custmtablename:
            field_entry["custmTable"] = row.custmtablename.lower()

        mask.append(field_entry)

    # ── Fallback: only if sovereign data is truly empty for this trntype ──────
    if not mask:
        FALLBACKS = {
            2100: [  # Sales POS
                {"field": "stockno",      "headerName": "Stock No",    "type": "barcode",   "visible": True, "mandatory": True,  "pos": 1, "width": 120},
                {"field": "itemdesc",     "headerName": "Description", "type": "readonly",  "visible": True, "mandatory": False, "pos": 2, "width": 280},
                {"field": "docqty",       "headerName": "Qty",         "type": "number",    "visible": True, "mandatory": True,  "pos": 3, "width": 80,  "min": 1},
                {"field": "docentrate",   "headerName": "Rate",        "type": "readonly",  "visible": True, "mandatory": False, "pos": 4, "width": 100},
                {"field": "discrate",     "headerName": "Disc %",      "type": "number",    "visible": True, "mandatory": False, "pos": 5, "width": 80,  "max": 100},
                {"field": "docentnetvalue","headerName": "Total",      "type": "readonly",  "visible": True, "mandatory": False, "pos": 6, "width": 110},
                {"field": "salespersoncd","headerName": "Salesperson", "type": "staff_select","visible": True,"mandatory": False,"pos": 7, "width": 140},
            ],
            2200: [  # Purchase
                {"field": "stockno",      "headerName": "Stock No",    "type": "barcode",   "visible": True, "mandatory": True,  "pos": 1, "width": 120},
                {"field": "itemdesc",     "headerName": "Description", "type": "readonly",  "visible": True, "mandatory": False, "pos": 2, "width": 280},
                {"field": "docqty",       "headerName": "Qty",         "type": "number",    "visible": True, "mandatory": True,  "pos": 3, "width": 80},
                {"field": "docentrate",   "headerName": "Rate",        "type": "number",    "visible": True, "mandatory": True,  "pos": 4, "width": 100},
                {"field": "docenttax",    "headerName": "Tax",         "type": "readonly",  "visible": True, "mandatory": False, "pos": 5, "width": 80},
                {"field": "docentnetvalue","headerName": "Net Value",  "type": "readonly",  "visible": True, "mandatory": False, "pos": 6, "width": 110},
            ],
        }
        return FALLBACKS.get(trn_type, FALLBACKS[2100])

    return mask


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 2: Visible Column Count (lightweight check)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/entry/count")
async def get_field_count(
    trn_type: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Returns how many visible fields are configured for a trntype in AD."""
    from sqlalchemy import func
    result = await db.execute(
        select(func.count()).where(
            Acceptdisplaydtls.trntype == trn_type,
            Acceptdisplaydtls.dispvisible.in_([True, 1])
        )
    )
    count = result.scalar() or 0
    return {
        "trntype": trn_type,
        "configured_fields": count,
        "source": "AcceptDisplayDtls (sovereign)" if count > 0 else "fallback (AD empty)",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 3: Payment Mode Config (from PosPaymodes — 4 rows migrated)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/paymodes")
async def get_paymode_config(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Returns configured payment modes from PosPaymodes (S9 sovereign table, 4 rows).
    Includes tenderRefElem captions — drives the CARD/UPI extra-field panels.
    """
    stmt = select(LegacyPospaymodes).where(
        LegacyPospaymodes.isenabled.in_([True, 1])
    ).order_by(LegacyPospaymodes.paymodetype)

    rows = (await db.execute(stmt)).scalars().all()

    result = []
    for row in rows:
        # Build tenderRefElem array (up to 10) — these are the extra capture fields
        # e.g. for CARD: tenderrefelem1cap="Card No", tenderrefelem2cap="Auth Code"
        tender_fields = []
        for i in range(1, 11):
            cap_attr  = f"tenderrefelem{i}cap"
            type_attr = f"tenderrefelem{i}type"
            cap  = getattr(row, cap_attr, None)
            etype = getattr(row, type_attr, None)
            if cap:
                tender_fields.append({
                    "index":      i,
                    "caption":    cap,
                    "type":       DATATYPE_MAP.get(etype or 1, "text"),
                    "fieldName":  f"ref{i}",  # maps to StkTrnAddlDtls capture
                })

        result.append({
            "paymodetype":  row.paymodetype,
            "paymodecd":    row.paymodecode,
            "label":        PAYMODE_TYPE_NAMES.get(row.paymodetype, f"Mode {row.paymodetype}"),
            "srlnoAppl":    bool(row.srlnoapplicable),
            "pctOfBill":    bool(row.percentageofbillamt),
            "tenderFields": tender_fields,
        })

    # If PosPaymodes is empty (not yet configured), return standard 3 modes
    if not result:
        return [
            {"paymodetype": 1, "paymodecd": "CASH", "label": "CASH",   "tenderFields": []},
            {"paymodetype": 2, "paymodecd": "CARD", "label": "CARD",   "tenderFields": [
                {"index": 1, "caption": "Card No",   "type": "text", "fieldName": "ref1"},
                {"index": 2, "caption": "Auth Code", "type": "text", "fieldName": "ref2"},
                {"index": 3, "caption": "Bank Name", "type": "text", "fieldName": "ref3"},
            ]},
            {"paymodetype": 4, "paymodecd": "UPI",  "label": "UPI",    "tenderFields": [
                {"index": 1, "caption": "UTR No",    "type": "text", "fieldName": "ref1"},
                {"index": 2, "caption": "UPI App",   "type": "text", "fieldName": "ref2"},
            ]},
        ]

    return result


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 4: Validation Rules
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/validation")
async def get_validation_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns business validation rules for the transaction."""
    return [
        {
            "rule_id": "VAL-001", "trigger": "on_item_add",
            "condition": {"type": "stock_zero"},
            "severity": "warn", "message": "Item is out of stock. Proceed?", "block": False
        },
        {
            "rule_id": "VAL-002", "trigger": "on_item_add",
            "condition": {"type": "qty_exceeds_stock"},
            "severity": "error", "message": "Requested quantity exceeds available stock.",
            "block": True, "field_key": "docqty"
        },
        {
            "rule_id": "VAL-003", "trigger": "on_discount",
            "condition": {"type": "disc_exceeds_limit"},
            "severity": "warn", "message": "Discount exceeds manager limit. PIN required.",
            "block": False, "requires_pin": True
        },
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 5: Hotkeys
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/hotkeys")
async def get_hotkey_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns institutional hotkey registry (from sovereign S9 HotKeys table — 29 rows migrated)."""
    # TODO: Read from hotkeys table (29 rows migrated) in next iteration
    return [
        {"hotkey_id": "HK-001", "key": "f8",     "label": "SETTLE",       "action": "settle_bill",           "variant": "primary", "visible": True, "order": 1},
        {"hotkey_id": "HK-002", "key": "f2",     "label": "CUST SEARCH",   "action": "open_customer_search",  "variant": "default", "visible": True, "order": 2},
        {"hotkey_id": "HK-003", "key": "ctrl+4", "label": "ADDONS",        "action": "open_addons",           "variant": "default", "visible": True, "order": 3},
        {"hotkey_id": "HK-004", "key": "f10",    "label": "AUDIT",         "action": "open_audit",            "variant": "default", "visible": True, "order": 4},
        {"hotkey_id": "HK-005", "key": "delete", "label": "VOID LINE",     "action": "void_line",             "variant": "danger",  "visible": True, "order": 5},
        {"hotkey_id": "HK-006", "key": "f3",     "label": "ITEM SEARCH",   "action": "open_item_search",      "variant": "default", "visible": True, "order": 6},
        {"hotkey_id": "HK-007", "key": "f5",     "label": "SUSPEND",       "action": "suspend_bill",          "variant": "default", "visible": True, "order": 7},
        {"hotkey_id": "HK-008", "key": "f6",     "label": "RECALL",        "action": "recall_bill",           "variant": "default", "visible": True, "order": 8},
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 6: Zone C (Right Panel — Summary + Payment Buttons)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/zone_c")
async def get_zone_c_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns Zone C (right billing panel) layout spec."""
    return {
        "customer_fields": [
            {"field_key": "name",        "label": "Name",        "visible": True, "order": 1},
            {"field_key": "code",        "label": "Code",        "visible": True, "order": 2},
            {"field_key": "loyalty_pts", "label": "Points",      "visible": True, "order": 3},
            {"field_key": "outstanding", "label": "Outstanding", "visible": True, "order": 4, "format": "currency", "highlight_if_nonzero": True},
        ],
        "summary_lines": [
            {"line_key": "gross",         "label": "Gross Total",    "visible": True, "order": 1, "is_total": False},
            {"line_key": "item_discount", "label": "Item Discount",  "visible": True, "order": 2, "is_total": False, "sign": "-"},
            {"line_key": "bill_discount", "label": "Bill Discount",  "visible": True, "order": 3, "is_total": False, "sign": "-"},
            {"line_key": "tax",           "label": "Tax (GST)",      "visible": True, "order": 4, "is_total": False, "sign": "+"},
            {"line_key": "roundoff",      "label": "Round Off",      "visible": True, "order": 5, "is_total": False},
            {"line_key": "net",           "label": "Net Payable",    "visible": True, "order": 6, "is_total": True},
        ],
        "payment_buttons": [
            {"mode": "CASH", "label": "CASH", "icon": "Wallet",     "hotkey": "f6", "paymodetype": 1},
            {"mode": "CARD", "label": "CARD", "icon": "CreditCard", "hotkey": "f7", "paymodetype": 2},
            {"mode": "UPI",  "label": "UPI",  "icon": "QrCode",     "hotkey": "f9", "paymodetype": 4},
        ],
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 7: Permissions
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/permissions")
async def get_permission_mask(
    trn_type: int = Query(...),
    current_user: CurrentUser = Depends(require_auth)
):
    """Returns sensitive action permissions for the transaction."""
    return [
        {"action": "void_bill",             "requires_pin": True,  "pin_role": "manager", "log_to_audit": True,  "block_if_denied": True},
        {"action": "price_override",        "requires_pin": True,  "pin_role": "manager", "log_to_audit": True,  "block_if_denied": True},
        {"action": "discount_exceeds_limit","requires_pin": True,  "pin_role": "manager", "log_to_audit": True,  "block_if_denied": False},
        {"action": "bill_discount_apply",   "requires_pin": False, "pin_role": None,       "log_to_audit": False, "block_if_denied": False},
    ]
