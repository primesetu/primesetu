# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, List
from datetime import datetime

class BarcodeResponse(BaseModel):
    barcode: str
    barcode_type: str
    item_id: UUID
    item_code: str
    item_name: str
    size: Optional[str] = None
    colour: Optional[str] = None
    mrp_paise: int
    gst_rate: int
    hsn_code: str
    qty_on_hand: int = 0
    
    model_config = ConfigDict(from_attributes=True)

class BarcodeGenerateRequest(BaseModel):
    item_id: UUID
    barcode_type: str = Field(default="EAN13", pattern="^(EAN13|CODE128|QR|INTERNAL)$")
    size: Optional[str] = None
    colour: Optional[str] = None
    is_primary: bool = True

class BarcodePrintRequest(BaseModel):
    barcode: str
    copies: int = Field(default=1, ge=1, le=100)
    printer_ip: Optional[str] = None
    label_profile: Optional[dict] = None
    custom_template: Optional[str] = None

class BulkImportItem(BaseModel):
    item_code: str
    barcode: str
    barcode_type: str
    size: Optional[str] = None
    colour: Optional[str] = None

class BulkImportRequest(BaseModel):
    items: List[BulkImportItem]
