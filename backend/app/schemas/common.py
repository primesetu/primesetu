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

from pydantic import BaseModel, ConfigDict, Field
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
    mrp: int = 0  # In Paise
    tax_rate: float = 18.0 # Tax rates stay float/decimal
    is_tax_inclusive: bool = True
    is_inventory_item: bool = True
    attributes: Dict[str, Any] = {}

class ProductRead(ProductBase):
    id: uuid.UUID
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class ProductCreate(ProductBase):
    cost_price: int = 0 # In Paise

class TransactionItemBase(BaseModel):
    product_id: uuid.UUID
    qty: float # Quantity stays float for partial units
    mrp: int # In Paise
    discount_per: float = 0.0
    net_amount: int # In Paise

class TransactionCreate(BaseModel):
    store_id: str
    customer_id: Optional[uuid.UUID] = None
    type: str = "Sales"
    payment_mode: str = "CASH"
    subtotal: int # In Paise
    discount_total: int = 0 # In Paise
    tax_total: int = 0 # In Paise
    net_payable: int # In Paise
    items: List[TransactionItemBase]

class DashboardStats(BaseModel):
    today_revenue: int # In Paise
    active_skus: int
    bills_today: int
    low_stock_alerts: int
    revenue_change: float # Percentage change stays float
    sku_change: int

class PredictiveStats(BaseModel):
    stockout_forecast_count: int
    top_category: str
    predicted_days: float

class StoreRegistrationRequest(BaseModel):
    store_name: str = Field(..., max_length=200)
    store_code: str = Field(..., max_length=20)
    address: Optional[str] = None
    gstin: Optional[str] = None
    phone: Optional[str] = None
    state_code: Optional[str] = Field(None, max_length=2)
    admin_email: str = Field(..., max_length=200)
    admin_password: str = Field(..., min_length=6)
    admin_full_name: str = Field(..., max_length=200)

class RemoteCommandRead(BaseModel):
    id: str
    command_type: str
    payload: Optional[str] = None
    status: str
    is_destructive: bool = False
    requires_approval: bool = False
    model_config = ConfigDict(from_attributes=True)

class PulseRequest(BaseModel):
    transaction_count: int
    pending_sync_packets: int
    last_sync_id: Optional[uuid.UUID] = None
    
    # [PHASE 6] Supply Chain Intelligence
    critical_skus: int = 0
    surplus_skus: int = 0
    total_inventory_value: int = 0 # In paise

class NodeHealth(BaseModel):
    disk_percent: float
    db_latency_ms: float
    uptime_seconds: float
    status: str # HEALTHY, DEGRADED, CRITICAL

class PulseResponse(BaseModel):
    status: str
    server_time: datetime
    commands: List[RemoteCommandRead]
    health: Optional[NodeHealth] = None
    message: Optional[str] = None
    schema_version: str = "1.0.0"

class StockoutForecast(BaseModel):
    sku: str
    current_qty: float
    avg_daily: float
    doc: Optional[float]
    tier: str # CRITICAL, WARNING, HEALTHY
    reorder_at_date: Optional[datetime] = None

class NetworkStock(BaseModel):
    store_name: str
    store_code: str
    on_hand: float
    doc: Optional[float]
    tier: str
    distance_km: Optional[float] = None

class ISTRequest(BaseModel):
    sku: str
    from_store_id: str
    qty: float

class ISTRead(BaseModel):
    id: int
    sku: str
    from_store_id: str
    to_store_id: str
    qty: float
    status: str
    requested_at: datetime
    updated_at: datetime
    model_config = ConfigDict(from_attributes=True)
