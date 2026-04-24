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
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class PaymentModeDetail(BaseModel):
    mode: str
    amount: float
    ref_no: Optional[str] = None

class BillItemCreate(BaseModel):
    product_id: uuid.UUID
    qty: float
    unit_price: float
    discount_per: float = 0.0

class BillCreate(BaseModel):
    customer_mobile: Optional[str] = None
    items: List[BillItemCreate]
    payments: Optional[List[PaymentModeDetail]] = None
    type: str = "Sales" # Sales, SalesReturn
    original_invoice_id: Optional[uuid.UUID] = None
    suspended_reason: Optional[str] = None

class BillResponse(BaseModel):
    status: str
    bill_number: Optional[str] = None
    transaction_id: uuid.UUID
    total: float

class SlipCreate(BaseModel):
    customer_mobile: Optional[str] = None
    items: List[BillItemCreate]

class SlipResponse(BaseModel):
    status: str
    slip_no: str
    slip_id: uuid.UUID
    total: float
