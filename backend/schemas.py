# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================

"""
schemas.py — Pydantic v2 request/response models

CHANGES:
  • BillCreate now requires store_id (from auth token, not body)
  • BillItemCreate has gst_rate, hsn_code, discount_amount
  • BillResponse exposes full GST breakdown
  • ProductCreate/ProductRead expose hsn_code, gst_rate, cost_price
  • DashboardStats computed from real DB data (no hardcoding)
"""

from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


# ── Product ───────────────────────────────────────────────────────────────────
class ProductCreate(BaseModel):
    sku: str         = Field(..., max_length=50)
    name: str        = Field(..., max_length=255)
    barcode: Optional[str] = Field(None, max_length=50)
    mrp: Decimal     = Field(..., gt=0, decimal_places=2)
    cost_price: Decimal = Field(Decimal("0.00"), ge=0, decimal_places=2)
    selling_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    stock_qty: int   = Field(0, ge=0)
    reorder_level: int = Field(5, ge=0)
    category: str    = Field(..., max_length=100)
    hsn_code: Optional[str] = Field(None, max_length=10,
        description="HSN/SAC code — 4, 6, or 8 digits")
    gst_rate: Decimal = Field(Decimal("18.00"), ge=0, le=28,
        description="GST rate % — 0 / 5 / 12 / 18 / 28")

    @field_validator("gst_rate")
    @classmethod
    def valid_gst_slab(cls, v):
        from app.core.gst import VALID_GST_RATES
        if v not in VALID_GST_RATES:
            raise ValueError(f"GST rate must be one of {sorted(VALID_GST_RATES)}")
        return v

    @field_validator("hsn_code")
    @classmethod
    def valid_hsn(cls, v):
        if v is not None:
            from app.core.gst import validate_hsn
            if not validate_hsn(v):
                raise ValueError("HSN code must be 4, 6, or 8 numeric digits")
        return v


class ProductRead(ProductCreate):
    model_config = ConfigDict(from_attributes=True)
    id: int
    is_active: bool
    created_at: datetime


class ProductUpdate(BaseModel):
    """Partial update — all fields optional."""
    name: Optional[str]           = None
    barcode: Optional[str]        = None
    mrp: Optional[Decimal]        = Field(None, gt=0, decimal_places=2)
    cost_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    selling_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    stock_qty: Optional[int]      = Field(None, ge=0)
    reorder_level: Optional[int]  = Field(None, ge=0)
    category: Optional[str]       = None
    hsn_code: Optional[str]       = None
    gst_rate: Optional[Decimal]   = None
    is_active: Optional[bool]     = None


# ── Bill line item ────────────────────────────────────────────────────────────
class BillItemCreate(BaseModel):
    product_id: int
    qty: int            = Field(..., gt=0)
    unit_price: Decimal = Field(..., gt=0, decimal_places=2)
    mrp_at_billing: Decimal = Field(..., gt=0, decimal_places=2)
    discount_amount: Decimal = Field(Decimal("0.00"), ge=0, decimal_places=2)
    hsn_code: Optional[str] = None
    gst_rate: Decimal   = Field(Decimal("18.00"), ge=0, le=28)


class BillItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    product_id: int
    qty: int
    unit_price: Decimal
    mrp_at_billing: Decimal
    discount_amount: Decimal
    hsn_code: Optional[str]
    gst_rate: Decimal
    taxable_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    line_total: Decimal


# ── Bill ──────────────────────────────────────────────────────────────────────
class BillCreate(BaseModel):
    customer_name: Optional[str]  = None
    customer_phone: Optional[str] = None
    customer_gstin: Optional[str] = None
    payment_mode: str = Field("cash",
        pattern="^(cash|upi|card|credit|split)$")
    bill_type: str    = Field("sale",
        pattern="^(sale|return|slip)$")
    items: List[BillItemCreate] = Field(..., min_length=1)

    @field_validator("customer_gstin")
    @classmethod
    def valid_gstin(cls, v):
        if v is not None:
            from app.core.gst import validate_gstin
            if not validate_gstin(v):
                raise ValueError("Invalid GSTIN format")
        return v


class BillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    store_id: str
    bill_number: str
    customer_name: Optional[str]
    customer_phone: Optional[str]
    customer_gstin: Optional[str]
    bill_type: str
    payment_mode: str
    subtotal_amount: Decimal
    discount_amount: Decimal
    cgst_amount: Decimal
    sgst_amount: Decimal
    igst_amount: Decimal
    total_tax_amount: Decimal
    round_off: Decimal
    total_amount: Decimal
    is_cancelled: bool
    created_at: datetime
    items: List[BillItemResponse] = []


class BillSummary(BaseModel):
    """Lightweight bill response for list endpoints."""
    model_config = ConfigDict(from_attributes=True)
    id: int
    bill_number: str
    customer_name: Optional[str]
    payment_mode: str
    total_amount: Decimal
    is_cancelled: bool
    created_at: datetime


# ── Dashboard ─────────────────────────────────────────────────────────────────
class DashboardStats(BaseModel):
    today_revenue: Decimal
    active_skus: int
    bills_today: int
    low_stock_alerts: int
    revenue_change: Optional[float] = None   # % vs yesterday
    sku_change: Optional[int]       = None


# ── Day-end summary ───────────────────────────────────────────────────────────
class DayEndSummary(BaseModel):
    total_revenue: Decimal
    total_bills: int
    total_tax_collected: Decimal
    cgst_collected: Decimal
    sgst_collected: Decimal
    igst_collected: Decimal
    cash_sales: Decimal
    upi_sales: Decimal
    card_sales: Decimal
    credit_sales: Decimal
    cancelled_bills: int
