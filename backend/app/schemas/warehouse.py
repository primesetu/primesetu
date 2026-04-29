# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/schemas/warehouse.py
# (c) 2026 - All Rights Reserved
# ============================================================

from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class StockAdjustmentRequest(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    batch_no: Optional[str] = None
    qty_change: int
    reason_code: str # DAMAGE, GIFT, RETURN, ADJUSTMENT

class StockTransferItem(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    batch_no: Optional[str] = None
    qty: int

class StockTransferRequest(BaseModel):
    source_store_id: str
    destination_store_id: str
    items: List[StockTransferItem]
    notes: Optional[str] = None

class BinAssignmentRequest(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    batch_no: Optional[str] = None
    bin_location: str
    shelf_no: Optional[str] = None
