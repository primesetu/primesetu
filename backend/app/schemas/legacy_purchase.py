# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/schemas/legacy_purchase.py
# (c) 2026 - All Rights Reserved
# ============================================================

from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class LegacyGRNItem(BaseModel):
    stockno: str
    qty: float
    rate: float
    mrp: float
    batchno: Optional[str] = None
    mfgdate: Optional[str] = None
    expdate: Optional[str] = None

class LegacyGRNCreate(BaseModel):
    vendor_code: str
    bill_no: str
    bill_date: date
    items: List[LegacyGRNItem]
    notes: Optional[str] = None
