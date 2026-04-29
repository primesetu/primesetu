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
from typing import Optional, Dict, Any

class UIFieldConfigBase(BaseModel):
    screen_name: str
    field_name: str
    is_visible: bool = True
    is_mandatory: bool = False
    is_editable: bool = True
    default_value: Optional[str] = None
# BROWSE SETTINGS
    display_label: Optional[str] = None
    column_width: int = 150
    sort_order: int = 0
    format_type: str = "TEXT"
    
    shoper_recid: Optional[int] = None

class UIFieldConfigRead(UIFieldConfigBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class PrintTemplateBase(BaseModel):
    template_name: str
    template_type: str
    components: Dict[str, Any]
    is_default: bool = False
    shoper_recid: Optional[int] = None

class PrintTemplateRead(PrintTemplateBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class AttributeAliasBase(BaseModel):
    code_type: str = Field(..., pattern="^(ANAL_CODE|USER_FIELD|ANAL_CODE_NUM)$")
    code_index: int = Field(..., ge=1, le=32)
    alias_name: str
    is_mandatory: bool = False
    lookup_category: Optional[str] = None
    shoper_recid: Optional[int] = None

class AttributeAliasRead(AttributeAliasBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)

class CategoryPolicyBase(BaseModel):
    department_id: UUID
    retail_markup_per: float = 0.0
    dealer_markup_per: float = 0.0
    is_location_price_applicable: bool = False
    is_batch_price_applicable: bool = False
    is_grade_price_applicable: bool = False
    allow_multiple_prices: bool = False
    is_batch_applicable: bool = False
    size_group_id: Optional[str] = None
    is_mfg_date_mandatory: bool = False
    is_exp_date_mandatory: bool = False
    batch_mfg_format: Optional[str] = None
    batch_exp_format: Optional[str] = None
    stop_sales_before_expiry_days: int = 0
    preferred_vendor_id: Optional[str] = None
    is_service: bool = False
    is_consignment: bool = False
    shoper_recid: Optional[int] = None

class CategoryPolicyRead(CategoryPolicyBase):
    id: UUID
    model_config = ConfigDict(from_attributes=True)
