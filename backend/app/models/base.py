# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from __future__ import annotations
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, text, ForeignKey, JSON, ARRAY
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime
from typing import List, Dict, Any, Optional
import uuid

class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String)
    type: Mapped[Optional[str]] = mapped_column(String, default="Retail")
    code: Mapped[str] = mapped_column(String, unique=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    state_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, name="metadata", default={})

    inventory: Mapped[List["ItemStock"]] = relationship("ItemStock")

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="cashier")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class SystemParameter(Base):
    __tablename__ = "system_parameters"

    id: Mapped[int] = mapped_column(primary_key=True)
    code: Mapped[str] = mapped_column(String(100), unique=True)
    description: Mapped[str] = mapped_column(String)
    value_type: Mapped[str] = mapped_column(String(20)) # bool, int, string, float
    bool_val: Mapped[bool] = mapped_column(Boolean, nullable=True)
    int_val: Mapped[int] = mapped_column(Integer, nullable=True)
    str_val: Mapped[str] = mapped_column(String, nullable=True)
    float_val: Mapped[float] = mapped_column(Numeric(15, 2), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    mobile: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Till(Base):
    __tablename__ = "tills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String)
    cash_collected: Mapped[int] = mapped_column(Integer, default=0)

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    bill_no: Mapped[str] = mapped_column(String, unique=True, nullable=True) # Optional if suspended/draft
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=True)
    type: Mapped[str] = mapped_column(String) # Sales, Purchase, SalesReturn, PurchaseReturn
    
    # Multi-mode payment support via JSONB
    # [{"mode": "CASH", "amount": 1000}, {"mode": "CARD", "amount": 500, "ref": "123"}]
    payments: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=True)
    
    subtotal: Mapped[int] = mapped_column(Integer, default=0)
    discount_total: Mapped[int] = mapped_column(Integer, default=0)
    tax_total: Mapped[int] = mapped_column(Integer, default=0)
    net_payable: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String, default="Finalized") # Finalized, Suspended, Void
    suspended_reason: Mapped[str] = mapped_column(String, nullable=True)
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # For Shoper 9 DocNo
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    items: Mapped[List["TransactionItem"]] = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class CreditNote(Base):
    __tablename__ = "credit_notes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    note_no: Mapped[str] = mapped_column(String, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    original_transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), nullable=True)
    initial_amount: Mapped[int] = mapped_column(Integer)
    balance_amount: Mapped[int] = mapped_column(Integer)
    expiry_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Adjusted, Expired
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class AdvanceDeposit(Base):
    __tablename__ = "advance_deposits"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    receipt_no: Mapped[str] = mapped_column(String, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    purpose: Mapped[str] = mapped_column(String, nullable=True)
    initial_amount: Mapped[int] = mapped_column(Integer)
    balance_amount: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Adjusted, Refunded
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))



class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[int] = mapped_column(Integer)
    discount_per: Mapped[int] = mapped_column(Integer, default=0)
    tax_amount: Mapped[int] = mapped_column(Integer, default=0)
    net_amount: Mapped[int] = mapped_column(Integer)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="items")
    item: Mapped["Item"] = relationship("Item")

class SalesSlip(Base):
    __tablename__ = "sales_slips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    slip_no: Mapped[str] = mapped_column(String, unique=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    customer_mobile: Mapped[str] = mapped_column(String, nullable=True)
    total_amount: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_converted: Mapped[bool] = mapped_column(Boolean, default=False)
    converted_transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    
    items: Mapped[List["SalesSlipItem"]] = relationship("SalesSlipItem", back_populates="slip", cascade="all, delete-orphan")

class SalesSlipItem(Base):
    __tablename__ = "sales_slip_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    slip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sales_slips.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[int] = mapped_column(Integer)
    net_amount: Mapped[int] = mapped_column(Integer)

    slip: Mapped["SalesSlip"] = relationship("SalesSlip", back_populates="items")
    product: Mapped["Item"] = relationship("Item")


class GeneralLookup(Base):
    __tablename__ = "general_lookup"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=True)
    category: Mapped[str] = mapped_column(String) # payment_mode, colour, season, size_group, tax_category
    code: Mapped[str] = mapped_column(String)
    label: Mapped[str] = mapped_column(String)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    store: Mapped[Optional["Store"]] = relationship("Store")

class SizeGroup(Base):
    __tablename__ = "size_groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    sizes: Mapped[List[str]] = mapped_column(ARRAY(String)) # Stored as TEXT[] in DB
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store")

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String)
    parent_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    level: Mapped[int] = mapped_column(Integer) # 1, 2, 3
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store")
    parent: Mapped[Optional["Department"]] = relationship("Department", remote_side=[id], back_populates="children")
    children: Mapped[List["Department"]] = relationship("Department", back_populates="parent")

class CustomerPriceGroup(Base):
    __tablename__ = "customer_price_groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String)
    price_level: Mapped[Optional[str]] = mapped_column(String, nullable=True) # mrp, wholesale, staff, custom_1, custom_2
    discount_pct: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    is_taxable: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store")

