# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Router : /lookup  — Universal SmritiScreen Engine
# ============================================================
# Drives all UI screens purely from migrated S9 tables.
# No new tables created — uses existing sovereign data.
#
# Endpoints:
#   GET /lookup/{recid}                → GenLookup options
#   GET /lookup/by-name/{field_name}   → Same, by semantic name
#   GET /lookup/schema/fields          → Full screen schema (AcceptDisplayDtls)
#   GET /lookup/schema/payfields       → Payment extra fields (PaymodeAcceptDisplayDtls)
#   GET /lookup/schema/tillfields      → Day-open/close fields (TillAcceptDisplayDtls)
#   GET /lookup/schema/captions        → Field captions for any trntype
#   GET /lookup/meta/recid-map         → RecID reference map
#   GET /lookup/meta/trntypes          → All transaction type names
# ============================================================

from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, distinct
from typing import Optional, List
from app.core.database import get_db
from app.models import (
    Genlookup, Genlookupextd,
    Acceptdisplaydtls,
    Paymodeacceptdisplaydtls,
    Tillacceptdisplaydtls,
)

router = APIRouter(prefix="/lookup", tags=["lookup"])

# ── RecID → Semantic field name ───────────────────────────────────────────────
RECID_NAMES: dict[int, str] = {
    1:    "class1",
    2:    "class2",
    51:   "superclass1",
    52:   "superclass2",
    53:   "sizegroup",
    54:   "prodtaxtype",
    65:   "analcode1",
    66:   "analcode2",
    67:   "analcode3",
    68:   "analcode4",
    69:   "analcode5",
    70:   "analcode6",
    7000: "analcode7",
    7001: "analcode8",
    7002: "analcode9",
    7003: "analcode10",
    7004: "analcode11",
    7005: "analcode12",
    7006: "analcode13",
    7007: "analcode14",
    7008: "analcode15",
    7009: "analcode16",
    7010: "analcode17",
    7011: "analcode18",
    7012: "analcode19",
    7013: "analcode20",
    7014: "analcode21",
    7015: "analcode22",
    7016: "analcode23",
    7017: "analcode24",
    7018: "analcode25",
    7019: "analcode26",
    7020: "analcode27",
    7021: "analcode28",
    7022: "analcode29",
    7023: "analcode30",
    7024: "analcode31",
    7025: "analcode32",
    92:   "state_code",     # Indian State codes (for GST)
    101:  "trntype",
}

# Reverse map: field name → recid
ANALCODE_RECID: dict[str, int] = {v: k for k, v in RECID_NAMES.items()}

# S9 acptdatatype → Smriti UI editor type
DATATYPE_MAP: dict[int, str] = {
    1: "text",
    2: "number",
    3: "float",
    4: "date",
    5: "boolean",
    6: "dropdown",
    7: "memo",
}

# VB6 COLORREF int → CSS hex. VB6 stores as BGR, not RGB.
def vb6_to_css_hex(colorref: Optional[str]) -> Optional[str]:
    """Convert VB6 COLORREF string (BGR integer) to CSS hex colour."""
    if not colorref:
        return None
    try:
        val = int(colorref)
        b = (val >> 16) & 0xFF
        g = (val >> 8) & 0xFF
        r = val & 0xFF
        return f"#{r:02x}{g:02x}{b:02x}"
    except (ValueError, TypeError):
        return None


