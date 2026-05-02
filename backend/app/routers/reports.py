# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem
from app.models.legacy_s9 import Itemmaster, Stockmaster
from app.core.security import require_auth, CurrentUser
from typing import List, Dict, Any, Optional
from fastapi.responses import JSONResponse
import json
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

@router.get("/sales-summary")
async def get_sales_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Intelligence: Fetches high-level sales KPI data.
    """
    stmt_totals = (
        select(
            func.count(Transaction.id).label("bills"),
            func.sum(Transaction.net_payable).label("revenue")
        )
        .where(and_(
            Transaction.store_id == current_user.store_id,
            Transaction.status == "Finalized"
        ))
    )
    totals_res = (await db.execute(stmt_totals)).fetchone()
    revenue = float(totals_res.revenue or 0.0) / 100.0 # Convert from Paise
    bills = int(totals_res.bills or 0)

    seven_days_ago = datetime.now() - timedelta(days=7)
    stmt_trend = (
        select(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.net_payable).label("amount")
        )
        .where(and_(
            Transaction.store_id == current_user.store_id,
            Transaction.status == "Finalized",
            Transaction.created_at >= seven_days_ago
        ))
        .group_by(func.date(Transaction.created_at))
        .order_by(func.date(Transaction.created_at))
    )
    trend_res = await db.execute(stmt_trend)
    daily = [{"date": row.date.strftime("%Y-%m-%d"), "amount": float(row.amount) / 100.0} for row in trend_res]

    return {
        "revenue": revenue,
        "bills": bills,
        "daily": daily
    }

@router.get("/sales-by-attribute")
async def get_sales_by_attribute(
    attribute: str = "category", # size, colour, brand, category
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Intelligence: Aggregate sales data by Shoper 9 attributes.
    """
    # Map SMRITI attributes to Shoper 9 fields
    attr_map = {
        "brand": Itemmaster.class1cd,
        "category": Itemmaster.class2cd,
        "size": Itemmaster.sizecd,
        "colour": Itemmaster.subclass2cd
    }
    
    if attribute not in attr_map:
        raise HTTPException(status_code=400, detail=f"Invalid attribute. Use one of: {list(attr_map.keys())}")

    attr_field = attr_map[attribute]

    stmt = (
        select(
            attr_field.label("label"),
            func.sum(TransactionItem.qty).label("total_qty"),
            func.sum(TransactionItem.net_amount).label("total_revenue")
        )
        .join(Itemmaster, TransactionItem.stock_no == Itemmaster.stockno)
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(and_(
            Transaction.store_id == current_user.store_id,
            Transaction.status == "Finalized"
        ))
        .group_by(attr_field)
        .order_by(func.sum(TransactionItem.net_amount).desc())
    )

    result = await db.execute(stmt)
    data = [{"label": row.label, "total_qty": float(row.total_qty), "total_revenue": float(row.total_revenue) / 100.0} for row in result]
    
    return {
        "attribute": attribute,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/inventory-valuation")
async def get_inventory_valuation(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Calculates current inventory valuation using Shoper 9 Stockmaster.
    """
    stmt_total = (
        select(
            func.sum(Itemmaster.retail_price * Stockmaster.curbalqty).label("total_valuation"),
            func.count(Itemmaster.stockno).label("total_skus")
        )
        .join(Stockmaster, Stockmaster.stockno == Itemmaster.stockno)
    )
    result = await db.execute(stmt_total)
    row = result.fetchone()
    total_valuation = float(row.total_valuation or 0.0) if row else 0.0
    total_skus = int(row.total_skus or 0) if row else 0
    
    stmt_cat = (
        select(
            Itemmaster.class2cd.label("category"),
            func.sum(Itemmaster.retail_price * Stockmaster.curbalqty).label("value")
        )
        .join(Stockmaster, Stockmaster.stockno == Itemmaster.stockno)
        .group_by(Itemmaster.class2cd)
        .order_by(func.sum(Itemmaster.retail_price * Stockmaster.curbalqty).desc())
    )
    cat_result = await db.execute(stmt_cat)
    by_category = [{"category": row.category or "Uncategorized", "value": float(row.value or 0)} for row in cat_result]

    return {
        "total_valuation": total_valuation,
        "total_skus": total_skus,
        "by_category": by_category
    }
