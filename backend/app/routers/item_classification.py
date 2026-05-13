# ============================================================
# SMRITI-OS — Item Classification Router
# Endpoints for SubClass1Cat, SubClass2Cat, SizeCat, ExtdItemMaster
# Mirrors S9 TIER 1 dependency chain for ItemMaster
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# © 2026 — All Rights Reserved
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal
import logging

from app.core.database import get_db
from app.models.item_classification import (
    SubClass1Cat, SubClass2Cat, SizeCat, ExtdItemMaster
)

logger = logging.getLogger("smriti.classification")
router = APIRouter(prefix="/api/item-classification", tags=["Item Classification"])


# ─────────────────────────────────────────────────────────────
# PYDANTIC SCHEMAS
# ─────────────────────────────────────────────────────────────

class SubClass1CatIn(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    subclass1cd: str = Field(..., max_length=16)
    subclass1desc: Optional[str] = Field(None, max_length=40)
    prodtaxtype: Optional[str] = None
    analcode1: Optional[str] = None
    analcode2: Optional[str] = None
    analcode3: Optional[str] = None
    analcode4: Optional[str] = None
    analcode5: Optional[str] = None
    analcode32: Optional[str] = Field(None, description="HSN Code")

class SubClass1CatOut(SubClass1CatIn):
    id: int
    class Config: from_attributes = True

class SubClass2CatIn(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    subclass2cd: str = Field(..., max_length=16)
    subclass2desc: Optional[str] = Field(None, max_length=40)

class SubClass2CatOut(SubClass2CatIn):
    id: int
    class Config: from_attributes = True

class SizeCatIn(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    sizecd: str = Field(..., max_length=16)
    sizegroupid: Optional[str] = None
    ispivotalsize: Optional[int] = None
    sizegroupsrlno: Optional[int] = None
    idealstockratioqty: Optional[Decimal] = None
    convsizecd: Optional[str] = None
    convfactor: Optional[Decimal] = None

class SizeCatOut(SizeCatIn):
    id: int
    class Config: from_attributes = True

class ExtdItemIn(BaseModel):
    stockno: str = Field(..., max_length=32)
    item_ext_desc: Optional[str] = None
    image_id: Optional[str] = Field(None, max_length=60)
    image_url: Optional[str] = None

class ExtdItemOut(ExtdItemIn):
    class Config: from_attributes = True

class UpsertResponse(BaseModel):
    inserted: int
    updated: int
    skipped: int

class BackfillResponse(BaseModel):
    subclass1cat: int
    subclass2cat: int
    sizecat: int
    extd_item_master: int
    message: str


# ─────────────────────────────────────────────────────────────
# SubClass1Cat — Style Master
# ─────────────────────────────────────────────────────────────

@router.get("/styles", response_model=List[SubClass1CatOut], summary="List styles (SubClass1)")
async def list_styles(
    class1cd: Optional[str] = Query(None, description="Filter by Product"),
    class2cd: Optional[str] = Query(None, description="Filter by Brand"),
    limit: int = Query(200, le=2000),
    db: AsyncSession = Depends(get_db)
):
    """Get all style records, optionally filtered by Product+Brand."""
    q = select(SubClass1Cat)
    if class1cd:
        q = q.where(SubClass1Cat.class1cd == class1cd)
    if class2cd:
        q = q.where(SubClass1Cat.class2cd == class2cd)
    q = q.order_by(SubClass1Cat.class1cd, SubClass1Cat.class2cd, SubClass1Cat.subclass1cd).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/styles/upsert", response_model=UpsertResponse, summary="Upsert style (SubClass1)")
async def upsert_style(payload: SubClass1CatIn, db: AsyncSession = Depends(get_db)):
    """Create or update a style record. S9 cascade step 3."""
    existing = await db.execute(
        select(SubClass1Cat).where(
            SubClass1Cat.class1cd == payload.class1cd,
            SubClass1Cat.class2cd == payload.class2cd,
            SubClass1Cat.subclass1cd == payload.subclass1cd
        )
    )
    record = existing.scalar_one_or_none()
    if record:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(record, k, v)
        await db.flush()
        return UpsertResponse(inserted=0, updated=1, skipped=0)
    else:
        db.add(SubClass1Cat(**payload.model_dump()))
        await db.flush()
        return UpsertResponse(inserted=1, updated=0, skipped=0)


@router.post("/styles/bulk-upsert", response_model=UpsertResponse)
async def bulk_upsert_styles(items: List[SubClass1CatIn], db: AsyncSession = Depends(get_db)):
    """Batch upsert styles. Used during item import cascade."""
    ins, upd, skp = 0, 0, 0
    for item in items:
        existing = await db.execute(
            select(SubClass1Cat).where(
                SubClass1Cat.class1cd == item.class1cd,
                SubClass1Cat.class2cd == item.class2cd,
                SubClass1Cat.subclass1cd == item.subclass1cd
            )
        )
        record = existing.scalar_one_or_none()
        if record:
            for k, v in item.model_dump(exclude_unset=True).items():
                setattr(record, k, v)
            upd += 1
        else:
            db.add(SubClass1Cat(**item.model_dump()))
            ins += 1
    await db.flush()
    return UpsertResponse(inserted=ins, updated=upd, skipped=skp)


# ─────────────────────────────────────────────────────────────
# SubClass2Cat — Shade / Colour Master
# ─────────────────────────────────────────────────────────────

@router.get("/shades", response_model=List[SubClass2CatOut], summary="List shades (SubClass2)")
async def list_shades(
    class1cd: Optional[str] = Query(None),
    class2cd: Optional[str] = Query(None),
    limit: int = Query(200, le=2000),
    db: AsyncSession = Depends(get_db)
):
    q = select(SubClass2Cat)
    if class1cd: q = q.where(SubClass2Cat.class1cd == class1cd)
    if class2cd: q = q.where(SubClass2Cat.class2cd == class2cd)
    q = q.order_by(SubClass2Cat.subclass2cd).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/shades/upsert", response_model=UpsertResponse)
async def upsert_shade(payload: SubClass2CatIn, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(SubClass2Cat).where(
            SubClass2Cat.class1cd == payload.class1cd,
            SubClass2Cat.class2cd == payload.class2cd,
            SubClass2Cat.subclass2cd == payload.subclass2cd
        )
    )
    record = existing.scalar_one_or_none()
    if record:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(record, k, v)
        return UpsertResponse(inserted=0, updated=1, skipped=0)
    db.add(SubClass2Cat(**payload.model_dump()))
    await db.flush()
    return UpsertResponse(inserted=1, updated=0, skipped=0)


# ─────────────────────────────────────────────────────────────
# SizeCat — Size Master
# ─────────────────────────────────────────────────────────────

@router.get("/sizes", response_model=List[SizeCatOut], summary="List sizes (SizeCat)")
async def list_sizes(
    class1cd: Optional[str] = Query(None),
    class2cd: Optional[str] = Query(None),
    sizegroupid: Optional[str] = Query(None),
    limit: int = Query(200, le=2000),
    db: AsyncSession = Depends(get_db)
):
    q = select(SizeCat)
    if class1cd:    q = q.where(SizeCat.class1cd == class1cd)
    if class2cd:    q = q.where(SizeCat.class2cd == class2cd)
    if sizegroupid: q = q.where(SizeCat.sizegroupid == sizegroupid)
    q = q.order_by(SizeCat.sizegroupsrlno, SizeCat.sizecd).limit(limit)
    result = await db.execute(q)
    return result.scalars().all()


@router.post("/sizes/upsert", response_model=UpsertResponse)
async def upsert_size(payload: SizeCatIn, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(
        select(SizeCat).where(
            SizeCat.class1cd == payload.class1cd,
            SizeCat.class2cd == payload.class2cd,
            SizeCat.sizecd == payload.sizecd
        )
    )
    record = existing.scalar_one_or_none()
    if record:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(record, k, v)
        return UpsertResponse(inserted=0, updated=1, skipped=0)
    db.add(SizeCat(**payload.model_dump()))
    await db.flush()
    return UpsertResponse(inserted=1, updated=0, skipped=0)


@router.post("/sizes/bulk-upsert", response_model=UpsertResponse)
async def bulk_upsert_sizes(items: List[SizeCatIn], db: AsyncSession = Depends(get_db)):
    ins, upd = 0, 0
    for item in items:
        existing = await db.execute(
            select(SizeCat).where(
                SizeCat.class1cd == item.class1cd,
                SizeCat.class2cd == item.class2cd,
                SizeCat.sizecd == item.sizecd
            )
        )
        record = existing.scalar_one_or_none()
        if record:
            for k, v in item.model_dump(exclude_unset=True).items():
                setattr(record, k, v)
            upd += 1
        else:
            db.add(SizeCat(**item.model_dump()))
            ins += 1
    await db.flush()
    return UpsertResponse(inserted=ins, updated=upd, skipped=0)


# ─────────────────────────────────────────────────────────────
# ExtdItemMaster — Extended Description + Image
# ─────────────────────────────────────────────────────────────

@router.get("/extd/{stockno}", response_model=ExtdItemOut)
async def get_extd_item(stockno: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExtdItemMaster).where(ExtdItemMaster.stockno == stockno))
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(404, f"No extended record for SKU: {stockno}")
    return record


@router.post("/extd/upsert", response_model=ExtdItemOut)
async def upsert_extd_item(payload: ExtdItemIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ExtdItemMaster).where(ExtdItemMaster.stockno == payload.stockno))
    record = result.scalar_one_or_none()
    if record:
        for k, v in payload.model_dump(exclude_unset=True).items():
            setattr(record, k, v)
    else:
        record = ExtdItemMaster(**payload.model_dump())
        db.add(record)
    await db.flush()
    await db.refresh(record)
    return record


# ─────────────────────────────────────────────────────────────
# BACKFILL — Derive classification data from legacy.itemmaster
# ─────────────────────────────────────────────────────────────

@router.post("/backfill-from-legacy", response_model=BackfillResponse,
             summary="Backfill classification tables from legacy.itemmaster")
async def backfill_from_legacy(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db)
):
    """
    Derives SubClass1Cat, SubClass2Cat, SizeCat from the 40k+ items in
    legacy.itemmaster. Idempotent — safe to run multiple times.
    """
    counts = {"subclass1cat": 0, "subclass2cat": 0, "sizecat": 0, "extd_item_master": 0}

    try:
        # SubClass1Cat
        r = await db.execute(text("""
            INSERT INTO subclass1cat (class1cd, class2cd, subclass1cd, subclass1desc,
                analcode1, analcode2, analcode3, analcode4, analcode5, analcode32)
            SELECT DISTINCT ON (class1cd, class2cd, subclass1cd)
                class1cd, class2cd, subclass1cd, subclass1cd,
                analcode1, analcode2, analcode3, analcode4, analcode5, analcode32
            FROM legacy.itemmaster
            WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND subclass1cd IS NOT NULL
            ON CONFLICT ON CONSTRAINT uq_subclass1cat_pk DO NOTHING
        """))
        counts["subclass1cat"] = r.rowcount or 0
    except Exception as e:
        logger.warning(f"SubClass1Cat backfill: {e}")

    try:
        # SubClass2Cat
        r = await db.execute(text("""
            INSERT INTO subclass2cat (class1cd, class2cd, subclass2cd, subclass2desc)
            SELECT DISTINCT ON (class1cd, class2cd, subclass2cd)
                class1cd, class2cd, subclass2cd, subclass2cd
            FROM legacy.itemmaster
            WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND subclass2cd IS NOT NULL
            ON CONFLICT ON CONSTRAINT uq_subclass2cat_pk DO NOTHING
        """))
        counts["subclass2cat"] = r.rowcount or 0
    except Exception as e:
        logger.warning(f"SubClass2Cat backfill: {e}")

    try:
        # SizeCat
        r = await db.execute(text("""
            INSERT INTO sizecat (class1cd, class2cd, sizecd)
            SELECT DISTINCT class1cd, class2cd, sizecd
            FROM legacy.itemmaster
            WHERE class1cd IS NOT NULL AND class2cd IS NOT NULL AND sizecd IS NOT NULL
            ON CONFLICT ON CONSTRAINT uq_sizecat_pk DO NOTHING
        """))
        counts["sizecat"] = r.rowcount or 0
    except Exception as e:
        logger.warning(f"SizeCat backfill: {e}")

    try:
        # ExtdItemMaster
        r = await db.execute(text("""
            INSERT INTO extd_item_master (stockno, item_ext_desc, image_id)
            SELECT stockno, itemdesc, imageid
            FROM legacy.itemmaster
            WHERE itemdesc IS NOT NULL
            ON CONFLICT (stockno) DO NOTHING
        """))
        counts["extd_item_master"] = r.rowcount or 0
    except Exception as e:
        logger.warning(f"ExtdItemMaster backfill: {e}")

    await db.commit()

    return BackfillResponse(
        **counts,
        message=(
            f"Backfill complete. Styles: {counts['subclass1cat']}, "
            f"Shades: {counts['subclass2cat']}, "
            f"Sizes: {counts['sizecat']}, "
            f"ExtdDesc: {counts['extd_item_master']}"
        )
    )


# ─────────────────────────────────────────────────────────────
# HEALTH / STATS
# ─────────────────────────────────────────────────────────────

@router.get("/stats", summary="Classification table record counts")
async def get_stats(db: AsyncSession = Depends(get_db)):
    """Quick health check — returns row counts for all 4 tables."""
    sc1 = (await db.execute(select(func.count()).select_from(SubClass1Cat))).scalar()
    sc2 = (await db.execute(select(func.count()).select_from(SubClass2Cat))).scalar()
    sz  = (await db.execute(select(func.count()).select_from(SizeCat))).scalar()
    eim = (await db.execute(select(func.count()).select_from(ExtdItemMaster))).scalar()
    return {
        "subclass1cat": sc1,
        "subclass2cat": sc2,
        "sizecat": sz,
        "extd_item_master": eim,
        "pipeline_ready": all(x is not None for x in [sc1, sc2, sz, eim])
    }