def _resolve_field_type(col: str, acptdatatype: Optional[int], linkid: Optional[int]) -> tuple[str, Optional[int], Optional[str]]:
    """
    Determines the UI type, lookupRecid, and lookupName for a given AD row.
    Returns (ui_type, lookup_recid, lookup_name)
    """
    # Start with datatype hint
    ui_type = DATATYPE_MAP.get(acptdatatype or 0, "text")

    # Column-name based overrides (more reliable than datatype alone)
    col_lower = col.lower()
    if col_lower in ("stockno", "barcode"):
        return "barcode", None, None
    if "qty" in col_lower and col_lower != "analqty":
        return "number", None, None
    if col_lower in ("rate", "retailprice", "mrp", "cost", "total", "amount", "docnetvalue", "docentnetvalue"):
        return "readonly", None, None
    if "disc" in col_lower and "code" not in col_lower:
        return "number", None, None
    if "date" in col_lower:
        return "date", None, None

    # Dropdown resolution — linkid takes precedence
    lookup_recid: Optional[int] = None
    lookup_name: Optional[str] = None

    if linkid and linkid > 0:
        lookup_recid = linkid
        lookup_name = RECID_NAMES.get(linkid, f"recid_{linkid}")
        return "dropdown", lookup_recid, lookup_name

    # Auto-resolve known FK columns by name
    KNOWN_FK: dict[str, tuple[int, str]] = {
        "class1cd":    (1,  "class1"),
        "class2cd":    (2,  "class2"),
        "superclass1": (51, "superclass1"),
        "superclass2": (52, "superclass2"),
        "sizecd":      (53, "sizegroup"),
        "sizegroup":   (53, "sizegroup"),
        "prodtaxtype": (54, "prodtaxtype"),
    }
    if col_lower in KNOWN_FK:
        recid, name = KNOWN_FK[col_lower]
        return "dropdown", recid, name

    # AnalCode1–6: RecID 65–70
    if col_lower.startswith("analcode") and not col_lower.startswith("analcodeused"):
        try:
            n = int(col_lower.replace("analcode", ""))
            if 1 <= n <= 6:
                recid = 64 + n  # analcode1→65, analcode2→66, etc.
                return "dropdown", recid, f"analcode{n}"
            elif 7 <= n <= 32:
                recid = 6994 + n  # analcode7→7001, analcode8→7002, etc.
                return "dropdown", recid, f"analcode{n}"
        except ValueError:
            pass

    return ui_type, lookup_recid, lookup_name


