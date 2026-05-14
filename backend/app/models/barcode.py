from sqlalchemy import Column, String, Float, Boolean, JSON, ForeignKey
from app.core.database import Base
from app.models.base import TimestampMixin, TenantMixin
import uuid

class BarcodeTemplate(Base, TimestampMixin, TenantMixin):
    __tablename__ = 'smriti_barcode_templates'
    __table_args__ = {'schema': 's9'}

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)
    printer_type = Column(String(20), default="STANDARD", nullable=False) # STANDARD or THERMAL
    width_mm = Column(Float, nullable=False, default=38.0)
    height_mm = Column(Float, nullable=False, default=25.0)
    layout_json = Column(JSON, nullable=False, default=list)
    is_active = Column(Boolean, default=True, nullable=False)
