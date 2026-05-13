# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/models/config.py
# (c) 2026 - All Rights Reserved
# ============================================================

from __future__ import annotations
from sqlalchemy import String, Integer, Boolean, DateTime, text, ForeignKey, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from datetime import datetime
from typing import Optional, List
import uuid

class PrefixConfig(Base):
    __tablename__ = "prefix_config"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    trn_type: Mapped[str] = mapped_column(String(10), nullable=False)
    trn_name: Mapped[str] = mapped_column(String(128), nullable=False)
    trn_sub_name: Mapped[str | None] = mapped_column(String(128), nullable=True)
    op_id: Mapped[str | None] = mapped_column(String(10), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    terminal_wise_prefix: Mapped[bool] = mapped_column(Boolean, default=False)
    number_reset: Mapped[int] = mapped_column(Integer, default=0)
    parent_trn_type: Mapped[str | None] = mapped_column(String(10), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class PrefixMaster(Base):
    __tablename__ = "prefix_master"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    trn_type: Mapped[str] = mapped_column(String(10), nullable=False)
    op_id: Mapped[str] = mapped_column(String(10), nullable=False)
    terminal_group_id: Mapped[str] = mapped_column(String(32), nullable=False)
    srl_no: Mapped[int] = mapped_column(Integer, nullable=False)
    prefix: Mapped[str | None] = mapped_column(String(8), nullable=True)
    base_prefix: Mapped[str | None] = mapped_column(String(8), nullable=True)
    suffix: Mapped[str | None] = mapped_column(String(8), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    reset_type: Mapped[str | None] = mapped_column(String(16), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class PrefixTrnNo(Base):
    __tablename__ = "prefix_trn_no"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    trn_type: Mapped[str] = mapped_column(String(10), nullable=False)
    actual_prefix: Mapped[str] = mapped_column(String(16), nullable=False)
    doc_number: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"), onupdate=text("now()"))

class PrefixTerminalGroup(Base):
    __tablename__ = "prefix_terminal_groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    terminal_group_id: Mapped[str] = mapped_column(String(32), nullable=False)
    srl_no: Mapped[int] = mapped_column(Integer, nullable=False)
    terminal_id: Mapped[str | None] = mapped_column(String(32), nullable=True)
    description: Mapped[str | None] = mapped_column(String(128), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class UIFieldConfig(Base):
    __tablename__ = "ui_field_configs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    screen_name: Mapped[str] = mapped_column(String(64), nullable=False)
    field_name: Mapped[str] = mapped_column(String(64), nullable=False)
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_editable: Mapped[bool] = mapped_column(Boolean, default=True)
    default_value: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    display_label: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    column_width: Mapped[int] = mapped_column(Integer, default=150)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    format_type: Mapped[str] = mapped_column(String(32), default="TEXT")
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class AttributeAlias(Base):
    __tablename__ = "attribute_aliases"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    code_type: Mapped[str] = mapped_column(String(32), nullable=False) # ANAL_CODE, USER_FIELD, etc.
    code_index: Mapped[int] = mapped_column(Integer, nullable=False)
    alias_name: Mapped[str] = mapped_column(String(128), nullable=False)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    lookup_category: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

class CategoryPolicy(Base):
    __tablename__ = "category_policies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"), nullable=False)
    retail_markup_per: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0)
    dealer_markup_per: Mapped[float] = mapped_column(Numeric(10, 4), default=0.0)
    is_location_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_batch_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_grade_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_multiple_prices: Mapped[bool] = mapped_column(Boolean, default=False)
    is_batch_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    size_group_id: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    is_mfg_date_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_exp_date_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    batch_mfg_format: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    batch_exp_format: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    stop_sales_before_expiry_days: Mapped[int] = mapped_column(Integer, default=0)
    preferred_vendor_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    is_service: Mapped[bool] = mapped_column(Boolean, default=False)
    is_consignment: Mapped[bool] = mapped_column(Boolean, default=False)
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=text("now()"))

