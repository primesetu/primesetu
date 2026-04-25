# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

class TillBase(BaseModel):
    name: str
    code: str
    store_id: str

class TillCreate(TillBase):
    pass

class TillResponse(TillBase):
    id: uuid.UUID
    status: str
    current_cashier_id: Optional[str] = None
    cash_collected: float
    last_opening_at: Optional[datetime] = None
    last_closing_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TillUpdateStatus(BaseModel):
    status: str
    cashier_id: Optional[str] = None

class CashLiftCreate(BaseModel):
    amount: float
    reason: Optional[str] = "Regular Lift"
