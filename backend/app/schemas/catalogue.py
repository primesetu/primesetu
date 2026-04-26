# ============================================================
# * PrimeSetu â€” Shoper9-Based Retail OS
# * Zero Cloud Â. Sovereign Â. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * Â(c) 2026 â€” All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import uuid
from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime

class PartnerBase(BaseModel):
    type: str
    code: str
    name: str
    mobile: Optional[str] = None
    email: Optional[str] = None
    gst_no: Optional[str] = None
    is_active: bool = True

class PartnerRead(PartnerBase):
    id: uuid.UUID
    loyalty_points: int
    credit_limit: float
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class LookupBase(BaseModel):
    category: str
    code: str
    label: str
    sort_order: int = 0
    is_active: bool = True
    meta: Optional[Dict[str, Any]] = None

class LookupRead(LookupBase):
    id: uuid.UUID
    store_id: Optional[uuid.UUID] = None
    model_config = ConfigDict(from_attributes=True)

class UniversalSearchResponse(BaseModel):
    items: List[Any]
    partners: List[PartnerRead]
    lookups: List[LookupRead]
