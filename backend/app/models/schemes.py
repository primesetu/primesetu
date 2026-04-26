from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Boolean, text
from sqlalchemy.dialects.postgresql import UUID as PGUUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from .base import Base

class PromoHeader(Base):
    __tablename__ = "promo_header"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id = Column(PGUUID(as_uuid=True), ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    promo_code = Column(String, nullable=False)
    description = Column(String, nullable=False)
    promo_type = Column(String, nullable=False)
    priority = Column(Integer, nullable=False, default=1)
    is_active = Column(Boolean, nullable=False, default=True)
    valid_from = Column(DateTime(timezone=True), nullable=False)
    valid_to = Column(DateTime(timezone=True), nullable=False)
    happy_hours = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    bill_discounts = relationship("PromoBillDisc", back_populates="promo", cascade="all, delete-orphan")
    buy_get_rules = relationship("PromoBuyGet", back_populates="promo", cascade="all, delete-orphan")

class PromoBillDisc(Base):
    __tablename__ = "promo_bill_disc"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promo_id = Column(PGUUID(as_uuid=True), ForeignKey("promo_header.id", ondelete="CASCADE"), nullable=False)
    min_bill_amt = Column(Integer, nullable=False)
    max_bill_amt = Column(Integer, nullable=True)
    disc_type = Column(String, nullable=False)
    disc_value = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    promo = relationship("PromoHeader", back_populates="bill_discounts")

class PromoBuyGet(Base):
    __tablename__ = "promo_buy_get"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    promo_id = Column(PGUUID(as_uuid=True), ForeignKey("promo_header.id", ondelete="CASCADE"), nullable=False)
    buy_item_id = Column(PGUUID(as_uuid=True), ForeignKey("items.id"), nullable=True)
    buy_qty = Column(Integer, nullable=False)
    get_item_id = Column(PGUUID(as_uuid=True), ForeignKey("items.id"), nullable=True)
    get_qty = Column(Integer, nullable=False)
    get_disc_pct = Column(Integer, nullable=False, default=100)
    created_at = Column(DateTime(timezone=True), server_default=text("now()"), nullable=False)

    promo = relationship("PromoHeader", back_populates="buy_get_rules")
