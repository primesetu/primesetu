# ============================================================
# SMRITI-OS — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, text
from datetime import datetime, timedelta
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Transaction, TransactionItem, Item, ItemStock

router = APIRouter(prefix="/api/v1/intelligence", tags=["intelligence"])

@router.get("/doc")
async def get_days_of_cover(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Predictive Days of Cover (DoC) Analysis.
    Calculates stock runway based on 30-day sales velocity.
    """
    store_id = current_user.store_id
    thirty_days_ago = datetime.now() - timedelta(days=30)

    # 1. Get Sales Velocity (Last 30 Days)
    velocity_stmt = (
        select(
            TransactionItem.product_id,
            func.sum(TransactionItem.qty).label("total_sold")
        )
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(
            and_(
                Transaction.store_id == store_id,
                Transaction.status == "Finalized",
                Transaction.created_at >= thirty_days_ago
            )
        )
        .group_by(TransactionItem.product_id)
    )
    velocity_res = await db.execute(velocity_stmt)
    velocity_map = {row.product_id: row.total_sold / 30.0 for row in velocity_res}

    # 2. Get Current Stock Levels
    stock_stmt = (
        select(
            Item.id,
            Item.item_name,
            Item.sku_code,
            Item.brand,
            func.sum(ItemStock.qty_on_hand).label("current_stock")
        )
        .join(ItemStock, ItemStock.item_id == Item.id)
        .where(ItemStock.store_id == store_id)
        .group_by(Item.id)
    )
    stock_res = await db.execute(stock_stmt)
    
    analysis = []
    for row in stock_res:
        velocity = velocity_map.get(row.id, 0.0)
        doc = 999 # Infinity for zero velocity
        if velocity > 0:
            doc = round(row.current_stock / velocity, 1)
        
        status = "HEALTHY"
        if doc < 7: status = "CRITICAL"
        elif doc < 15: status = "WARNING"
        elif doc > 180 and velocity > 0: status = "OVERSTOCK"
        elif velocity == 0: status = "DEAD"

        analysis.append({
            "id": str(row.id),
            "sku": row.sku_code,
            "name": row.item_name,
            "brand": row.brand,
            "stock": row.current_stock,
            "velocity": round(velocity, 2),
            "doc": doc,
            "status": status
        })

    return sorted(analysis, key=lambda x: x["doc"])

@router.get("/risk-summary")
async def get_inventory_risk_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Aggregated risk profile for the store."""
    data = await get_days_of_cover(db, current_user)
    
    summary = {
        "CRITICAL": 0,
        "WARNING": 0,
        "HEALTHY": 0,
        "OVERSTOCK": 0,
        "DEAD": 0
    }
    
    for item in data:
        summary[item["status"]] += 1
        
    return summary
