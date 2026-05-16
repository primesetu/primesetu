# ============================================================
# SMRITI-OS — Bulk Item Injection Pipeline
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
#
# Pipeline (S9 Matrix Compliant):
#   1. Sysparam  → Fetch enabled fields + captions
#   2. Genlookup → Upsert all Class1/Class2/SuperClass/AnalCode values
#   3. Class12combo → Upsert Product × Brand combos (with SuperClass)
#   4. Itemmaster → Bulk INSERT (audit-bypass for throughput)
#   5. Stockmaster → Auto-init ledger rows (Qty = 0)
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, text
from sqlalchemy.dialects.postgresql import insert as pg_insert
from typing import List, Dict, Any, Tuple, Optional
from decimal import Decimal
from datetime import datetime

from app.models.legacy_s9 import (
    Sysparam,
    Genlookup,
    Class12combo,
    Itemmaster,
    Stockmaster,
    Itemmasterconfig,
)
from app.core.logging import logger

# ──────────────────────────────────────────────────────────────────────
# SYSPARAM CONFIG CONSTANTS (Real paramcodes from DB audit)
# ──────────────────────────────────────────────────────────────────────

# Mapping: analcode_number → (Present_paramcode, Caption_paramcode, Genlookup_RecId_paramcode)
ANALCODE_PARAM_MAP: Dict[int, Tuple[str, str, str]] = {
    1:  ("ItemAnaCd1Present",  "ItemAnaCd1Caption",  "ItemAnaCd1RecId"),
    2:  ("ItemAnaCd2Present",  "ItemAnaCd2Caption",  "ItemAnaCd2RecId"),
    3:  ("ItemAnaCd3Present",  "ItemAnaCd3Caption",  "ItemAnaCd3RecId"),
    4:  ("ItemAnaCd4Present",  "ItemAnaCd4Caption",  "ItemAnaCd4RecId"),
    5:  ("ItemAnaCd5Present",  "ItemAnaCd5Caption",  "ItemAnaCd5RecId"),
    # AC32 = HSN Code — VERIFIED ENABLED in live DB (ItemAnaCd32Present=True, RecId=7026)
    # This is the ONLY enabled AnalCode for this footwear store — GST compliance field
    32: ("ItemAnaCd32Present", "ItemAnaCd32Caption", "ItemAnaCd32RecId"),
}

# Core classification paramcodes (verified from DB live audit)
CORE_PARAM_CODES = [
    "ItemClass1Cap", "ItemClass2Cap",
    "ItemSubClass1Present", "ItemSubClass1Cap",
    "ItemSubClass2Present", "ItemSubClass2Cap",
    "ItemSizePresent", "ItemSizeCap",
    "SuperClass1Present", "SuperClass1Caption", "SuperClass1RecId",
    "SuperClass2Present", "SuperClass2Caption", "SuperClass2RecId",
    "ExtItemDescPresent",
    # AC1-AC5 (configurable per store)
    "ItemAnaCd1Present", "ItemAnaCd1Caption", "ItemAnaCd1RecId",
    "ItemAnaCd2Present", "ItemAnaCd2Caption", "ItemAnaCd2RecId",
    "ItemAnaCd3Present", "ItemAnaCd3Caption", "ItemAnaCd3RecId",
    "ItemAnaCd4Present", "ItemAnaCd4Caption", "ItemAnaCd4RecId",
    "ItemAnaCd5Present", "ItemAnaCd5Caption", "ItemAnaCd5RecId",
    # AC32 = HSN Code — VERIFIED ENABLED in live DB (GST compliance)
    "ItemAnaCd32Present", "ItemAnaCd32Caption", "ItemAnaCd32RecId",
]


# ──────────────────────────────────────────────────────────────────────
# STEP 1 — Fetch Item Field Configuration from Sysparam
# ──────────────────────────────────────────────────────────────────────

