from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime

class TillHardwareCreate(BaseModel):
    name: str = Field(..., description="Name of the till register")
    code: str = Field(..., description="Short system code")

class TillHardwareResponse(BaseModel):
    id: UUID
    store_id: UUID
    name: str
    code: str
    created_at: datetime

class TillSessionCreate(BaseModel):
    till_hardware_id: UUID
    opening_float: int = Field(..., description="Opening float in paise")

class TillSessionResponse(BaseModel):
    id: UUID
    store_id: UUID
    till_hardware_id: Optional[UUID] = None
    opened_by: UUID
    opened_at: datetime
    status: str
    opening_float: int
    closed_at: Optional[datetime] = None
    closed_by: Optional[UUID] = None
    expected_closing: Optional[int] = None
    actual_closing: Optional[int] = None
    variance: Optional[int] = None
    z_read_data: Optional[Dict[str, Any]] = None

class PosCashTrnCreate(BaseModel):
    till_session_id: UUID
    trn_type: str = Field(..., description="FLOAT_ADD, SAFE_DROP, EXPENSE, INCOME")
    amount: int = Field(..., description="Amount in paise")
    remarks: Optional[str] = None

class PosCashTrnResponse(BaseModel):
    id: UUID
    till_session_id: UUID
    trn_type: str
    amount: int
    remarks: Optional[str] = None
    created_at: datetime
