# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/schemas/warehouse.py
# (c) 2026 - All Rights Reserved
# ============================================================

from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional

class StockAdjustmentRequest(BaseModel):
    sku: str
    qty_change: int
    reason_code: str # DAMAGE, GIFT, RETURN, ADJUSTMENT

class StockTransferItem(BaseModel):
    sku: str
    qty: int

class StockTransferRequest(BaseModel):
    source_store_id: str
    destination_store_id: str
    items: List[StockTransferItem]
    notes: Optional[str] = None

class BinAssignmentRequest(BaseModel):
    sku: str
    bin_location: str
    shelf_no: Optional[str] = None
