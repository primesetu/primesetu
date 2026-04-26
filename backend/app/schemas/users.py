# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# ============================================================

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: str = Field(..., max_length=200)
    password: str = Field(..., min_length=6)
    full_name: str = Field(..., max_length=200)
    role: str = Field(..., pattern="^(cashier|manager|admin)$")

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[str] = Field(None, pattern="^(cashier|manager|admin)$")
    active: Optional[bool] = None

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    store_id: str
    email: str
    full_name: Optional[str]
    role: str
    active: bool
    created_at: datetime
