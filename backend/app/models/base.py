# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from __future__ import annotations
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, text, ForeignKey, JSON, BigInteger, ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from datetime import datetime
from typing import List, Dict, Any
import uuid

class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String, primary_key=True) # e.g., 'X01'
    name: Mapped[str] = mapped_column(String)
    type: Mapped[str] = mapped_column(String, default="Retail")
    address: Mapped[str] = mapped_column(String, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, name="metadata", default={})

    inventory: Mapped[List["Inventory"]] = relationship("Inventory", back_populates="store")

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

class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    code: Mapped[str] = mapped_column(String, unique=True) # Barcode/SKU
    name: Mapped[str] = mapped_column(String)
    brand: Mapped[str] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=True)
    subcategory: Mapped[str] = mapped_column(String, nullable=True)
    size: Mapped[str] = mapped_column(String, nullable=True)
    color: Mapped[str] = mapped_column(String, nullable=True)
    mrp: Mapped[int] = mapped_column(BigInteger, default=0)
    wholesale_price: Mapped[int] = mapped_column(BigInteger, default=0)
    staff_price: Mapped[int] = mapped_column(BigInteger, default=0)
    cost_price: Mapped[int] = mapped_column(BigInteger, default=0)
    tax_rate: Mapped[int] = mapped_column(Integer, default=18)
    is_tax_inclusive: Mapped[bool] = mapped_column(Boolean, default=True) # Shoper 9 Style
    is_inventory_item: Mapped[bool] = mapped_column(Boolean, default=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    lsq: Mapped[float] = mapped_column(Numeric(12, 3), default=1.0) # Least Saleable Quantity
    
    # Flexible attributes to mimic AnalCode1-32
    attributes: Mapped[Dict[str, Any]] = mapped_column(JSON, default={})
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    stocks: Mapped[List["Inventory"]] = relationship("Inventory", back_populates="product")

class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"))
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"))
    quantity: Mapped[float] = mapped_column(Numeric(12, 3), default=0.000)
    min_stock: Mapped[float] = mapped_column(Numeric(12, 3), default=0.000)
    last_sync_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    product: Mapped["Product"] = relationship("Product", back_populates="stocks")
    store: Mapped["Store"] = relationship("Store", back_populates="inventory")

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

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String, unique=True)
    status: Mapped[str] = mapped_column(String, default="Closed") # Open, Closed, Locked, Idle
    current_cashier_id: Mapped[str] = mapped_column(String, nullable=True) # References auth.users or Partner
    cash_collected: Mapped[int] = mapped_column(BigInteger, default=0)
    last_opening_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    last_closing_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    bill_no: Mapped[str] = mapped_column(String, unique=True, nullable=True) # Optional if suspended/draft
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    till_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("tills.id"), nullable=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=True)
    type: Mapped[str] = mapped_column(String) # Sales, Purchase, SalesReturn, PurchaseReturn
    
    # Multi-mode payment support via JSONB
    # [{"mode": "CASH", "amount": 1000}, {"mode": "CARD", "amount": 500, "ref": "123"}]
    payments: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=True)
    
    subtotal: Mapped[int] = mapped_column(BigInteger, default=0)
    discount_total: Mapped[int] = mapped_column(BigInteger, default=0)
    tax_total: Mapped[int] = mapped_column(BigInteger, default=0)
    net_payable: Mapped[int] = mapped_column(BigInteger, default=0)
    status: Mapped[str] = mapped_column(String, default="Finalized") # Finalized, Suspended, Void
    suspended_reason: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    items: Mapped[List["TransactionItem"]] = relationship("TransactionItem", back_populates="transaction", cascade="all, delete-orphan")

class CreditNote(Base):
    __tablename__ = "credit_notes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    note_no: Mapped[str] = mapped_column(String, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    original_transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), nullable=True)
    initial_amount: Mapped[int] = mapped_column(BigInteger)
    balance_amount: Mapped[int] = mapped_column(BigInteger)
    expiry_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Adjusted, Expired
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class AdvanceDeposit(Base):
    __tablename__ = "advance_deposits"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    receipt_no: Mapped[str] = mapped_column(String, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    purpose: Mapped[str] = mapped_column(String, nullable=True)
    initial_amount: Mapped[int] = mapped_column(BigInteger)
    balance_amount: Mapped[int] = mapped_column(BigInteger)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Adjusted, Refunded
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    po_no: Mapped[str] = mapped_column(String, unique=True)
    vendor_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id"))
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    expected_delivery: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    total_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0)
    total_cost: Mapped[int] = mapped_column(BigInteger, default=0)
    status: Mapped[str] = mapped_column(String, default="Open") # Open, PartiallyReceived, Closed, Cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    items: Mapped[List["PurchaseOrderItem"]] = relationship("PurchaseOrderItem", back_populates="purchase_order", cascade="all, delete-orphan")