async def fetch_item_field_config(db: AsyncSession) -> Dict[str, Any]:
    """
    Reads Sysparam to build a field configuration map for Itemmaster.
    Returns a dict like:
    {
        'captions': {'class1cd': 'Product', 'class2cd': 'Brand', 'analcode1': 'Fibre', ...},
        'enabled':  {'subclass1cd': True, 'subclass2cd': True, 'sizecd': True, 'analcode1': False, ...},
        'analcode_recids': {1: 65, 2: 66, ...}
    }
    """
    result = await db.execute(
        select(Sysparam).where(Sysparam.paramcode.in_(CORE_PARAM_CODES))
    )
    # .all() is REQUIRED — async cursor must be fully materialized before dict iteration
    rows = {row.paramcode: row for row in result.scalars().all()}

    def get_bool(paramcode: str, default: bool = False) -> bool:
        row = rows.get(paramcode)
        if row is None:
            return default
        return bool(row.boolean) if row.boolean is not None else default

    def get_txt(paramcode: str, default: str = "") -> str:
        row = rows.get(paramcode)
        if row is None:
            return default
        return row.txt or default

    def get_int(paramcode: str, default: int = 0) -> int:
        row = rows.get(paramcode)
        if row is None:
            return default
        return int(row.intg) if row.intg is not None else default

    config = {
        "captions": {
            "class1cd":     get_txt("ItemClass1Cap",     "Product"),
            "class2cd":     get_txt("ItemClass2Cap",     "Brand"),
            "subclass1cd":  get_txt("ItemSubClass1Cap",  "Style"),
            "subclass2cd":  get_txt("ItemSubClass2Cap",  "Shade"),
            "sizecd":       get_txt("ItemSizeCap",       "Size"),
            "superclass1":  get_txt("SuperClass1Caption","Department"),
            "superclass2":  get_txt("SuperClass2Caption","Buyer"),
        },
        "enabled": {
            "subclass1cd":  get_bool("ItemSubClass1Present", True),
            "subclass2cd":  get_bool("ItemSubClass2Present", True),
            "sizecd":       get_bool("ItemSizePresent",      True),
            "superclass1":  get_bool("SuperClass1Present",   False),
            "superclass2":  get_bool("SuperClass2Present",   False),
            "extdesc":      get_bool("ExtItemDescPresent",   True),
        },
        "analcode_recids": {},
        "analcode_captions": {},
        "analcode_enabled": {},
    }

    # AC1-AC5 from DB (AC6-AC32 default to disabled unless configured)
    for ac_num, (present_pc, caption_pc, recid_pc) in ANALCODE_PARAM_MAP.items():
        config["analcode_enabled"][ac_num]   = get_bool(present_pc, False)
        config["analcode_captions"][ac_num]  = get_txt(caption_pc, f"AC{ac_num}")
        config["analcode_recids"][ac_num]    = get_int(recid_pc, 64 + ac_num)  # default: 65,66,...

    logger.info("sysparam_item_config_loaded", enabled_fields=config["enabled"])
    return config


# ──────────────────────────────────────────────────────────────────────
# STEP 2 — Pre-flight: Upsert Genlookup (INSERT ON CONFLICT DO NOTHING)
# ──────────────────────────────────────────────────────────────────────

