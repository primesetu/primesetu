# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DashboardStats(BaseModel):
    today_revenue: float
    active_skus: int
    bills_today: int
    low_stock_alerts: int
    revenue_change: float
    sku_change: int

class ProductRead(BaseModel):
    id: int
    sku: str
    name: str
    mrp: float
    stock_qty: int
    category: str
    is_active: bool

    class Config:
        from_attributes = True

class BillItemCreate(BaseModel):
    product_id: int
    qty: int
    unit_price: float

class BillCreate(BaseModel):
    customer_name: Optional[str] = None
    items: List[BillItemCreate]