class PurchaseOrderItem(Base):
    __tablename__ = "purchase_order_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    po_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("purchase_orders.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    received_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0.0)
    unit_cost: Mapped[int] = mapped_column(BigInteger)

    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="items")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[int] = mapped_column(BigInteger)
    discount_per: Mapped[int] = mapped_column(Integer, default=0)
    tax_amount: Mapped[int] = mapped_column(BigInteger, default=0)
    net_amount: Mapped[int] = mapped_column(BigInteger)

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="items")

class SalesSlip(Base):
    __tablename__ = "sales_slips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    slip_no: Mapped[str] = mapped_column(String, unique=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    customer_mobile: Mapped[str] = mapped_column(String, nullable=True)
    total_amount: Mapped[int] = mapped_column(BigInteger, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_converted: Mapped[bool] = mapped_column(Boolean, default=False)
    converted_transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    
    items: Mapped[List["SalesSlipItem"]] = relationship("SalesSlipItem", back_populates="slip", cascade="all, delete-orphan")

class SalesSlipItem(Base):
    __tablename__ = "sales_slip_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    slip_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("sales_slips.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[int] = mapped_column(BigInteger)
    net_amount: Mapped[int] = mapped_column(BigInteger)

    slip: Mapped["SalesSlip"] = relationship("SalesSlip", back_populates="items")


class GeneralLookup(Base):
    __tablename__ = "general_lookup"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=True)
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
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    sizes: Mapped[List[str]] = mapped_column(ARRAY(String)) # Stored as TEXT[] in DB
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store")

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
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
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
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

class AuditSession(Base):
    __tablename__ = "audit_sessions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    started_by: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="Open") # Open, Finalized, Cancelled
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    finalized_at: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    
    entries: Mapped[List["AuditEntry"]] = relationship("AuditEntry", back_populates="session", cascade="all, delete-orphan")

class AuditEntry(Base):
    __tablename__ = "audit_entries"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    session_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("audit_sessions.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    book_qty: Mapped[float] = mapped_column(Numeric(12, 3))
    physical_qty: Mapped[float] = mapped_column(Numeric(12, 3))
    scanned_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    session: Mapped["AuditSession"] = relationship("AuditSession", back_populates="entries")

class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    partner_type: Mapped[str] = mapped_column(String) # customer, vendor, salesperson, both
    code: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    gstin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address_line1: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    address_line2: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    state_code: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    pincode: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    credit_limit_paise: Mapped[int] = mapped_column(Integer, default=0)
    credit_days: Mapped[int] = mapped_column(Integer, default=0)
    price_group_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("customer_price_groups.id", ondelete="SET NULL"), nullable=True)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    store: Mapped["Store"] = relationship("Store")
    price_group: Mapped[Optional["CustomerPriceGroup"]] = relationship("CustomerPriceGroup")

class CustomerLedger(Base):
    __tablename__ = "customer_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
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
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id", ondelete="CASCADE"), nullable=False)
    txn_type: Mapped[str] = mapped_column(String) # earn, redeem, expire, adjust
    points: Mapped[int] = mapped_column(Integer)
    balance: Mapped[int] = mapped_column(Integer)
    sale_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("sales.id", ondelete="SET NULL"), nullable=True)
    txn_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("CURRENT_DATE"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    partner: Mapped["Partner"] = relationship("Partner")

class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
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
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
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
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    size: Mapped[str] = mapped_column(String)
    colour: Mapped[str] = mapped_column(String)
    qty_on_hand: Mapped[int] = mapped_column(Integer, default=0)
    qty_reserved: Mapped[int] = mapped_column(Integer, default=0)
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

    item: Mapped["Item"] = relationship("Item")

class ItemBarcode(Base):
    __tablename__ = "item_barcodes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id", ondelete="CASCADE"), nullable=False)
    barcode: Mapped[str] = mapped_column(String)
    barcode_type: Mapped[str] = mapped_column(String) # EAN13, CODE128, QR, INTERNAL
    size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    item: Mapped["Item"] = relationship("Item")
