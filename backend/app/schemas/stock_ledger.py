# ============================================================
# SMRITI-OS — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class StockTransactionItemBase(BaseModel):
    item_id: UUID
    size: str
    colour: str
    qty: int = Field(..., description="Positive for Inward, Negative for Outward")
    unit_cost_paise: int = Field(..., gt=0)

class StockTransactionCreate(BaseModel):
    doc_no: str
    txn_type: str = Field(..., pattern="^(GRN|TRANSFER|ADJ|RETURN)$")
    from_store: Optional[str] = None
    to_store: Optional[str] = None
    shoper_recid: Optional[int] = None
    items: List[StockTransactionItemBase]

class StockTransactionItemRead(StockTransactionItemBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class StockTransactionRead(BaseModel):
    id: UUID
    doc_no: str
    doc_date: datetime
    txn_type: str
    from_store: Optional[str] = None
    to_store: Optional[str] = None
    shoper_recid: Optional[int] = None
    items: List[StockTransactionItemRead]
    model_config = ConfigDict(from_attributes=True)