class TaxMaster(Base):
    __tablename__ = "tax_masters"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(String(100)) # e.g., 'GST Footwear'
    hsn_code: Mapped[str] = mapped_column(String(20), nullable=True)
    
    # Slab logic using JSONB: [{"min": 0, "max": 999, "rate": 5}, {"min": 1000, "max": 999999, "rate": 12}]
    slabs: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=[])
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(String(255))
    type: Mapped[str] = mapped_column(String(50)) # discount, buy_x_get_y, seasonal
    description: Mapped[str] = mapped_column(String, nullable=True)
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    config: Mapped[Dict[str, Any]] = mapped_column(JSON, default={})
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String(50)) # inventory, security, system
    priority: Mapped[str] = mapped_column(String(20)) # high, medium, low
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class SyncPacket(Base):
    __tablename__ = "sync_packets"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: f"PKT-{uuid.uuid4().hex[:8].upper()}")
    store_id: Mapped[str] = mapped_column(String, index=True)
    entity_type: Mapped[str] = mapped_column(String) # e.g. SALES_BILL, MASTER_PRODUCT
    entity_id: Mapped[str] = mapped_column(String)
    payload: Mapped[Dict[str, Any]] = mapped_column(JSON)
    status: Mapped[str] = mapped_column(String, default="PENDING") # PENDING, SYNCED
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    synced_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class InventoryAudit(Base):
    __tablename__ = "inventory_audits"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    audit_no: Mapped[str] = mapped_column(String, unique=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    status: Mapped[str] = mapped_column(String, default="OPEN") # OPEN, SUBMITTED, CANCELLED
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    submitted_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    items: Mapped[List["InventoryAuditItem"]] = relationship("InventoryAuditItem", back_populates="audit", cascade="all, delete-orphan")

class InventoryAuditItem(Base):
    __tablename__ = "inventory_audit_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    audit_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("inventory_audits.id", ondelete="CASCADE"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    system_qty: Mapped[int] = mapped_column(Integer, default=0)
    physical_qty: Mapped[int] = mapped_column(Integer, default=0)

    audit: Mapped["InventoryAudit"] = relationship("InventoryAudit", back_populates="items")
    item: Mapped["Item"] = relationship("Item")

class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    type: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    name: Mapped[str] = mapped_column(String)
    mobile: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gst_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    credit_limit: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), default=0.0)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # For Shoper 9 PartyId
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class CustomerLedger(Base):
    __tablename__ = "customer_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    txn_type: Mapped[str] = mapped_column(String) # invoice, payment, credit_note, adjustment
    txn_ref: Mapped[str] = mapped_column(String)
    amount_paise: Mapped[int] = mapped_column(Integer)
    balance_paise: Mapped[int] = mapped_column(Integer)
    txn_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("CURRENT_DATE"))
    notes: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    partner: Mapped["Partner"] = relationship("Partner")

class LoyaltyLedger(Base):
    __tablename__ = "loyalty_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    txn_type: Mapped[str] = mapped_column(String) # earn, redeem, expire, adjust
    points: Mapped[int] = mapped_column(Integer)
    balance: Mapped[int] = mapped_column(Integer)
    sale_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("transactions.id", ondelete="SET NULL"), nullable=True)
    txn_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("CURRENT_DATE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    partner: Mapped["Partner"] = relationship("Partner")

class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    item_code: Mapped[str] = mapped_column(String)
    item_name: Mapped[str] = mapped_column(String(40))
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"), nullable=False)
    brand: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    supplier_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("partners.id", ondelete="SET NULL"), nullable=True)
    size_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("size_groups.id", ondelete="SET NULL"), nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mrp_paise: Mapped[int] = mapped_column(Integer)
    cost_paise: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    gst_rate: Mapped[int] = mapped_column(Integer) # 0, 5, 12, 18, 28
    hsn_code: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # Shoper 9 DNA
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # For Shoper 9 StockNo
    anal_codes: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True)   # For AnalCode1-32
    user_fields: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True)  # For SField1-5, NField1-5
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    store: Mapped["Store"] = relationship("Store")
    department: Mapped["Department"] = relationship("Department")
    supplier: Mapped[Optional["Partner"]] = relationship("Partner")
    size_group: Mapped[Optional["SizeGroup"]] = relationship("SizeGroup")

class ItemPriceLevel(Base):
    __tablename__ = "item_price_levels"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    price_level: Mapped[str] = mapped_column(String) # mrp, wholesale, staff, custom_1, custom_2
    price_paise: Mapped[int] = mapped_column(Integer)
    valid_from: Mapped[datetime] = mapped_column(DateTime, server_default=text("CURRENT_DATE"))
    valid_to: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    item: Mapped["Item"] = relationship("Item")

class ItemStock(Base):
    __tablename__ = "item_stock"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    size: Mapped[str] = mapped_column(String)
    colour: Mapped[str] = mapped_column(String)
    qty_on_hand: Mapped[int] = mapped_column(Integer, default=0)
    qty_reserved: Mapped[int] = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=10)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    item: Mapped["Item"] = relationship("Item")

class ItemBarcode(Base):
    __tablename__ = "item_barcodes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    barcode: Mapped[str] = mapped_column(String)
    barcode_type: Mapped[str] = mapped_column(String) # EAN13, CODE128, QR, INTERNAL
    size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    item: Mapped["Item"] = relationship("Item")
