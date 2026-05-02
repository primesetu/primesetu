# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from __future__ import annotations
from sqlalchemy import (
    String,
    Integer,
    Numeric,
    Boolean,
    DateTime,
    text,
    ForeignKey,
    JSON,
    ARRAY,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid


class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(
        String, primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String)
    type: Mapped[Optional[str]] = mapped_column(String, default="Retail")
    code: Mapped[str] = mapped_column(String, unique=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    state_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hierarchy_role: Mapped[str] = mapped_column(String, default="standalone")
    parent_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("stores.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # TRANSFER PRICING DNA (ChainStores Parity)
    buying_factor: Mapped[float] = mapped_column(Numeric(10, 4), default=1.0000)
    selling_factor: Mapped[float] = mapped_column(Numeric(10, 4), default=1.0000)

    # SYNC & CONNECTIVITY DNA
    sync_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sync_key: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON, name="metadata", default={}
    )

    parent: Mapped[Optional["Store"]] = relationship(
        "Store", remote_side=[id], back_populates="branches"
    )
    branches: Mapped[List["Store"]] = relationship("Store", back_populates="parent")


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    store_id: Mapped[str] = mapped_column(
        String, ForeignKey("stores.id"), nullable=False
    )
    email: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="cashier")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class MenuItem(Base):
    __tablename__ = "menu_items"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    label: Mapped[str] = mapped_column(String)
    route: Mapped[str] = mapped_column(String)
    icon: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    module: Mapped[str] = mapped_column(String, default="legacy")
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    required_permission: Mapped[str] = mapped_column(String)
    parent_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("menu_items.id"), nullable=True
    )
    tenant_id: Mapped[str] = mapped_column(String, default="SYSTEM")
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    shortcut: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(
        JSON, name="metadata", default={}
    )


class SystemParameter(Base):
    __tablename__ = "system_parameters"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(String)
    value_type: Mapped[str] = mapped_column(String(20))  # bool, int, string, float
    bool_val: Mapped[bool] = mapped_column(Boolean, nullable=True)
    int_val: Mapped[int] = mapped_column(Integer, nullable=True)
    str_val: Mapped[str] = mapped_column(String, nullable=True)
    float_val: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    mobile: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class Till(Base):
    __tablename__ = "tills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String)
    cash_collected: Mapped[int] = mapped_column(Integer, default=0)


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    bill_no: Mapped[str] = mapped_column(
        String, unique=True, nullable=True
    )  # Optional if suspended/draft
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    customer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("customers.id"), nullable=True
    )
    type: Mapped[str] = mapped_column(
        String
    )  # Sales, Purchase, SalesReturn, PurchaseReturn

    # Multi-mode payment support via JSONB
    payments: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=True)

    subtotal: Mapped[int] = mapped_column(Integer, default=0)
    discount_total: Mapped[int] = mapped_column(Integer, default=0)
    tax_total: Mapped[int] = mapped_column(Integer, default=0)
    net_payable: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(
        String, default="Finalized"
    )  # Finalized, Suspended, Void
    suspended_reason: Mapped[str] = mapped_column(String, nullable=True)
    narration: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # SHOPER9 PARITY FIELDS
    cashier_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    till_id: Mapped[Optional[int]] = mapped_column(
        Integer, ForeignKey("tills.id"), nullable=True
    )
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )

    external_id: Mapped[Optional[str]] = mapped_column(
        String, nullable=True, index=True
    )  # For Shoper 9 DocNo
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=text("now()"), onupdate=text("now()")
    )

    items: Mapped[List["TransactionItem"]] = relationship(
        "TransactionItem", back_populates="transaction", cascade="all, delete-orphan"
    )


class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    transaction_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("transactions.id", ondelete="CASCADE")
    )
    
    # ── SHOPER9 PARITY: stockno is the only identifier ──
    stock_no: Mapped[str] = mapped_column(String, nullable=False, index=True)
    item_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    item_brand: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[int] = mapped_column(Integer)
    discount_per: Mapped[int] = mapped_column(Integer, default=0)
    tax_amount: Mapped[int] = mapped_column(Integer, default=0)
    net_amount: Mapped[int] = mapped_column(Integer)
    
    # GST / TAX COMPLIANCE DNA
    hsn_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    tax_details: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # OPERATIONAL DNA
    batch_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    transaction: Mapped["Transaction"] = relationship(
        "Transaction", back_populates="items"
    )


class GeneralLookup(Base):
    __tablename__ = "general_lookup"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[Optional[str]] = mapped_column(
        String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True
    )
    category: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String)
    label: Mapped[str] = mapped_column(String)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )


class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[str] = mapped_column(
        String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("departments.id", ondelete="SET NULL"), nullable=True
    )
    level: Mapped[int] = mapped_column(Integer)
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    parent: Mapped[Optional["Department"]] = relationship(
        "Department", remote_side=[id], back_populates="children"
    )
    children: Mapped[List["Department"]] = relationship(
        "Department", back_populates="parent"
    )


class InventoryAudit(Base):
    __tablename__ = "inventory_audits"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    audit_no: Mapped[str] = mapped_column(String, unique=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    status: Mapped[str] = mapped_column(
        String, default="OPEN"
    )  # OPEN, SUBMITTED, CANCELLED
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    items: Mapped[List["InventoryAuditItem"]] = relationship(
        "InventoryAuditItem", back_populates="audit", cascade="all, delete-orphan"
    )


class InventoryAuditItem(Base):
    __tablename__ = "inventory_audit_items"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    audit_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("inventory_audits.id", ondelete="CASCADE")
    )
    
    # ── SHOPER9 PARITY: stockno replaces items.id FK ──
    stock_no: Mapped[str] = mapped_column(String, nullable=False, index=True)
    
    size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    system_qty: Mapped[int] = mapped_column(Integer, default=0)
    physical_qty: Mapped[int] = mapped_column(Integer, default=0)

    audit: Mapped["InventoryAudit"] = relationship(
        "InventoryAudit", back_populates="items"
    )


class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String)
    mobile: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gst_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # LOYALTY DNA
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    total_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    loyalty_tier: Mapped[str] = mapped_column(
        String, default="SILVER"
    )  # SILVER, GOLD, PLATINUM

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    external_id: Mapped[Optional[str]] = mapped_column(
        String, nullable=True, index=True
    )  # For Shoper 9 PartyId
    shoper_recid: Mapped[Optional[int]] = mapped_column(
        Integer, nullable=True, index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class LoyaltyLedger(Base):
    __tablename__ = "loyalty_ledger"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[str] = mapped_column(
        String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False
    )
    partner_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("partners.id", ondelete="CASCADE"), nullable=False
    )
    txn_type: Mapped[str] = mapped_column(String)  # earn, redeem, expire, adjust
    points: Mapped[int] = mapped_column(Integer)
    balance: Mapped[int] = mapped_column(Integer)
    sale_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True
    )
    txn_date: Mapped[datetime] = mapped_column(
        DateTime, server_default=text("CURRENT_DATE")
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class CreditNote(Base):
    __tablename__ = "credit_notes"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True, server_default=text("gen_random_uuid()")
    )
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id"))
    note_no: Mapped[str] = mapped_column(String, unique=True)
    original_sale_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("transactions.id"))
    
    amount_paise: Mapped[int] = mapped_column(Integer)
    balance_paise: Mapped[int] = mapped_column(Integer)
    
    issue_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    expiry_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Active")  # Active, FullyUtilized, Expired, Cancelled
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String(50))  # inventory, security, system
    priority: Mapped[str] = mapped_column(String(20))  # high, medium, low
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
