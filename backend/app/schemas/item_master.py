# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import datetime, date

class SizeGroupCreate(BaseModel):
    name: str = Field(..., example="Apparel S/M/L")
    sizes: List[str] = Field(..., min_length=1, example=["S", "M", "L", "XL"])

class StockMatrixEntry(BaseModel):
    size: str
    colour: str
    qty_on_hand: int = Field(default=0, ge=0)

class ItemCreate(BaseModel):
    item_code: str = Field(..., max_length=20)
    item_name: str = Field(..., max_length=40)
    department_id: UUID
    brand: Optional[str] = None
    supplier_id: Optional[UUID] = None
    size_group_id: Optional[UUID] = None
    colour: Optional[str] = None
    colour_code: Optional[str] = None
    mrp_paise: int = Field(..., gt=0)
    cost_paise: Optional[int] = Field(default=None, gt=0)
    gst_rate: int = Field(..., description="Must be 0, 5, 12, 18, or 28")
    hsn_code: str
    stock_matrix: List[StockMatrixEntry] = []

class ItemResponse(BaseModel):
    id: UUID
    item_code: str
    item_name: str
    department_id: UUID
    brand: Optional[str] = None
    mrp_paise: int
    gst_rate: int
    hsn_code: str
    is_active: bool
    total_stock: int = 0
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class PriceLevelUpdate(BaseModel):
    price_level: str = Field(..., pattern="^(mrp|wholesale|staff|custom_1|custom_2)$")
    price_paise: int = Field(..., gt=0)
    valid_from: date = Field(default_factory=date.today)

class StockMatrixResponse(BaseModel):
    item_id: UUID
    matrix: List[StockMatrixEntry]
    
    model_config = ConfigDict(from_attributes=True)
