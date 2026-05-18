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
    po_ctrl_no: Optional[int] = None  # Link to PO if Against PO
    items: List[LegacyGRNItem]
    notes: Optional[str] = None

class PurchaseOrderItemCreate(BaseModel):
    stockno: str
    qty: float
    rate: float
    mrp: Optional[float] = 0.0
    size: Optional[str] = None
    colour: Optional[str] = None
    remarks: Optional[str] = None

class PurchaseOrderCreate(BaseModel):
    vendor_code: str
    po_date: date
    delivery_date: Optional[date] = None
    items: List[PurchaseOrderItemCreate]
    remarks: Optional[str] = None
    is_sizewise: bool = False
    advance_percent: Optional[int] = 0
