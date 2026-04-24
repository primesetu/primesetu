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

from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SchemeBase(BaseModel):
    name: str
    type: str
    value: float
    min_amount: float
    is_active: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class SchemeCreate(SchemeBase):
    pass

class SchemeRead(SchemeBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
