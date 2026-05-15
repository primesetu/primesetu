import logging
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sovereign import SmritiStock, SmritiStockMovement, SmritiParam

logger = logging.getLogger("smriti.predictive")

# ── CONFIGURATION ─────────────────────────────────────────────
DEFAULT_REORDER_DAYS = 14

async def get_reorder_days(db: AsyncSession, tenant_id: str = "SYSTEM") -> int:
    """Fetch reorder_days from SmritiParam, fallback to default."""
    stmt = select(SmritiParam).where(
        SmritiParam.tenant_id == tenant_id,
        SmritiParam.param_code == "REORDER_DAYS"
    )
    res = await db.execute(stmt)
    param = res.scalar_one_or_none()
    if param:
        return param.value_int
    return DEFAULT_REORDER_DAYS

# ── ENGINE ────────────────────────────────────────────────────

async def calc_days_of_cover(
    sku: str, 
    store_id: str, 
    db: AsyncSession, 
    window_days: int = 30
) -> Optional[float]:
    """
    Core DoC Formula: current_stock / avg_daily_consumption.
    Demand signal is isolated to SALE movements only.
    """
    cutoff = datetime.utcnow() - timedelta(days=window_days)
    
    # 1. Calculate Average Daily Sales (ADS)
    ads_stmt = select(func.sum(SmritiStockMovement.qty)).where(
        and_(
            SmritiStockMovement.sku == sku,
            SmritiStockMovement.store_id == store_id,
            SmritiStockMovement.movement_type == 10, # SALE
            SmritiStockMovement.moved_at >= cutoff
        )
    )
    total_sold = await db.scalar(ads_stmt) or 0
    ads = float(total_sold) / window_days
    
    if ads <= 0:
        return None 

    # 2. Get Current Stock
    stock_stmt = select(SmritiStock.on_hand).where(
        and_(
            SmritiStock.sku == sku,
            SmritiStock.store_id == store_id
        )
    )
    current_qty = await db.scalar(stock_stmt) or 0
    
    # 3. Final DoC
    doc = float(current_qty) / ads
    return round(doc, 2)

async def get_all_forecasts(
    db: AsyncSession, 
    store_id: str, 
    window_days: int = 30
) -> List[dict]:
    """
    SQL-Optimized DoC Engine.
    Calculates Days of Cover for ALL items in a single aggregation query.
    Avoids the O(N) Python loop entirely.
    """
    cutoff = datetime.utcnow() - timedelta(days=window_days)
    
    # CTE: Aggregate Sales per SKU
    sales_subquery = (
        select(
            SmritiStockMovement.sku,
            func.sum(SmritiStockMovement.qty).label("total_sold")
        )
        .where(
            and_(
                SmritiStockMovement.store_id == store_id,
                SmritiStockMovement.movement_type == 10,
                SmritiStockMovement.moved_at >= cutoff
            )
        )
        .group_by(SmritiStockMovement.sku)
        .subquery()
    )

    # Join with Current Stock
    stmt = (
        select(
            SmritiStock.sku,
            SmritiStock.on_hand,
            func.coalesce(sales_subquery.c.total_sold, 0).label("total_sold")
        )
        .outerjoin(sales_subquery, SmritiStock.sku == sales_subquery.c.sku)
        .where(SmritiStock.store_id == store_id)
    )
    
    res = await db.execute(stmt)
    rows = res.all()
    
    forecasts = []
    reorder_days = await get_reorder_days(db)
    
    for r in rows:
        ads = float(r.total_sold) / window_days
        doc = float(r.on_hand) / ads if ads > 0 else None
        
        tier = "HEALTHY"
        if doc is not None:
            if doc < reorder_days:
                tier = "CRITICAL"
            elif doc < (reorder_days * 1.5):
                tier = "WARNING"
        
        forecasts.append({
            "sku": r.sku,
            "current_qty": float(r.on_hand),
            "avg_daily": round(ads, 2),
            "doc": round(doc, 2) if doc is not None else None,
            "tier": tier,
            "reorder_at_date": (datetime.utcnow() + timedelta(days=doc)) if doc is not None else None
        })
        
    return forecasts

async def get_stockout_tier(doc: float, reorder_days: int) -> str:
    """Classify risk tier based on DoC and Reorder Window."""
    if doc < reorder_days:
        return "CRITICAL"
    if doc < (reorder_days * 1.5):
        return "WARNING"
    return "HEALTHY"

async def sync_movements_from_sales(db: AsyncSession, store_id: str):
    """
    Backfill SmritiStockMovement from SmritiSaleDtl.
    Ensures DoC engine has data immediately after Phase 5.2 deploy.
    """
    from app.models.sovereign import SmritiSaleDtl, SmritiSaleHdr
    
    # 1. Fetch all sales details for this store
    stmt = select(SmritiSaleDtl).join(SmritiSaleHdr, SmritiSaleHdr.id == SmritiSaleDtl.sale_id).where(
        SmritiSaleHdr.store_id == store_id
    )
    res = await db.execute(stmt)
    details = res.scalars().all()
    
    # 2. Convert to movements if not already present
    for d in details:
        # Check if movement exists for this reference
        check_stmt = select(SmritiStockMovement).where(
            and_(
                SmritiStockMovement.sku == d.sku,
                SmritiStockMovement.reference_id == d.bill_no,
                SmritiStockMovement.movement_type == 10
            )
        )
        exists = await db.scalar(check_stmt)
        if not exists:
            # Fetch bill_date from header for moved_at
            hdr = await db.get(SmritiSaleHdr, d.sale_id)
            moved_at = hdr.bill_date if hdr else datetime.utcnow()
            
            m = SmritiStockMovement(
                sku=d.sku,
                store_id=store_id,
                movement_type=10,
                qty=d.qty,
                reference_id=d.bill_no,
                moved_at=moved_at
            )
            db.add(m)
    
    await db.commit()
    logger.info(f"[Predictive] Synced movements for store {store_id}")
