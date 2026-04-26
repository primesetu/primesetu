from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class PrintTemplateFieldCreate(BaseModel):
    field_name: str
    pos_x: Decimal = 0
    pos_y: Decimal = 0
    font_size: int = 12
    font_weight: str = "NORMAL"
    is_visible: bool = True

class PrintTemplateCreate(BaseModel):
    template_name: str
    template_type: str = Field(..., description="BILL_RECEIPT, BARCODE_LABEL, A4_INVOICE")
    is_active: bool = True
    page_width: int = 80
    page_height: int = 297
    fields: Optional[List[PrintTemplateFieldCreate]] = []

class ReportScheduleCreate(BaseModel):
    frequency: str = Field(..., description="DAILY, WEEKLY, MONTHLY")
    send_time: str
    email_to: str
    is_active: bool = True

class ReportConfigCreate(BaseModel):
    report_name: str
    module: str
    query_json: Dict[str, Any]
    schedules: Optional[List[ReportScheduleCreate]] = []

class PrintTemplateFieldResponse(PrintTemplateFieldCreate):
    id: UUID
    template_id: UUID
    class Config:
        from_attributes = True

class PrintTemplateResponse(PrintTemplateCreate):
    id: UUID
    store_id: UUID
    created_at: datetime
    fields: List[PrintTemplateFieldResponse] = []
    class Config:
        from_attributes = True

class ReportScheduleResponse(ReportScheduleCreate):
    id: UUID
    report_id: UUID
    store_id: UUID
    last_run_at: Optional[datetime] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ReportConfigResponse(ReportConfigCreate):
    id: UUID
    store_id: UUID
    created_at: datetime
    schedules: List[ReportScheduleResponse] = []
    class Config:
        from_attributes = True
