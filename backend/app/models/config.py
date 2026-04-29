# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Document : backend/app/models/config.py
# (c) 2026 - All Rights Reserved
# ============================================================

from __future__ import annotations
from sqlalchemy import String, Integer, Boolean, DateTime, text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from .base import Base
from datetime import datetime
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