def _build_field(row) -> dict:
    """Convert a single AcceptDisplayDtls ORM row to a Smriti field spec."""
    col = (getattr(row, 'columnname', None) or "").strip()
    ui_type, lookup_recid, lookup_name = _resolve_field_type(
        col,
        getattr(row, 'acptdatatype', None),
        getattr(row, 'linkid', None)
    )

    caption = getattr(row, 'dispcap', None) or getattr(row, 'acptcap', None) or col or "Field"
    disp_width = getattr(row, 'dispwidth', None)
    disp_pos = getattr(row, 'disppos', None)
    disp_colour = vb6_to_css_hex(getattr(row, 'dispfourcolour', None))
    disp_bg = vb6_to_css_hex(getattr(row, 'dispbackcolour', None))
    field_ind = getattr(row, 'fieldind', 0) or 0

    return {
        "field":         col,
        "headerName":    caption,
        "type":          ui_type,
        "visible":       True,
        "mandatory":     bool(getattr(row, 'acptvisible', False)),
        "pos":           disp_pos or 99,
        "width":         max(80, int((disp_width or 8) * 12)),
        "lookupRecid":   lookup_recid,
        "lookupName":    lookup_name,
        "placeholder":   f"Select {caption}" if ui_type == "dropdown" else f"Enter {caption}",
        "isExtension":   field_ind > 0,
        "isBold":        bool(getattr(row, 'dispfontbold', False)),
        "colour":        disp_colour,
        "bgColour":      disp_bg,
        "custmTable":    getattr(row, 'custmtablename', None),
        "acptWidth":     getattr(row, 'acptwidth', None),
        "acptPos":       getattr(row, 'acptpos', None),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 1: Generic GenLookup Dropdown
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/{recid}", summary="GenLookup options by RecID")
async def get_lookup_by_recid(
    recid: int,
    q: Optional[str] = Query(None, description="Filter by code or description"),
    limit: int = Query(500, le=2000),
    db: AsyncSession = Depends(get_db)
):
    """Returns code→label pairs from GenLookup for the given RecID, sorted by description."""
    stmt = select(Genlookup).where(Genlookup.recid == recid)
    if q:
        q_l = q.lower()
        stmt = stmt.where(
            func.lower(Genlookup.code).contains(q_l) |
            func.lower(Genlookup.descr).contains(q_l)
        )
    stmt = stmt.order_by(Genlookup.descr).limit(limit)
    rows = (await db.execute(stmt)).scalars().all()
    return [{"code": r.code, "label": r.descr or r.code, "recid": r.recid} for r in rows]


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 2: GenLookup by Semantic Name
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/by-name/{field_name}", summary="GenLookup options by field name")
async def get_lookup_by_field_name(
    field_name: str,
    q: Optional[str] = Query(None),
    limit: int = Query(500, le=2000),
    db: AsyncSession = Depends(get_db)
):
    """Returns lookup options via field names like 'class1', 'analcode3', 'sizegroup'."""
    recid = ANALCODE_RECID.get(field_name.lower())
    if recid is None:
        raise HTTPException(404, detail=f"No lookup mapping for field: '{field_name}'. Valid names: {list(ANALCODE_RECID.keys())}")
    return await get_lookup_by_recid(recid=recid, q=q, limit=limit, db=db)


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 3: Full Screen Schema from AcceptDisplayDtls
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/schema/fields", summary="Full screen field schema from AcceptDisplayDtls")
async def get_screen_schema(
    trntype: int = Query(1000, description="1000=ItemMaster, 2100=Sales, 2200=Purchase, 1100=GRN"),
    mode: str = Query("display", description="'entry' or 'display' — which visibility flag to use"),
    include_extensions: bool = Query(False, description="Include extension fields (fieldind>0)"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the complete field schema for any transaction screen.
    Driven entirely by AcceptDisplayDtls (2,349 rows) — no hardcoding.

    - mode=display → respects dispvisible (for browse grids)
    - mode=entry   → respects acptvisible (for data entry forms)
    - include_extensions=false → hides sfield1–5 / nfield1–5 unless configured
    """
    visibility_col = Acceptdisplaydtls.dispvisible if mode == "display" else Acceptdisplaydtls.acptvisible

    stmt = (
        select(Acceptdisplaydtls)
        .where(
            Acceptdisplaydtls.trntype == trntype,
            visibility_col == True
        )
        .order_by(Acceptdisplaydtls.disppos if mode == "display" else Acceptdisplaydtls.acptpos)
    )
    rows = (await db.execute(stmt)).scalars().all()

    fields = []
    for row in rows:
        fi = (row.fieldind or 0)
        if fi > 0 and not include_extensions:
            continue  # Skip extension fields unless caller wants them
        fields.append(_build_field(row))

    return {
        "trntype":   trntype,
        "mode":      mode,
        "count":     len(fields),
        "fields":    fields,
        "recidMap":  RECID_NAMES,
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 4: Payment Extra Fields from PaymodeAcceptDisplayDtls
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/schema/payfields", summary="Payment mode extra fields from PaymodeAcceptDisplayDtls")
async def get_paymode_fields(
    paymode: Optional[int] = Query(None, description="1=Cash, 2=Card, 3=Cheque, 4=UPI — omit for all"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns per-payment-mode extra field definitions.
    Drives dynamic settlement panels: Card shows AuthCode, UPI shows UTRNo, etc.
    Backed by PaymodeAcceptDisplayDtls (75 rows) — no hardcoding.
    """
    stmt = select(Paymodeacceptdisplaydtls).where(
        Paymodeacceptdisplaydtls.acptvisible.in_([1, True])
    ).order_by(
        Paymodeacceptdisplaydtls.paymode,
        Paymodeacceptdisplaydtls.acptpos
    )
    if paymode is not None:
        stmt = stmt.where(Paymodeacceptdisplaydtls.paymode == paymode)

    rows = (await db.execute(stmt)).scalars().all()

    # Group by paymode
    grouped: dict[int, list] = {}
    for row in rows:
        pm = row.paymode
        col = (row.columnname or "").strip()
        acpt_type = row.acptdatatype or 1
        ui_type = DATATYPE_MAP.get(acpt_type, "text")
        if "date" in col.lower():
            ui_type = "date"
        elif "amt" in col.lower() or "amount" in col.lower():
            ui_type = "number"

        entry = {
            "field":        col,
            "paycode":      row.paycode,
            "headerName":   row.acptcap or row.dispcap or col,
            "type":         ui_type,
            "mandatory":    bool(row.acptvisible),
            "pos":          row.acptpos or 99,
            "width":        max(100, int((row.acptwidth or 8) * 12)),
            "colour":       vb6_to_css_hex(row.acptfourcolour),
            "bgColour":     vb6_to_css_hex(row.acptbackcolour),
            "colMapped":    bool(getattr(row, 'columnnmmappresent', False)),
        }
        grouped.setdefault(pm, []).append(entry)

    # Build response: if single paymode requested, return flat list; else grouped dict
    if paymode is not None:
        return {
            "paymode": paymode,
            "fields":  grouped.get(paymode, [])
        }

    # Map paymode int → readable name (from Paymodeconfig if available, else fallback)
    PAYMODE_NAMES = {1: "CASH", 2: "CARD", 3: "CHEQUE", 4: "UPI", 5: "GIFT_VOUCHER", 6: "WALLET"}
    return {
        pm: {
            "label":  PAYMODE_NAMES.get(pm, f"Mode {pm}"),
            "fields": fields
        }
        for pm, fields in sorted(grouped.items())
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 5: Till Day-Open/Close Fields from TillAcceptDisplayDtls
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/schema/tillfields", summary="Cash till operation fields from TillAcceptDisplayDtls")
async def get_till_fields(
    tilltrntype: Optional[int] = Query(None, description="9100=Day Open, 9200=Day Close, 9300=Petty Cash — omit for all"),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns field schema for cash till day-open/close operations.
    Backed by TillAcceptDisplayDtls (33 rows). Replaces hardcoded finance forms.
    """
    stmt = select(Tillacceptdisplaydtls).where(
        Tillacceptdisplaydtls.acptvisible == True
    ).order_by(
        Tillacceptdisplaydtls.tilltrntype,
        Tillacceptdisplaydtls.acptpos
    )
    if tilltrntype is not None:
        stmt = stmt.where(Tillacceptdisplaydtls.tilltrntype == tilltrntype)

    rows = (await db.execute(stmt)).scalars().all()

    TILL_TRNTYPE_NAMES = {
        9100: "Day Open",
        9200: "Day Close / Z-Report",
        9300: "Petty Cash",
        9400: "Cash Pickup",
    }

    grouped: dict[int, list] = {}
    for row in rows:
        ttt = row.tilltrntype
        acpt_type = row.acptdatatype or 1
        ui_type = DATATYPE_MAP.get(acpt_type, "text")
        caption = row.acptcap or row.dispcap or f"Field {row.tillindex}"

        entry = {
            "index":      row.tillindex,
            "headerName": caption,
            "type":       ui_type,
            "mandatory":  bool(row.acptvisible),
            "pos":        row.acptpos or row.tillindex,
            "width":      max(100, int((row.acptwidth or 8) * 12)),
            "colour":     vb6_to_css_hex(row.acptfourcolour),
            "bgColour":   vb6_to_css_hex(row.acptbackcolour),
        }
        grouped.setdefault(ttt, []).append(entry)

    if tilltrntype is not None:
        return {
            "tilltrntype": tilltrntype,
            "label":       TILL_TRNTYPE_NAMES.get(tilltrntype, f"Till Op {tilltrntype}"),
            "fields":      grouped.get(tilltrntype, [])
        }

    return {
        ttt: {
            "label":  TILL_TRNTYPE_NAMES.get(ttt, f"Till Op {ttt}"),
            "fields": fields
        }
        for ttt, fields in sorted(grouped.items())
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 6: Caption Map for any TrnType (lightweight)
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/schema/captions", summary="Field captions for a given trntype")
async def get_captions(
    trntype: int = Query(1000),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a flat columnname→caption map for any transaction type.
    Lightweight — used to hydrate AG Grid headerNames from sovereign S9 config.
    """
    stmt = (
        select(Acceptdisplaydtls.columnname, Acceptdisplaydtls.dispcap, Acceptdisplaydtls.acptcap)
        .where(
            Acceptdisplaydtls.trntype == trntype,
            Acceptdisplaydtls.columnname.is_not(None)
        )
    )
    rows = (await db.execute(stmt)).all()

    return {
        (r.columnname or "").lower(): r.dispcap or r.acptcap or r.columnname
        for r in rows
        if r.columnname
    }


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 7: Meta — RecID Map
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/meta/recid-map", summary="Full RecID→field name registry")
async def get_recid_map():
    """Returns the complete RecID to semantic field name mapping for frontend reference."""
    return RECID_NAMES


# ═══════════════════════════════════════════════════════════════════════════════
# ROUTE 8: Meta — All Transaction Type Names
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/meta/trntypes", summary="All transaction type names from GenLookup RecID 101")
async def get_trntype_names(db: AsyncSession = Depends(get_db)):
    """
    Returns all transaction type code→name pairs from GenLookup RecID=101.
    Covers Sales (2100), Purchase (2200), GRN (1100), Returns (1300), etc.
    """
    stmt = select(Genlookup).where(Genlookup.recid == 101).order_by(Genlookup.code)
    rows = (await db.execute(stmt)).scalars().all()
    return {r.code: r.descr or r.code for r in rows}