async def upsert_genlookup_batch(
    db: AsyncSession,
    lookup_values: List[Dict[str, Any]],
) -> Dict[str, int]:
    """
    Bulk-upserts values into Genlookup.
    lookup_values: [{'recid': 1, 'code': 'SHIRT', 'descr': 'Shirt'}, ...]
    S9 rule: INSERT WHERE code NOT EXISTS for that recid.
    Returns {'inserted': N, 'skipped': M}
    """
    if not lookup_values:
        return {"inserted": 0, "skipped": 0}

    # Deduplicate by (recid, code)
    seen = set()
    unique = []
    for v in lookup_values:
        key = (v["recid"], str(v["code"]).strip().upper())
        if key not in seen:
            seen.add(key)
            unique.append(v)

    inserted = 0
    skipped = 0

    for entry in unique:
        stmt = pg_insert(Genlookup).values(
            recid=entry["recid"],
            code=str(entry["code"]).strip().upper(),
            descr=entry.get("descr", entry["code"])[:40],
            flag=entry.get("flag", ""),
            number=entry.get("number", 0),
            tenant_id="SYSTEM",
        ).on_conflict_do_nothing(index_elements=["recid", "code"])

        result = await db.execute(stmt)
        if result.rowcount and result.rowcount > 0:
            inserted += 1
        else:
            skipped += 1

    logger.info("genlookup_upsert_complete", inserted=inserted, skipped=skipped)
    return {"inserted": inserted, "skipped": skipped}


# ──────────────────────────────────────────────────────────────────────
# STEP 3 — Upsert Class12combo (Product × Brand Matrix)
# ──────────────────────────────────────────────────────────────────────

async def upsert_class12combo_batch(
    db: AsyncSession,
    combos: List[Dict[str, Any]],
) -> Dict[str, int]:
    """
    Bulk upserts Class1+Class2 combinations into Class12combo.
    combos: [{'class1cd': 'SHIRT', 'class2cd': 'NIKE', 'superclass1': 'APPAREL', ...}]
    """
    if not combos:
        return {"inserted": 0, "skipped": 0}

    # Deduplicate by (class1cd, class2cd)
    seen = set()
    unique = []
    for c in combos:
        key = (str(c["class1cd"]).upper(), str(c["class2cd"]).upper())
        if key not in seen:
            seen.add(key)
            unique.append(c)

    inserted = 0
    skipped = 0

    for combo in unique:
        values = {
            "class1cd":        str(combo["class1cd"]).upper(),
            "class2cd":        str(combo["class2cd"]).upper(),
            "superclass1":     combo.get("superclass1"),
            "superclass2":     combo.get("superclass2"),
            "prodtaxtype":     combo.get("prodtaxtype"),
            "sizegroup":       combo.get("sizegroup"),
            "retailmarkup":    combo.get("retailmarkup", Decimal("0")),
            "dealermarkup":    combo.get("dealermarkup", Decimal("0")),
            "billable":        combo.get("billable", 1),
            "isservicecombo":  combo.get("isservicecombo", 0),
            "isconsignmentitem": combo.get("isconsignmentitem", False),
            "tenant_id":       "SYSTEM",
        }

        stmt = pg_insert(Class12combo).values(**values).on_conflict_do_nothing(
            index_elements=["class1cd", "class2cd"]
        )
        result = await db.execute(stmt)
        if result.rowcount and result.rowcount > 0:
            inserted += 1
        else:
            skipped += 1

    logger.info("class12combo_upsert_complete", inserted=inserted, skipped=skipped)
    return {"inserted": inserted, "skipped": skipped}


# ──────────────────────────────────────────────────────────────────────
# STEP 4 — Core Itemmaster Bulk INSERT (Audit-Bypass Mode)
# ──────────────────────────────────────────────────────────────────────

