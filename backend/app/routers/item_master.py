# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# Refactored: Full S9 parity — Start to Product Creations.sql trace
# Pipeline: GenLookup → CLASS12COMBO → SUBCLASS1CAT → SUBCLASS2CAT
#           → SIZECAT → ItemMaster → StockMaster (init row)
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, update, and_, text
from typing import List, Optional
from decimal import Decimal
from datetime import datetime, date

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import (
    Itemmaster,
    Stockmaster,
    Class12combo,
    Subclass1cat,
    Subclass2cat,
    Sizecat,
    Genlookup,
    Itemmasterconfig,
)
from app.schemas.item_master import (
    ItemCreate,
    ItemResponse,
    ItemBatchCreate,
    BatchCreateResponse,
    PriceLevelUpdate,
    StockMatrixEntry,
    StockMatrixResponse,
    Class12ComboCreate,
    Class12ComboResponse,
    Subclass1CatCreate,
    Subclass2CatCreate,
    SizeCatCreate,
    GenLookupSyncRequest,
    GenLookupSyncResponse,
    ItemCaptionsResponse,
)

router = APIRouter(prefix="/items", tags=["item-master"])

# ────────────────────────────────────────────────────────────
# HELPERS
# ────────────────────────────────────────────────────────────


def _s9_defaults(payload: ItemCreate, vauid: str, vacompcode: str) -> dict:
    """Build a full Itemmaster column dict, applying all S9 null-safe defaults.
    Mirrors the sequence of UPDATE TempItemMastersuper SET x = 0 WHERE x IS NULL
    statements in the SQL trace."""
    d = payload.model_dump()
    # S9 rule: LastPurchPrice = CurrentCost if NULL/0
    if not d.get("lastpurchprice") or d["lastpurchprice"] == 0:
        d["lastpurchprice"] = d.get("currentcost") or Decimal("0")
    # Null-safe defaults (mirror the trace UPDATE statements)
    for f in [
        "retail_price",
        "dealer_price",
        "currentcost",
        "lastpurchprice",
        "jwlmakecharge",
        "stocktolerance",
        "rtlmarkup",
        "dlrmarkup",
        "finalmrp",
    ]:
        if d.get(f) is None:
            d[f] = Decimal("0")
    for f in [
        "flgstocktake",
        "flgratealterable",
        "flgstockchkappl",
        "batchapplicable",
        "gradeapplicable",
        "locationapplicable",
        "usejwlpricing",
        "vactr",
    ]:
        if d.get(f) is None:
            d[f] = 0
    for f in [
        "isinventoryitem",
        "isbillable",
        "isservice",
        "isconsignmentitem",
        "isrptaxinclusive",
        "imagepresent",
        "extdescpresent",
        "bfield1",
        "bfield2",
    ]:
        if d.get(f) is None:
            d[f] = False
    d["vauid"] = vauid
    d["vacompcode"] = vacompcode
    d["vatermid"] = d.get("vatermid") or "."
    d["dateinsert"] = datetime.now()
    d["lastupdateddate"] = datetime.now()
    return d


