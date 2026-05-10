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
from app.models.sovereign import SmritiItem, SmritiStock, SmritiSaleHdr, SmritiSaleDtl

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
            SmritiSaleDtl.sku,
            func.sum(SmritiSaleDtl.qty).label("total_sold")
        )
        .join(SmritiSaleHdr, SmritiSaleHdr.bill_no == SmritiSaleDtl.bill_no)
        .where(
            SmritiSaleHdr.bill_date >= thirty_days_ago
        )
        .group_by(SmritiSaleDtl.sku)
    )
    velocity_res = await db.execute(velocity_stmt)
    velocity_map = {row.sku: float(row.total_sold) / 30.0 for row in velocity_res}

    # 2. Get Current Stock Levels
    stock_stmt = (
        select(
            SmritiItem.sku,
            SmritiItem.name,
            SmritiItem.class1,
            func.sum(SmritiStock.on_hand).label("current_stock")
        )
        .join(SmritiStock, SmritiStock.sku == SmritiItem.sku)
        .where(SmritiStock.store_id == store_id)
        .group_by(SmritiItem.sku, SmritiItem.name, SmritiItem.class1)
    )
    stock_res = await db.execute(stock_stmt)
    
    analysis = []
    for row in stock_res:
        velocity = velocity_map.get(row.sku, 0.0)
        doc = 999 # Infinity for zero velocity
        if velocity > 0:
            doc = round(float(row.current_stock) / velocity, 1)
        
        status = "HEALTHY"
        if doc < 7: status = "CRITICAL"
        elif doc < 15: status = "WARNING"
        elif doc > 180 and velocity > 0: status = "OVERSTOCK"
        elif velocity == 0: status = "DEAD"

        analysis.append({
            "id": row.sku,
            "sku": row.sku,
            "name": row.name,
            "brand": row.class1 or "Unknown",
            "stock": float(row.current_stock),
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
