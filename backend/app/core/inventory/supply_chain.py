from typing import Dict, Any
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.sovereign import SmritiStock, SmritiItem
from app.core.inventory.predictive import get_inventory_forecast

async def get_supply_chain_metrics(db: AsyncSession, current_user: Any) -> Dict[str, int]:
    """
    Calculate high-level supply chain metrics for the HQ Pulse.
    """
    store_id = current_user.store_id
    
    # 1. Get detailed forecast (Critical vs Surplus)
    forecasts = await get_inventory_forecast(db=db, current_user=current_user)
    
    critical_count = sum(1 for f in forecasts if f.tier == "CRITICAL")
    # Surplus = Healthy AND DoC > 60 days (approx)
    surplus_count = sum(1 for f in forecasts if f.tier == "HEALTHY" and (f.doc or 0) > 60)
    
    # 2. Total Inventory Value
    # Joined query: Stock * Item.mrp
    value_stmt = select(func.sum(SmritiStock.on_hand * SmritiItem.mrp)).join(
        SmritiItem, SmritiItem.sku == SmritiStock.sku
    ).where(SmritiStock.store_id == store_id)
    
    total_value = await db.scalar(value_stmt) or 0
    
    return {
        "critical_skus": critical_count,
        "surplus_skus": surplus_count,
        "total_inventory_value": int(total_value)
    }
