# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/models/pricing.py
# (c) 2026 - All Rights Reserved
# ============================================================

from __future__ import annotations
from sqlalchemy import String, Integer, Boolean, DateTime, text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from datetime import datetime
import uuid

class PriceRangeSetting(Base):
    __tablename__ = "price_range_settings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    fld_type: Mapped[int] = mapped_column(Integer, nullable=False)
    fld_id: Mapped[int] = mapped_column(Integer, nullable=False)
    fld_name: Mapped[str | None] = mapped_column(String(64), nullable=True)
    fld_caption: Mapped[str | None] = mapped_column(String(64), nullable=True)
    fld_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    fld_order: Mapped[int | None] = mapped_column(Integer, nullable=True)

class PriceRange(Base):
    __tablename__ = "price_range"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    price_type: Mapped[int] = mapped_column(Integer, nullable=False)
    doc_no_prefix: Mapped[str] = mapped_column(String(16), nullable=False)
    doc_no: Mapped[int] = mapped_column(Integer, nullable=False)
    srl_no: Mapped[int] = mapped_column(Integer, nullable=False)
    start_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    end_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    stock_no: Mapped[str | None] = mapped_column(String(32), nullable=True)
    selling_price_paise: Mapped[int] = mapped_column(Integer, default=0)
    min_price_paise: Mapped[int] = mapped_column(Integer, default=0)
    max_price_paise: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class PriceRevision(Base):
    __tablename__ = "price_revision"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    doc_no: Mapped[int] = mapped_column(Integer, nullable=False)
    file_number: Mapped[str | None] = mapped_column(String(32), nullable=True)
    stock_no: Mapped[str | None] = mapped_column(String(32), nullable=True)
    effective_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    retail_price_paise: Mapped[int] = mapped_column(Integer, default=0)
    dealer_price_paise: Mapped[int] = mapped_column(Integer, default=0)
    is_approved: Mapped[bool] = mapped_column(Boolean, default=False)
    shoper_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    history: Mapped[list["PriceRevisionHistory"]] = relationship("PriceRevisionHistory", back_populates="revision")

class PriceRevisionHistory(Base):
    __tablename__ = "price_revision_history"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    revision_id: Mapped[uuid.UUID | None] = mapped_column(ForeignKey("price_revision.id"), nullable=True)
    stock_no: Mapped[str | None] = mapped_column(String(32), nullable=True)
    old_price_paise: Mapped[int | None] = mapped_column(Integer, nullable=True)
    new_price_paise: Mapped[int | None] = mapped_column(Integer, nullable=True)
    changed_by: Mapped[uuid.UUID | None] = mapped_column(nullable=True) # Usually auth.uid()
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

    revision: Mapped[PriceRevision] = relationship("PriceRevision", back_populates="history")
