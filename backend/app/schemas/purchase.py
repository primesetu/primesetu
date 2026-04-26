# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Document : backend/app/schemas/purchase.py
# (c) 2026 - All Rights Reserved
# ============================================================

from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime, date
from typing import List, Optional

class POItemBase(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    qty_ordered: int
    unit_cost_paise: int
    tax_rate: int = 0

class POItemCreate(POItemBase):
    pass

class POItem(POItemBase):
    id: UUID
    qty_received: int
    tax_paise: int
    total_paise: int
    model_config = ConfigDict(from_attributes=True)

class POCreate(BaseModel):
    vendor_id: UUID
    po_number: str
    expected_date: Optional[date] = None
    notes: Optional[str] = None
    items: List[POItemCreate]

class PO(BaseModel):
    id: UUID
    po_number: str
    vendor_id: UUID
    status: str
    total_paise: int
    tax_paise: int
    other_charges_paise: int
    expected_date: Optional[date]
    created_at: datetime
    items: List[POItem]
    model_config = ConfigDict(from_attributes=True)

# --- GRN ---
class GRNItemBase(BaseModel):
    item_id: UUID
    po_item_id: Optional[UUID] = None
    size: Optional[str] = None
    colour: Optional[str] = None
    qty_received: int
    unit_cost_paise: int

class GRNItemCreate(GRNItemBase):
    pass

class GRNItem(GRNItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class GRNCreate(BaseModel):
    po_id: Optional[UUID] = None
    vendor_id: UUID
    grn_number: str
    notes: Optional[str] = None
    items: List[GRNItemCreate]

class GRN(BaseModel):
    id: UUID
    grn_number: str
    po_id: Optional[UUID]
    vendor_id: UUID
    received_at: datetime
    received_by: UUID
    notes: Optional[str]
    items: List[GRNItem]
    model_config = ConfigDict(from_attributes=True)
