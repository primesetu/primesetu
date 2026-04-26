from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, text, Numeric
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class PrintTemplate(Base):
    __tablename__ = "print_templates"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    template_name = Column(String, nullable=False)
    template_type = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    page_width = Column(Integer, nullable=False, default=80)
    page_height = Column(Integer, nullable=False, default=297)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    fields = relationship("PrintTemplateField", back_populates="template", cascade="all, delete-orphan")

class PrintTemplateField(Base):
    __tablename__ = "print_template_fields"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(PGUUID(as_uuid=True), ForeignKey("print_templates.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String, nullable=False)
    pos_x = Column(Numeric(10,2), nullable=False, default=0)
    pos_y = Column(Numeric(10,2), nullable=False, default=0)
    font_size = Column(Integer, nullable=False, default=12)
    font_weight = Column(String, nullable=False, default="NORMAL")
    is_visible = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    template = relationship("PrintTemplate", back_populates="fields")

class ReportConfig(Base):
    __tablename__ = "report_configs"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String, nullable=False)
    module = Column(String, nullable=False)
    query_json = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    schedules = relationship("ReportSchedule", back_populates="report", cascade="all, delete-orphan")

class ReportSchedule(Base):
    __tablename__ = "report_schedules"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(PGUUID(as_uuid=True), ForeignKey("report_configs.id", ondelete="CASCADE"), nullable=False)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    frequency = Column(String, nullable=False)
    send_time = Column(String, nullable=False)
    email_to = Column(String, nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    report = relationship("ReportConfig", back_populates="schedules")