def _build_item_row(item: Dict[str, Any], vauid: str, vacompcode: str) -> Dict[str, Any]:
    """
    Builds a full Itemmaster column dict from raw payload.
    Applies all S9 null-safe defaults. No ORM, raw dict for bulk exec.
    """
    stockno = str(item.get("stockno", "")).strip()
    if not stockno:
        raise ValueError("stockno is required")

    now = datetime.utcnow()
    cost = Decimal(str(item.get("currentcost", 0) or 0))
    retail = Decimal(str(item.get("retail_price", 0) or 0))

    row = {
        # ── Identity ──
        "stockno":         stockno,
        "batchsrlno":      str(item.get("batchsrlno", "0")),
        "itemdesc":        str(item.get("itemdesc", stockno))[:40],

        # ── Classification ──
        "class1cd":        str(item.get("class1cd", "")).upper()[:16] or None,
        "class2cd":        str(item.get("class2cd", "")).upper()[:16] or None,
        "subclass1cd":     (str(item.get("subclass1cd", "")) or None),
        "subclass2cd":     (str(item.get("subclass2cd", "")) or None),
        "sizecd":          (str(item.get("sizecd", "")) or None),

        # ── Pricing ──
        "retail_price":    retail,
        "dealer_price":    Decimal(str(item.get("dealer_price", retail) or retail)),
        "currentcost":     cost,
        "lastpurchprice":  Decimal(str(item.get("lastpurchprice", cost) or cost)),
        "finalmrp":        Decimal(str(item.get("finalmrp", retail) or retail)),
        "rtlmarkup":       Decimal(str(item.get("rtlmarkup", 0) or 0)),
        "dlrmarkup":       Decimal(str(item.get("dlrmarkup", 0) or 0)),

        # ── Tax ──
        "prodtaxtype":     item.get("prodtaxtype"),
        "srctaxtype":      item.get("srctaxtype"),
        "isrptaxinclusive": bool(item.get("isrptaxinclusive", False)),

        # ── Flags ──
        "isinventoryitem": bool(item.get("isinventoryitem", True)),
        "isbillable":      bool(item.get("isbillable", True)),
        "isservice":       bool(item.get("isservice", False)),
        "isconsignmentitem": bool(item.get("isconsignmentitem", False)),
        "regularind":      str(item.get("regularind", "1")),
        "leastsalableqty": Decimal(str(item.get("leastsalableqty", 1) or 1)),
        "imageid":         item.get("imageid"),
        "imagepresent":    bool(item.get("imageid")),
        "extdescpresent":  bool(item.get("extdescpresent", False)),

        # ── Reorder ──
        "reordlvl":        Decimal(str(item.get("reordlvl", 0) or 0)),
        "eoq":             Decimal(str(item.get("eoq", 0) or 0)),
        "minordqty":       Decimal(str(item.get("minordqty", 0) or 0)),

        # ── Batch/Grade/Location ──
        "batchapplicable":    int(item.get("batchapplicable", 0) or 0),
        "gradeapplicable":    int(item.get("gradeapplicable", 0) or 0),
        "locationapplicable": int(item.get("locationapplicable", 0) or 0),
        "gradecd":            item.get("gradecd"),

        # ── Stock Flags ──
        "flgstocktake":    int(item.get("flgstocktake", 0) or 0),
        "flgratealterable": int(item.get("flgratealterable", 0) or 0),
        "flgstockchkappl": int(item.get("flgstockchkappl", 0) or 0),
        "stocktolerance":  Decimal(str(item.get("stocktolerance", 0) or 0)),

        # ── AnalCodes (AC1-AC32) ──
        **{f"analcode{i}": item.get(f"analcode{i}") for i in range(1, 33)},

        # ── Custom Fields ──
        "sfield1": item.get("sfield1"),
        "sfield2": item.get("sfield2"),
        "sfield3": item.get("sfield3"),
        "sfield4": item.get("sfield4"),
        "sfield5": item.get("sfield5"),
        "bfield1": False,  # S9 sentinel: False = Stockmaster row NOT yet created
        "bfield2": item.get("bfield2"),

        # ── VA Audit ──
        "vauid":     vauid,
        "vactr":     1,
        "vatermid":  ".",
        "vacompcode": vacompcode,
        "dateinsert":     now,
        "lastupdateddate": now,
        "tenant_id": "SYSTEM",

        # ── Jewellery defaults (0 for non-jwl) ──
        "usejwlpricing": 0,
        "jwlcaratage":   0,
        "jwlgrosswt":    Decimal("0"),
        "jwlstonewt":    Decimal("0"),
        "jwlwtfactor":   Decimal("0"),
        "jwlratefactor": Decimal("0"),
        "jwlstoneval":   Decimal("0"),
        "jwlmakecharge": Decimal("0"),
        "jwlvalfactor":  Decimal("0"),
    }

    return row


