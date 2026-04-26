/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================ */

from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import List, Optional

# --- Purchase Order ---
class POItemBase(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    qty_ordered: int
    unit_cost_paise: int

class POItemCreate(POItemBase):
    pass

class POItem(POItemBase):
    id: UUID
    qty_received: int
    total_paise: int
    model_config = ConfigDict(from_attributes=True)

class POCreate(BaseModel):
    supplier_id: UUID
    expected_at: Optional[datetime] = None
    items: List[POItemCreate]

class PO(BaseModel):
    id: UUID
    order_no: str
    supplier_id: UUID
    status: str
    total_amount_paise: int
    expected_at: Optional[datetime]
    created_at: datetime
    items: List[POItem]
    model_config = ConfigDict(from_attributes=True)

# --- GRN ---
class GRNCreate(BaseModel):
    po_id: UUID
    grn_no: str
    remarks: Optional[str] = None
    # Items to receive (mapped by po_item_id)
    items: List[dict] # [{"po_item_id": UUID, "qty": int}]

class GRN(BaseModel):
    id: UUID
    po_id: UUID
    grn_no: str
    received_at: datetime
    received_by: UUID
    remarks: Optional[str]
    model_config = ConfigDict(from_attributes=True)

# --- Inventory Audit ---
class AuditItemBase(BaseModel):
    item_id: UUID
    size: Optional[str] = None
    colour: Optional[str] = None
    physical_qty: int

class AuditItemCreate(AuditItemBase):
    pass

class AuditItem(AuditItemBase):
    id: UUID
    system_qty: int
    variance: int
    model_config = ConfigDict(from_attributes=True)

class AuditCreate(BaseModel):
    audit_no: str
    items: List[AuditItemCreate]

class AuditEntryCreate(BaseModel):
    item_id: UUID
    physical_qty: int
    size: Optional[str] = None
    colour: Optional[str] = None

class Audit(BaseModel):
    id: UUID
    audit_no: str
    status: str
    created_at: datetime
    submitted_at: Optional[datetime]
    items: List[AuditItem]
    model_config = ConfigDict(from_attributes=True)
