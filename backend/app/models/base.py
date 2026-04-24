# ============================================================
# * PrimeSetu â€” Shoper9-Based Retail OS
# * Zero Cloud Â. Sovereign Â. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * Â(c) 2026 â€” All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from __future__ import annotations
from sqlalchemy import String, Integer, Numeric, Boolean, DateTime, text, ForeignKey, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.app.core.database import Base
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
    mrp: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    cost_price: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    tax_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=18.0)
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

class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    bill_no: Mapped[str] = mapped_column(String, unique=True, nullable=True) # Optional if suspended/draft
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"), nullable=True)
    type: Mapped[str] = mapped_column(String) # Sales, Purchase, SalesReturn, PurchaseReturn
    
    # Multi-mode payment support via JSONB
    # [{"mode": "CASH", "amount": 1000}, {"mode": "CARD", "amount": 500, "ref": "123"}]
    payments: Mapped[Dict[str, Any]] = mapped_column(JSON, nullable=True)
    
    subtotal: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    discount_total: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    tax_total: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    net_payable: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
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
    initial_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    balance_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    expiry_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Active") # Active, Adjusted, Expired
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class AdvanceDeposit(Base):
    __tablename__ = "advance_deposits"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    receipt_no: Mapped[str] = mapped_column(String, unique=True)
    customer_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customers.id"))
    purpose: Mapped[str] = mapped_column(String, nullable=True)
    initial_amount: Mapped[float] = mapped_column(Numeric(15, 2))
    balance_amount: Mapped[float] = mapped_column(Numeric(15, 2))
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
    total_cost: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
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
    unit_cost: Mapped[float] = mapped_column(Numeric(15, 2))

    purchase_order: Mapped["PurchaseOrder"] = relationship("PurchaseOrder", back_populates="items")

class TransactionItem(Base):
    __tablename__ = "transaction_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id", ondelete="CASCADE"))
    product_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("products.id"))
    qty: Mapped[float] = mapped_column(Numeric(12, 3))
    mrp: Mapped[float] = mapped_column(Numeric(15, 2))
    discount_per: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    tax_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    net_amount: Mapped[float] = mapped_column(Numeric(15, 2))

    transaction: Mapped["Transaction"] = relationship("Transaction", back_populates="items")

class SalesSlip(Base):
    __tablename__ = "sales_slips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    slip_no: Mapped[str] = mapped_column(String, unique=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    customer_mobile: Mapped[str] = mapped_column(String, nullable=True)
    total_amount: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
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
    mrp: Mapped[float] = mapped_column(Numeric(15, 2))
    net_amount: Mapped[float] = mapped_column(Numeric(15, 2))

    slip: Mapped["SalesSlip"] = relationship("SalesSlip", back_populates="items")

class Partner(Base):
    __tablename__ = "partners"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    type: Mapped[str] = mapped_column(String) # VENDOR, CUSTOMER, PERSONNEL
    code: Mapped[str] = mapped_column(String, unique=True)
    name: Mapped[str] = mapped_column(String)
    mobile: Mapped[str] = mapped_column(String, nullable=True)
    email: Mapped[str] = mapped_column(String, nullable=True)
    address: Mapped[str] = mapped_column(String, nullable=True)
    gst_no: Mapped[str] = mapped_column(String, nullable=True)
    credit_limit: Mapped[float] = mapped_column(Numeric(15, 2), default=0.0)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class GeneralLookup(Base):
    __tablename__ = "general_lookups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    category: Mapped[str] = mapped_column(String) # CATEGORY, BRAND, SIZE_GROUP, PAYMENT_MODE, TAX_SLOT
    code: Mapped[str] = mapped_column(String)
    name: Mapped[str] = mapped_column(String)
    value: Mapped[str] = mapped_column(String, nullable=True) # JSON or simple value
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

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
