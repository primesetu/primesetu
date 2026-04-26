/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect : Jawahar R. M.
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from decimal import Decimal
from typing import Optional, List, Literal

class PriceGroupCreate(BaseModel):
    name: str = Field(..., max_length=50)
    code: str = Field(..., max_length=10, pattern=r'^[A-Z0-9_]+$')
    price_level: Optional[Literal['mrp','wholesale','staff','custom_1','custom_2']] = None
    discount_pct: Decimal = Field(default=Decimal('0'), ge=0, le=100)
    is_taxable: bool = True

class PriceGroupResponse(BaseModel):
    id: UUID
    name: str
    code: str
    price_level: Optional[str]
    discount_pct: Decimal
    is_taxable: bool
    
    model_config = ConfigDict(from_attributes=True)

class ItemPriceResolutionRequest(BaseModel):
    item_ids: List[UUID]
    price_group_id: Optional[UUID] = None

class ItemPriceResolutionResponse(BaseModel):
    item_id: UUID
    resolved_price_paise: int
    price_source: str # "price_level:wholesale" | "discount_pct:10%" | "mrp"
