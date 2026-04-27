from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class TillHardware(Base):
    __tablename__ = "till_hardware"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, nullable=False)
    code = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

class TillSession(Base):
    __tablename__ = "till_sessions"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    till_hardware_id = Column(PGUUID(as_uuid=True), ForeignKey("till_hardware.id"), nullable=True) # Added FK
    opened_by = Column(PGUUID(as_uuid=True), nullable=False)
    closed_by = Column(PGUUID(as_uuid=True), nullable=True)
    opened_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
    closed_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(String, nullable=False, default="OPEN")
    opening_float = Column(Integer, nullable=False, default=0)
    expected_closing = Column(Integer, nullable=True)
    actual_closing = Column(Integer, nullable=True)
    variance = Column(Integer, nullable=True)
    z_read_data = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

class PosCashTrn(Base):
    __tablename__ = "pos_cash_trn"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    till_session_id = Column(PGUUID(as_uuid=True), ForeignKey("till_sessions.id"), nullable=False)
    user_id = Column(PGUUID(as_uuid=True), nullable=False)
    trn_type = Column(String, nullable=False)
    amount = Column(Integer, nullable=False)
    remarks = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)
