from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

class PromoBillDiscCreate(BaseModel):
    min_bill_amt: int = Field(..., description="Minimum bill amount in paise")
    max_bill_amt: Optional[int] = None
    disc_type: str = Field(..., description="PERCENTAGE or FLAT_AMOUNT")
    disc_value: int = Field(..., description="Discount value (amount in paise, or percentage 1-100)")

class PromoBuyGetCreate(BaseModel):
    buy_item_id: Optional[UUID] = None
    buy_qty: int
    get_item_id: Optional[UUID] = None
    get_qty: int
    get_disc_pct: int = 100

class PromoHeaderCreate(BaseModel):
    promo_code: str
    description: str
    promo_type: str = Field(..., description="BILL_LEVEL, ITEM_LEVEL, BUY_GET")
    priority: int = 1
    is_active: bool = True
    valid_from: datetime
    valid_to: datetime
    happy_hours: Optional[Dict[str, Any]] = None
    bill_discounts: Optional[List[PromoBillDiscCreate]] = []
    buy_get_rules: Optional[List[PromoBuyGetCreate]] = []

class PromoHeaderResponse(PromoHeaderCreate):
    id: UUID
    store_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True
