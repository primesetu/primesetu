# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Document : backend/app/models/purchase.py
# (c) 2026 - All Rights Reserved
# ============================================================

from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, Date, Text, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
import uuid
from datetime import datetime
from .base import Base

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    vendor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=False)
    po_no: Mapped[str] = mapped_column(String, nullable=False)
    status: Mapped[str] = mapped_column(String, default="DRAFT", nullable=False)
    total_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0, nullable=False)
    total_cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0, nullable=False)
    expected_delivery: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.now)

    items = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")
    grns = relationship("GRN", back_populates="purchase_order")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    po_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=False)
    product_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)
    qty: Mapped[float] = mapped_column(Numeric(12, 3), nullable=False)
    received_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0, nullable=False)
    unit_cost: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)

    purchase_order = relationship("PurchaseOrder", back_populates="items")

class GRN(Base):
    __tablename__ = "grns"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    po_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("purchase_orders.id"), nullable=True)
    grn_number: Mapped[str] = mapped_column(String, nullable=False)
    received_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)
    received_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    vendor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("partners.id"), nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=True)

    purchase_order = relationship("PurchaseOrder", back_populates="grns")
    items = relationship("GRNItem", back_populates="grn", cascade="all, delete-orphan")

class GRNItem(Base):
    __tablename__ = "grn_items"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    grn_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("grns.id"), nullable=False)
    po_item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("purchase_order_items.id"), nullable=True)
    item_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("items.id"), nullable=False)
    size: Mapped[str] = mapped_column(String, nullable=True)
    colour: Mapped[str] = mapped_column(String, nullable=True)
    qty_received: Mapped[int] = mapped_column(Integer, nullable=False)
    unit_cost_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.now)

    grn = relationship("GRN", back_populates="items")
