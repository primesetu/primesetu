# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from pydantic import BaseModel, Field, ConfigDict, EmailStr
from uuid import UUID
from typing import Optional, List
from datetime import datetime, date

class CustomerBase(BaseModel):
    name: str = Field(..., example="Amit Kumar")
    phone: str = Field(..., min_length=10, example="9876543210")
    email: Optional[EmailStr] = None
    gstin: Optional[str] = Field(None, pattern=r'^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_code: Optional[str] = Field(None, min_length=2, max_length=2)
    pincode: Optional[str] = None
    credit_limit_paise: int = Field(default=0, ge=0)
    credit_days: int = Field(default=0, ge=0)
    price_group_id: Optional[UUID] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: UUID
    code: str
    loyalty_points: int
    is_active: bool
    created_at: datetime
    outstanding_paise: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class CustomerLookupResponse(BaseModel):
    found: bool
    id: Optional[UUID] = None
    code: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    loyalty_points: int = 0
    price_group_id: Optional[UUID] = None
    outstanding_paise: int = 0
    credit_limit_paise: int = 0

class LedgerEntryResponse(BaseModel):
    id: UUID
    txn_type: str
    txn_ref: str
    amount_paise: int
    balance_paise: int
    txn_date: date
    notes: Optional[str] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class LoyaltyRedeemRequest(BaseModel):
    points_to_redeem: int = Field(..., gt=0)
    invoice_value_paise: int = Field(..., gt=0) # To validate 50% rule
    sale_id: Optional[UUID] = None