async def bulk_insert_itemmaster(
    db: AsyncSession,
    items: List[Dict[str, Any]],
    vauid: str,
    vacompcode: str,
) -> Dict[str, Any]:
    """
    High-speed bulk INSERT into Itemmaster. Skips existing stocknos.
    Returns summary of inserted / skipped / errors.
    """
    if not items:
        return {"inserted": 0, "skipped": 0, "errors": []}

    # Fetch all existing stocknos in one query (pre-flight dedup)
    all_stocknos = [str(i.get("stockno", "")).strip() for i in items]
    existing_result = await db.execute(
        select(Itemmaster.stockno).where(Itemmaster.stockno.in_(all_stocknos))
    )
    existing_set = {row for row in existing_result.scalars()}

    to_insert = []
    skipped = []
    errors = []

    for item in items:
        sno = str(item.get("stockno", "")).strip()
        if sno in existing_set:
            skipped.append(sno)
            continue
        try:
            row = _build_item_row(item, vauid, vacompcode)
            to_insert.append(row)
        except Exception as e:
            errors.append({"stockno": sno, "error": str(e)})

    if to_insert:
        await db.execute(pg_insert(Itemmaster), to_insert)

    logger.info(
        "itemmaster_bulk_insert",
        inserted=len(to_insert),
        skipped=len(skipped),
        errors=len(errors),
    )
    return {
        "inserted": len(to_insert),
        "skipped":  len(skipped),
        "skipped_codes": skipped,
        "errors":   errors,
    }


# ──────────────────────────────────────────────────────────────────────
# STEP 5 — Auto-Initialize Stockmaster (Qty = 0 for each new item)
# ──────────────────────────────────────────────────────────────────────

async def init_stockmaster_batch(
    db: AsyncSession,
    stocknos: List[str],
    vauid: str,
    vacompcode: str,
) -> int:
    """
    Creates Stockmaster init row for each new item.
    Mirrors S9: INSERT INTO stockmaster (stockno, LocnId=0, Qty=0, ...)
    Only inserts if stockno doesn't already exist in Stockmaster.
    """
    if not stocknos:
        return 0

    existing = await db.execute(
        select(Stockmaster.stockno).where(Stockmaster.stockno.in_(stocknos))
    )
    existing_set = {r for r in existing.scalars()}
    to_init = [sno for sno in stocknos if sno not in existing_set]

    if not to_init:
        return 0

    rows = [
        {
            "stockno":     sno,
            "locnid":      "0",
            "batchsrlno":  "0",
            "curbalqty":   Decimal("0"),
            "curbalval":   Decimal("0"),
            "yropbalqty":  Decimal("0"),
            "yropbalval":  Decimal("0"),
            "vactr":       1,
            "vauid":       vauid,
            "vatermid":    ".",
            "vacompcode":  vacompcode,
            "tenant_id":   "SYSTEM",
        }
        for sno in to_init
    ]
    await db.execute(pg_insert(Stockmaster).on_conflict_do_nothing(), rows)
    logger.info("stockmaster_init_complete", count=len(rows))
    return len(rows)


# ──────────────────────────────────────────────────────────────────────
# MASTER PIPELINE — Full 5-Step Atomic Bulk Injection
# ──────────────────────────────────────────────────────────────────────

