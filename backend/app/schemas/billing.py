# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import uuid
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class PaymentModeDetail(BaseModel):
    mode: str
    amount: int = Field(..., description="Amount in paise (integer)")
    ref_no: Optional[str] = None

class BillItemCreate(BaseModel):
    product_id: uuid.UUID
    qty: float = Field(..., description="Quantity (decimal supported)")
    unit_price: int = Field(..., description="Unit price in paise (integer)")
    discount_per: int = Field(0, description="Discount percentage as integer")

class BillCreate(BaseModel):
    customer_mobile: Optional[str] = None
    items: List[BillItemCreate]
    payments: Optional[List[PaymentModeDetail]] = None
    type: str = "Sales" # Sales, SalesReturn
    till_id: Optional[uuid.UUID] = None
    original_invoice_id: Optional[uuid.UUID] = None
    suspended_reason: Optional[str] = None

class BillResponse(BaseModel):
    status: str
    bill_number: Optional[str] = None
    transaction_id: uuid.UUID
    total: int = Field(..., description="Total amount in paise (integer)")

class SlipCreate(BaseModel):
    customer_mobile: Optional[str] = None
    items: List[BillItemCreate]

class SlipResponse(BaseModel):
    status: str
    slip_no: str
    slip_id: uuid.UUID
    total: int = Field(..., description="Total amount in paise (integer)")
