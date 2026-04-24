# ============================================================
# * PrimeSetu â€” Shoper9-Based Retail OS
# * Zero Cloud Â. Sovereign Â. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * Â(c) 2026 â€” All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

class ProductBase(BaseModel):
    code: str
    name: str
    brand: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    size: Optional[str] = None
    color: Optional[str] = None
    mrp: float = 0.0
    tax_rate: float = 18.0
    is_tax_inclusive: bool = True
    is_inventory_item: bool = True
    attributes: Dict[str, Any] = {}

class ProductRead(ProductBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(ProductBase):
    cost_price: float = 0.0

class TransactionItemBase(BaseModel):
    product_id: uuid.UUID
    qty: float
    mrp: float
    discount_per: float = 0.0
    net_amount: float

class TransactionCreate(BaseModel):
    store_id: str
    customer_id: Optional[uuid.UUID] = None
    type: str = "Sales"
    payment_mode: str = "CASH"
    subtotal: float
    discount_total: float = 0.0
    tax_total: float = 0.0
    net_payable: float
    items: List[TransactionItemBase]

class DashboardStats(BaseModel):
    today_revenue: float
    active_skus: int
    bills_today: int
    low_stock_alerts: int
    revenue_change: float
    sku_change: int

class PredictiveStats(BaseModel):
    stockout_forecast_count: int
    top_category: str
    predicted_days: float