async def process_bulk_item_import(
    db: AsyncSession,
    items: List[Dict[str, Any]],
    vauid: str,
    vacompcode: str,
) -> Dict[str, Any]:
    """
    Full atomic bulk injection pipeline:
    1. Genlookup upsert (Class1, Class2, SuperClass, AnalCodes)
    2. Class12combo upsert
    3. Itemmaster bulk INSERT
    4. Stockmaster auto-init
    All steps run in one transaction. Rollback on any failure.
    """
    logger.info("bulk_import_pipeline_start", item_count=len(items), user=vauid)

    try:
        # ── STEP 1: Build Genlookup payload ──
        lookup_values: List[Dict] = []

        for item in items:
            c1 = str(item.get("class1cd", "")).strip().upper()
            c2 = str(item.get("class2cd", "")).strip().upper()
            sc1 = str(item.get("superclass1", "")).strip().upper()
            sc2 = str(item.get("superclass2", "")).strip().upper()
            tax = str(item.get("prodtaxtype", "")).strip().upper()

            if c1:
                lookup_values.append({"recid": 1, "code": c1, "descr": item.get("class1desc", c1)})
            if c2:
                lookup_values.append({"recid": 2, "code": c2, "descr": item.get("class2desc", c2)})
            if sc1:
                lookup_values.append({"recid": 51, "code": sc1, "descr": item.get("superclass1desc", sc1)})
            if sc2:
                lookup_values.append({"recid": 52, "code": sc2, "descr": item.get("superclass2desc", sc2)})
            if tax:
                lookup_values.append({"recid": 54, "code": tax, "descr": item.get("proxtaxdesc", tax)})

            # AnalCodes — driven by ANALCODE_PARAM_MAP (AC1-5 + AC32 HSN Code)
            # RecIds are read from Sysparam at runtime; defaults from ANALCODE_PARAM_MAP structure
            _AC_RECID_DEFAULTS = {1: 65, 2: 66, 3: 67, 4: 68, 5: 69, 32: 7026}
            for ac_num in ANALCODE_PARAM_MAP.keys():
                val = str(item.get(f"analcode{ac_num}", "") or "").strip().upper()
                if val:
                    recid = _AC_RECID_DEFAULTS.get(ac_num, 64 + ac_num)
                    lookup_values.append({"recid": recid, "code": val, "descr": val})

        genlookup_result = await upsert_genlookup_batch(db, lookup_values)

        # ── STEP 2: Build Class12combo payload ──
        combos = []
        seen_combos = set()
        for item in items:
            c1 = str(item.get("class1cd", "")).strip().upper()
            c2 = str(item.get("class2cd", "")).strip().upper()
            if not c1 or not c2:
                continue
            key = (c1, c2)
            if key in seen_combos:
                continue
            seen_combos.add(key)
            combos.append({
                "class1cd":     c1,
                "class2cd":     c2,
                "superclass1":  str(item.get("superclass1", "") or "").upper() or None,
                "superclass2":  str(item.get("superclass2", "") or "").upper() or None,
                "prodtaxtype":  item.get("prodtaxtype"),
                "retailmarkup": item.get("retailmarkup", Decimal("0")),
                "dealermarkup": item.get("dealermarkup", Decimal("0")),
                "billable":     1,
            })

        combo_result = await upsert_class12combo_batch(db, combos)

        # ── STEP 3: Itemmaster bulk INSERT ──
        item_result = await bulk_insert_itemmaster(db, items, vauid, vacompcode)

        # ── STEP 4: Stockmaster init ──
        inserted_stocknos = [
            str(item.get("stockno", "")).strip()
            for item in items
            if str(item.get("stockno", "")).strip() not in item_result.get("skipped_codes", [])
        ]
        stock_count = await init_stockmaster_batch(db, inserted_stocknos, vauid, vacompcode)

        await db.commit()

        summary = {
            "status":           "SUCCESS",
            "items_inserted":   item_result["inserted"],
            "items_skipped":    item_result["skipped"],
            "items_errored":    len(item_result["errors"]),
            "genlookup_inserted": genlookup_result["inserted"],
            "combo_inserted":   combo_result["inserted"],
            "stock_rows_init":  stock_count,
            "errors":           item_result["errors"],
        }

        logger.info("bulk_import_pipeline_complete", **{k: v for k, v in summary.items() if k != "errors"})
        return summary

    except Exception as e:
        await db.rollback()
        logger.error("bulk_import_pipeline_failed", error=str(e))
        raise