async def _sync_genlookup(
    db: AsyncSession,
    recid: int,
    code: str,
    descr: str,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Idempotent sync for GENLOOKUP master table."""
    if not code:
        return
    stmt = select(Genlookup).where(Genlookup.recid == recid, Genlookup.code == code)
    res = await db.execute(stmt)
    if res.scalar_one_or_none():
        return

    try:
        gl = Genlookup(
            recid=recid,
            code=code,
            descr=descr or code,
            flag="",
            number=0,
            vauid=vauid,
            vactr=1,
            vatermid=".",
            vacompcode=vacompcode,
            tenant_id=tenant_id,
        )
        db.add(gl)
    except Exception as e:
        print(f"[SMRITI-OS] Failed to sync GenLookup {recid}/{code}: {e}")


async def _cascade_genlookup(
    db: AsyncSession,
    item: ItemCreate,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Sync all classification codes to GenLookup before ItemMaster INSERT.
    Mirrors the full S9 pre-insert GenLookup cascade from the SQL trace."""
    ANALCODE_RECIDS = {
        "analcode1": 65,
        "analcode2": 66,
        "analcode3": 67,
        "analcode4": 68,
        "analcode5": 69,
        "analcode6": 7000,
        "analcode7": 7001,
        "analcode8": 7002,
        "analcode9": 7003,
        "analcode10": 7004,
        "analcode11": 7005,
        "analcode12": 7006,
        "analcode13": 7007,
        "analcode14": 7008,
        "analcode15": 7009,
        "analcode16": 7010,
        "analcode17": 7011,
        "analcode18": 7012,
        "analcode19": 7013,
        "analcode20": 7014,
        "analcode21": 7015,
        "analcode22": 7016,
        "analcode23": 7017,
        "analcode24": 7018,
        "analcode25": 7019,
        "analcode26": 7020,
        "analcode27": 7021,
        "analcode28": 7022,
        "analcode29": 7023,
        "analcode30": 7024,
        "analcode31": 7025,
        "analcode32": 7026,
    }
    await _sync_genlookup(
        db, 1, item.class1cd, item.class1cd, vauid, vacompcode, tenant_id
    )  # Product
    await _sync_genlookup(
        db, 2, item.class2cd, item.class2cd, vauid, vacompcode, tenant_id
    )  # Brand
    if item.prodtaxtype:
        await _sync_genlookup(
            db, 54, item.prodtaxtype, item.prodtaxtype, vauid, vacompcode, tenant_id
        )
    for field, recid in ANALCODE_RECIDS.items():
        val = getattr(item, field, None)
        if val:
            await _sync_genlookup(db, recid, val, val, vauid, vacompcode, tenant_id)
    if item.gradecd:
        await _sync_genlookup(
            db, 7030, item.gradecd, item.gradecd, vauid, vacompcode, tenant_id
        )


async def _cascade_class12combo(
    db: AsyncSession,
    item: ItemCreate,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Upsert CLASS12COMBO row for item's Class1+Class2 combination.
    Mirrors: INSERT INTO CLASS12COMBO WHERE (Class1Cd, Class2Cd) NOT IN (existing)"""
    existing = await db.scalar(
        select(Class12combo.class1cd).where(
            and_(
                Class12combo.class1cd == item.class1cd,
                Class12combo.class2cd == item.class2cd,
            )
        )
    )
    if not existing:
        combo = Class12combo(
            class1cd=item.class1cd,
            class2cd=item.class2cd,
            sizegroup=None,
            prodtaxtype=item.prodtaxtype,
            billable=1 if item.isbillable else 0,
            isservicecombo=1 if item.isservice else 0,
            retailmarkup=item.rtlmarkup,
            dealermarkup=item.dlrmarkup,
            prefvendorid=None,
            superclass1=None,
            superclass2=None,
            isconsignmentitem=item.isconsignmentitem,
            vauid=vauid,
            vactr=1,
            vatermid=".",
            vacompcode=vacompcode,
            dateinsert=datetime.now(),
            lastupdateddate=datetime.now(),
            tenant_id=tenant_id,
        )
        db.add(combo)


async def _cascade_subclass1(
    db: AsyncSession,
    item: ItemCreate,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Upsert SUBCLASS1CAT row if SubClass1Cd is provided.
    NOTE: Subclass1cat model has analcode1-27 only (S9 legacy constraint).
    analcode28-32 are stored at ItemMaster level only."""
    if not item.subclass1cd:
        return
    existing = await db.scalar(
        select(Subclass1cat.subclass1cd).where(
            and_(
                Subclass1cat.class1cd == item.class1cd,
                Subclass1cat.class2cd == item.class2cd,
                Subclass1cat.subclass1cd == item.subclass1cd,
            )
        )
    )
    if not existing:
        # Only pass analcode1-27 (model columns); 28-32 are ItemMaster-only
        analcodes = {
            f"analcode{i}": getattr(item, f"analcode{i}", None) for i in range(1, 28)
        }
        sub = Subclass1cat(
            class1cd=item.class1cd,
            class2cd=item.class2cd,
            subclass1cd=item.subclass1cd,
            subclass1desc=item.subclass1cd,
            prodtaxtype=item.prodtaxtype,
            regularind=str(item.regularind) if item.regularind is not None else None,
            vauid=vauid,
            vactr=1,
            vatermid=".",
            vacompcode=vacompcode,
            tenant_id=tenant_id,
            **{k: v for k, v in analcodes.items() if v is not None},
        )
        db.add(sub)


async def _cascade_subclass2(
    db: AsyncSession,
    item: ItemCreate,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Upsert SUBCLASS2CAT row if SubClass2Cd is provided."""
    if not item.subclass2cd:
        return
    existing = await db.scalar(
        select(Subclass2cat.subclass2cd).where(
            and_(
                Subclass2cat.class1cd == item.class1cd,
                Subclass2cat.class2cd == item.class2cd,
                Subclass2cat.subclass2cd == item.subclass2cd,
            )
        )
    )
    if not existing:
        sub2 = Subclass2cat(
            class1cd=item.class1cd,
            class2cd=item.class2cd,
            subclass2cd=item.subclass2cd,
            subclass2desc=item.subclass2cd,
            vauid=vauid,
            vactr=1,
            vatermid=".",
            vacompcode=vacompcode,
            dateinsert=datetime.now(),
            lastupdateddate=datetime.now(),
            tenant_id=tenant_id,
        )
        db.add(sub2)


async def _cascade_sizecat(
    db: AsyncSession,
    item: ItemCreate,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Upsert SIZECAT row if SizeCd is provided."""
    if not item.sizecd:
        return
    existing = await db.scalar(
        select(Sizecat.sizecd).where(
            and_(
                Sizecat.class1cd == item.class1cd,
                Sizecat.class2cd == item.class2cd,
                Sizecat.sizecd == item.sizecd,
            )
        )
    )
    if not existing:
        sc = Sizecat(
            class1cd=item.class1cd,
            class2cd=item.class2cd,
            sizecd=item.sizecd,
            vauid=vauid,
            vactr=1,
            vatermid=".",
            vacompcode=vacompcode,
            tenant_id=tenant_id,
        )
        db.add(sc)


async def _insert_stockmaster_init(
    db: AsyncSession,
    stockno: str,
    batchsrlno: int,
    vauid: str,
    vacompcode: str,
    tenant_id: str = "SYSTEM",
):
    """Insert initial StockMaster row after ItemMaster INSERT.
    Mirrors: INSERT INTO stockmaster (...) SELECT StockNo, 0, BatchSrlNo, 0, 0, 1, 0, 0 ...
    NOTE: Stockmaster PKs (stockno, batchsrlno, locnid) are all String in the model."""
    locnid_str = "0"
    batchsrlno_str = str(batchsrlno)
    existing = await db.scalar(
        select(Stockmaster.stockno).where(
            and_(
                Stockmaster.stockno == stockno,
                Stockmaster.locnid == locnid_str,
                Stockmaster.batchsrlno == batchsrlno_str,
            )
        )
    )
    if not existing:
        sm = Stockmaster(
            stockno=stockno,
            locnid=locnid_str,
            batchsrlno=batchsrlno_str,
            curbalqty=Decimal("0"),
            curbalval=Decimal("0"),
            vactr=1,
            yropbalqty=Decimal("0"),
            yropbalval=Decimal("0"),
            dateinsert=datetime.now(),
            vauid=vauid,
            vacompcode=vacompcode,
            vatermid=".",
            tenant_id=tenant_id,
        )
        db.add(sm)


# ────────────────────────────────────────────────────────────
# ENDPOINTS
# ────────────────────────────────────────────────────────────


@router.get("/captions", response_model=ItemCaptionsResponse)
async def get_item_captions(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Priority 4: Fetch dynamic field captions from ItemMasterConfig.FC.
    Returns {'class1cd': 'Product', 'class2cd': 'Brand', 'subclass1cd': 'Style', ...}"""
    result = await db.execute(select(Itemmasterconfig))
    rows = result.scalars().all()
    captions = {r.fn.lower(): r.fc for r in rows if r.fn and r.fc}
    return ItemCaptionsResponse(captions=captions)


@router.get("/class12combo")
async def get_class12combo(
    class1cd: str = Query(..., description="Filter by Product/Class1 code"),
    class2cd: Optional[str] = Query(None, description="Optional: filter by Brand/Class2 code"),
    limit: int = Query(200, le=500),
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Fetch Class12combo rows for Matrix Generator combo panel.
    Returns all Brand (class2) combos registered under a given Product (class1).
    This is the S9-parity read endpoint for the frontend Matrix Generator."""
    query = (
        select(Class12combo)
        .where(
            and_(
                Class12combo.class1cd == class1cd,
                Class12combo.tenant_id == current_user.tenant_id,
            )
        )
        .limit(limit)
    )
    if class2cd:
        query = query.where(Class12combo.class2cd == class2cd)

    result = await db.execute(query)
    rows = result.scalars().all()
    return [
        {
            "code": r.class2cd,
            "descr": r.class2cd,
            "class1cd": r.class1cd,
            "class2cd": r.class2cd,
            "prodtaxtype": r.prodtaxtype or "",
            "retailmarkup": float(r.retailmarkup or 0),
            "dealermarkup": float(r.dealermarkup or 0),
            "billable": r.billable,
            "sizegroup": r.sizegroup or "",
        }
        for r in rows
    ]


@router.get("/sizecat")
async def get_sizecat(
    class1cd: str = Query(..., description="Filter by Product/Class1 code"),
    class2cd: str = Query(..., description="Filter by Brand/Class2 code"),
    limit: int = Query(200, le=500),
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Fetch SizeCat rows for a given Class1+Class2 combination.
    Used by Matrix Generator to populate the Size pivot selector."""
    query = (
        select(Sizecat)
        .where(
            and_(
                Sizecat.class1cd == class1cd,
                Sizecat.class2cd == class2cd,
                Sizecat.tenant_id == current_user.tenant_id,
            )
        )
        .limit(limit)
    )
    result = await db.execute(query)
    rows = result.scalars().all()
    return [
        {
            "code": r.sizecd,
            "descr": r.sizecd,
            "class1cd": r.class1cd,
            "class2cd": r.class2cd,
        }
        for r in rows
    ]


@router.get("/class1list")
async def get_class1_list(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Fetch distinct Class1 (Product) codes from Class12combo master.
    Used to populate the Class1 selector in the Matrix Generator."""
    result = await db.execute(
        select(Class12combo.class1cd)
        .where(Class12combo.tenant_id == current_user.tenant_id)
        .distinct()
        .limit(200)
    )
    codes = result.scalars().all()
    return [{"code": c, "descr": c} for c in codes if c]



@router.post("/lookup/sync", response_model=GenLookupSyncResponse)
async def sync_lookup_values(
    payload: GenLookupSyncRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Priority 3: Upsert lookup values into GenLookup before item save.
    Mirrors S9 pre-insert lookup population pipeline."""
    inserted = 0
    skipped = 0
    vauid = str(current_user.user_id)
    vacompcode = current_user.store_id  # Using store_id as compcode in sovereign mode

    for entry in payload.items:
        existing = await db.scalar(
            select(Genlookup.code).where(
                and_(
                    Genlookup.recid == entry.recid,
                    Genlookup.code == entry.code,
                    Genlookup.tenant_id == current_user.tenant_id,
                )
            )
        )
        if existing:
            skipped += 1
        else:
            gl = Genlookup(
                recid=entry.recid,
                code=entry.code,
                descr=entry.descr,
                flag=entry.flag,
                number=entry.number,
                vauid=vauid,
                vactr=1,
                vatermid=".",
                vacompcode=vacompcode,
                tenant_id=current_user.tenant_id,
            )
            db.add(gl)
            inserted += 1

    await db.commit()
    return GenLookupSyncResponse(inserted=inserted, skipped=skipped)


@router.post("/", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
async def create_item(
    payload: ItemCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Priority 1+2: Create a new item with full S9 cascade.
    Pipeline: GenLookup → CLASS12COMBO → SUBCLASS1CAT → SUBCLASS2CAT
              → SIZECAT → ItemMaster → StockMaster (init row)"""
    vauid = str(current_user.user_id)
    vacompcode = current_user.store_id
    db.tenant_id = current_user.tenant_id  # Inject for helpers

    # 1. Check StockNo uniqueness
    existing = await db.scalar(
        select(Itemmaster.stockno).where(
            and_(
                Itemmaster.stockno == payload.stockno,
                Itemmaster.tenant_id == current_user.tenant_id,
            )
        )
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"StockNo '{payload.stockno}' already exists in ItemMaster.",
        )

    # 2. GenLookup cascade (Class1, Class2, AnalCodes)
    await _cascade_genlookup(db, payload, vauid, vacompcode)

    # 3. CLASS12COMBO cascade
    await _cascade_class12combo(db, payload, vauid, vacompcode)

    # 4. SUBCLASS1CAT cascade
    await _cascade_subclass1(db, payload, vauid, vacompcode)

    # 5. SUBCLASS2CAT cascade
    await _cascade_subclass2(db, payload, vauid, vacompcode)

    # 6. SIZECAT cascade
    await _cascade_sizecat(db, payload, vauid, vacompcode)

    # 7. ItemMaster INSERT (with S9 defaults applied)
    item_dict = _s9_defaults(payload, vauid, vacompcode)
    new_item = Itemmaster(**item_dict, tenant_id=current_user.tenant_id)
    db.add(new_item)
    await db.flush()  # Get PK for StockMaster

    # 8. StockMaster initial row
    await _insert_stockmaster_init(
        db, payload.stockno, payload.batchsrlno, vauid, vacompcode
    )

    await db.commit()
    await db.refresh(new_item)

    return ItemResponse(
        **{k: getattr(new_item, k, None) for k in ItemResponse.model_fields},
        total_stock=0,
    )


@router.get("/")
async def list_items(
    search: Optional[str] = Query(
        None, description="Search by StockNo, description, or barcode"
    ),
    class1cd: Optional[str] = Query(None, description="Filter by Product/Class1"),
    class2cd: Optional[str] = Query(None, description="Filter by Brand/Class2"),
    subclass1cd: Optional[str] = Query(None, description="Filter by Style/SubClass1"),
    limit: int = Query(50, le=500),
    offset: int = 0,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """List items from Itemmaster with stock totals. Full S9 column set."""
    stock_subq = (
        select(
            Stockmaster.stockno, func.sum(Stockmaster.curbalqty).label("total_stock")
        )
        .where(Stockmaster.tenant_id == current_user.tenant_id)
        .group_by(Stockmaster.stockno)
        .subquery()
    )

    query = (
        select(
            Itemmaster, func.coalesce(stock_subq.c.total_stock, 0).label("total_stock")
        )
        .outerjoin(stock_subq, Itemmaster.stockno == stock_subq.c.stockno)
        .where(Itemmaster.tenant_id == current_user.tenant_id)
    )

    if search:
        query = query.where(
            or_(
                Itemmaster.stockno.ilike(f"%{search}%"),
                Itemmaster.itemdesc.ilike(f"%{search}%"),
                Itemmaster.sfield1.ilike(f"%{search}%"),
            )
        )
    if class1cd:
        query = query.where(Itemmaster.class1cd == class1cd)
    if class2cd:
        query = query.where(Itemmaster.class2cd == class2cd)
    if subclass1cd:
        query = query.where(Itemmaster.subclass1cd == subclass1cd)

    query = query.order_by(Itemmaster.itemdesc).limit(limit).offset(offset)
    result = await db.execute(query)

    items = []
    for row in result:
        item, total_stock = row
        r = ItemResponse(
            stockno=item.stockno or "",
            batchsrlno=item.batchsrlno or 0,
            itemdesc=item.itemdesc or "",
            class1cd=item.class1cd or "",
            class2cd=item.class2cd or "",
            subclass1cd=item.subclass1cd,
            subclass2cd=item.subclass2cd,
            sizecd=item.sizecd,
            retail_price=item.retail_price,
            dealer_price=item.dealer_price,
            currentcost=item.currentcost,
            prodtaxtype=item.prodtaxtype,
            analcode32=item.analcode32,
            sfield1=item.sfield1,
            isinventoryitem=item.isinventoryitem,
            isbillable=item.isbillable,
            isservice=item.isservice,
            gradecd=item.gradecd,
            imageid=item.imageid,
            finalmrp=item.finalmrp,
            dateinsert=item.dateinsert,
            lastupdateddate=item.lastupdateddate,
            total_stock=int(total_stock or 0),
        )
        items.append(r)

    return items


@router.get("/{stockno}")
async def get_item(
    stockno: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Get a single item with full column set + stock total."""
    item = await db.scalar(
        select(Itemmaster).where(
            and_(
                Itemmaster.stockno == stockno,
                Itemmaster.tenant_id == current_user.tenant_id,
            )
        )
    )
    if not item:
        raise HTTPException(status_code=404, detail=f"StockNo '{stockno}' not found.")

    total_stock = (
        await db.scalar(
            select(func.sum(Stockmaster.curbalqty)).where(
                and_(
                    Stockmaster.stockno == stockno,
                    Stockmaster.tenant_id == current_user.tenant_id,
                )
            )
        )
        or 0
    )

    return {
        **{c.name: getattr(item, c.name) for c in Itemmaster.__table__.columns},
        "total_stock": float(total_stock),
    }


@router.get("/{stockno}/stock-matrix", response_model=StockMatrixResponse)
async def get_stock_matrix(
    stockno: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Location-wise stock for a specific item from Stockmaster."""
    result = await db.execute(
        select(Stockmaster).where(
            and_(
                Stockmaster.stockno == stockno,
                Stockmaster.tenant_id == current_user.tenant_id,
            )
        )
    )
    stocks = result.scalars().all()
    matrix = [
        StockMatrixEntry(
            locnid=s.locnid or 0,
            batchsrlno=s.batchsrlno or 0,
            curbalqty=s.curbalqty or Decimal("0"),
            curbalval=s.curbalval or Decimal("0"),
        )
        for s in stocks
    ]
    return StockMatrixResponse(stockno=stockno, matrix=matrix)


@router.patch("/{stockno}/price", status_code=status.HTTP_200_OK)
async def update_price(
    stockno: str,
    payload: PriceLevelUpdate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Update pricing fields on an existing item. Mirrors S9 price revision."""
    item = await db.scalar(
        select(Itemmaster).where(
            and_(
                Itemmaster.stockno == stockno,
                Itemmaster.tenant_id == current_user.tenant_id,
            )
        )
    )
    if not item:
        raise HTTPException(status_code=404, detail=f"StockNo '{stockno}' not found.")

    updates: dict = {}
    if payload.retail_price is not None:
        updates["retail_price"] = payload.retail_price
    if payload.dealer_price is not None:
        updates["dealer_price"] = payload.dealer_price
    if payload.currentcost is not None:
        updates["currentcost"] = payload.currentcost
        updates["lastpurchprice"] = payload.currentcost  # S9 rule
    if payload.finalmrp is not None:
        updates["finalmrp"] = payload.finalmrp
    updates["lastupdateddate"] = datetime.now()

    await db.execute(
        update(Itemmaster)
        .where(
            and_(
                Itemmaster.stockno == stockno,
                Itemmaster.tenant_id == current_user.tenant_id,
            )
        )
        .values(**updates)
    )
    await db.commit()
    return {
        "status": "success",
        "stockno": stockno,
        "updated_fields": list(updates.keys()),
    }


@router.post("/batch", response_model=BatchCreateResponse)
async def batch_create_items(
    payload: ItemBatchCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
):
    """Priority 1+2: Bulk create items with full cascade.
    Optimized for high-velocity sovereign sync to prevent connection loss.
    Mirrors S9 TempItemMaster batch-import pipeline."""
    vauid = str(current_user.user_id)
    vacompcode = current_user.store_id
    # Set tenant_id for helpers
    db.tenant_id = current_user.tenant_id

    # Pre-fetch existing StockNos to avoid N+1 inside the loop
    existing_q = await db.execute(
        select(Itemmaster.stockno).where(Itemmaster.tenant_id == current_user.tenant_id)
    )
    existing_codes = set(existing_q.scalars().all())

    success_count = skipped_count = error_count = 0
    created_items, skipped_codes = [], []
    cascade_counts = {
        "class12combo": 0,
        "subclass1cat": 0,
        "subclass2cat": 0,
        "sizecat": 0,
        "genlookup": 0,
    }
    last_err = None

    # Use a single transaction block for the entire batch
    for item_data in payload.items:
        # Each item gets its own Savepoint (nested transaction)
        async with db.begin_nested():
            try:
                # 1. Deduplication logic
                if item_data.stockno in existing_codes:
                    if payload.omit_duplicates:
                        skipped_count += 1
                        skipped_codes.append(item_data.stockno)
                        continue
                    else:
                        # Skip but don't error the whole batch
                        skipped_count += 1
                        skipped_codes.append(item_data.stockno)
                        continue

                # 2. Sequential Cascade
                t_id = current_user.tenant_id or "SYSTEM"
                if payload.sync_genlookup:
                    await _cascade_genlookup(db, item_data, vauid, vacompcode, t_id)
                    cascade_counts["genlookup"] += 1

                if payload.cascade_class12:
                    await _cascade_class12combo(db, item_data, vauid, vacompcode, t_id)
                    cascade_counts["class12combo"] += 1

                if payload.cascade_subclasses:
                    if item_data.subclass1cd:
                        await _cascade_subclass1(db, item_data, vauid, vacompcode, t_id)
                        cascade_counts["subclass1cat"] += 1
                    if item_data.subclass2cd:
                        await _cascade_subclass2(db, item_data, vauid, vacompcode, t_id)
                        cascade_counts["subclass2cat"] += 1

                if payload.cascade_sizecat and item_data.sizecd:
                    await _cascade_sizecat(db, item_data, vauid, vacompcode, t_id)
                    cascade_counts["sizecat"] += 1

                # 3. ItemMaster Creation
                item_dict = _s9_defaults(item_data, vauid, vacompcode)
                # Force string for PK compatibility
                item_dict["batchsrlno"] = str(item_data.batchsrlno or 0)

                new_item = Itemmaster(
                    **item_dict, tenant_id=current_user.tenant_id or "SYSTEM"
                )
                db.add(new_item)

                # Flush to trigger constraints/triggers early
                await db.flush()

                # 4. StockMaster init row
                await _insert_stockmaster_init(
                    db,
                    item_data.stockno,
                    item_data.batchsrlno,
                    vauid,
                    vacompcode,
                    tenant_id=current_user.tenant_id or "SYSTEM",
                )

                existing_codes.add(item_data.stockno)
                success_count += 1
                created_items.append(new_item)

            except Exception as e:
                error_count += 1
                last_err = str(e)
                print(
                    f"[SMRITI-OS] Error in batch item {item_data.stockno}: {last_err}"
                )
                # The nested transaction (savepoint) will rollback automatically on exit of context
                continue

    # Commit all successful items
    await db.commit()

    return BatchCreateResponse(
        success_count=success_count,
        skipped_count=skipped_count,
        error_count=error_count,
        items=[
            ItemResponse(
                stockno=i.stockno,
                batchsrlno=int(i.batchsrlno or 0),
                itemdesc=i.itemdesc,
                class1cd=i.class1cd,
                class2cd=i.class2cd,
                total_stock=0,
            )
            for i in created_items[:10]
        ],
        skipped_codes=skipped_codes,
        cascade_summary=cascade_counts,
        last_error=last_err,
    )
