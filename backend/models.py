# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
models.py — SQLAlchemy 2 async ORM models

CHANGES from original:
  1. All monetary columns migrated from Float → Numeric(12, 2)
     Prevents floating-point precision errors in financial calculations.

  2. Product gains:
       hsn_code      — mandatory for GST invoicing
       gst_rate      — percentage (0 / 5 / 12 / 18 / 28)
       cost_price    — for margin / valuation reports

  3. Bill gains:
       store_id      — for multi-store RBAC isolation
       customer_gstin
       bill_type     — 'sale' | 'return' | 'slip'
       payment_mode  — 'cash' | 'upi' | 'card' | 'credit'
       discount_amount
       subtotal_amount
       cgst_amount   — Central GST
       sgst_amount   — State GST
       igst_amount   — Inter-state GST (B2B)
       total_tax_amount
       round_off
       is_cancelled

  4. BillItem gains:
       hsn_code, gst_rate, cgst_amount, sgst_amount, igst_amount
       discount_amount, line_total

  5. Store gains:
       state_code    — for IGST vs CGST/SGST determination
"""

from sqlalchemy import (
    String, Integer, Numeric, Boolean, DateTime,
    text, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime
from decimal import Decimal
from typing import List, Optional

# ── Helper type alias ─────────────────────────────────────────────────────────
Money = Numeric(12, 2)      # ₹ amounts — always exact decimal
GSTRate = Numeric(5, 2)     # percentage e.g. 18.00


# ── Store ─────────────────────────────────────────────────────────────────────
class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String, primary_key=True,
                                    server_default=text("gen_random_uuid()"))
    name: Mapped[str]         = mapped_column(String(200))
    code: Mapped[str]         = mapped_column(String(20), unique=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    gstin: Mapped[Optional[str]]   = mapped_column(String(15), nullable=True)
    phone: Mapped[Optional[str]]   = mapped_column(String(15), nullable=True)
    state_code: Mapped[Optional[str]] = mapped_column(String(2), nullable=True,
        comment="2-digit state code for IGST vs CGST/SGST determination")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    users: Mapped[List["User"]] = relationship("User", back_populates="store")


# ── User ──────────────────────────────────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id: Mapped[str]    = mapped_column(String, primary_key=True)   # references auth.users
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    email: Mapped[str] = mapped_column(String(200))
    full_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    role: Mapped[str]  = mapped_column(String(20), default="cashier",
        comment="cashier | manager | admin")
    active: Mapped[bool]     = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store", back_populates="users")


# ── Till ──────────────────────────────────────────────────────────────────────
class Till(Base):
    __tablename__ = "tills"

    id: Mapped[int]    = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str]  = mapped_column(String(50))
    code: Mapped[str]  = mapped_column(String(10), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="closed",
        comment="open | closed | suspended")
    cash_collected: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"))
    last_sync: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


# ── Product / Inventory ───────────────────────────────────────────────────────
class Product(Base):
    __tablename__ = "inventory"

    id: Mapped[int]       = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"),
        comment="Products are scoped per store")
    sku: Mapped[str]      = mapped_column(String(50), unique=True)
    name: Mapped[str]     = mapped_column(String(255))
    barcode: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)

    # ── Pricing (Numeric — never Float) ──────────────────────────────────────
    mrp: Mapped[Decimal]        = mapped_column(Money,
        comment="Maximum Retail Price")
    cost_price: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"),
        comment="Purchase cost — used for margin/valuation")
    selling_price: Mapped[Optional[Decimal]] = mapped_column(Money, nullable=True,
        comment="Override price if different from MRP")

    # ── GST ──────────────────────────────────────────────────────────────────
    hsn_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True,
        comment="HSN/SAC code — mandatory for GST invoicing")
    gst_rate: Mapped[Decimal] = mapped_column(GSTRate, default=Decimal("18.00"),
        comment="GST % — 0 / 5 / 12 / 18 / 28")

    # ── Stock ─────────────────────────────────────────────────────────────────
    stock_qty: Mapped[int]    = mapped_column(Integer, default=0)
    reorder_level: Mapped[int] = mapped_column(Integer, default=5,
        comment="Alert threshold for low-stock")
    category: Mapped[str]     = mapped_column(String(100))
    is_active: Mapped[bool]   = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"),
        onupdate=datetime.utcnow)


# ── Bill (Invoice / Receipt) ──────────────────────────────────────────────────
class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[int]       = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"),
        comment="Scoped per store — never cross-store leakage")
    bill_number: Mapped[str] = mapped_column(String(30), unique=True)

    # ── Customer ──────────────────────────────────────────────────────────────
    customer_name: Mapped[Optional[str]]  = mapped_column(String(200), nullable=True)
    customer_phone: Mapped[Optional[str]] = mapped_column(String(15), nullable=True)
    customer_gstin: Mapped[Optional[str]] = mapped_column(String(15), nullable=True,
        comment="Required for B2B GST invoices")

    # ── Bill metadata ─────────────────────────────────────────────────────────
    bill_type: Mapped[str]    = mapped_column(String(10), default="sale",
        comment="sale | return | slip")
    payment_mode: Mapped[str] = mapped_column(String(10), default="cash",
        comment="cash | upi | card | credit | split")
    cashier_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id"), nullable=True)

    # ── Amounts (all Numeric — never Float) ───────────────────────────────────
    subtotal_amount: Mapped[Decimal]  = mapped_column(Money, default=Decimal("0.00"),
        comment="Sum of line totals before tax/discount")
    discount_amount: Mapped[Decimal]  = mapped_column(Money, default=Decimal("0.00"))

    # GST breakdown
    cgst_amount: Mapped[Decimal]      = mapped_column(Money, default=Decimal("0.00"),
        comment="Central GST (intra-state sales)")
    sgst_amount: Mapped[Decimal]      = mapped_column(Money, default=Decimal("0.00"),
        comment="State GST (intra-state sales)")
    igst_amount: Mapped[Decimal]      = mapped_column(Money, default=Decimal("0.00"),
        comment="Integrated GST (inter-state / B2B sales)")
    total_tax_amount: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"))

    round_off: Mapped[Decimal]        = mapped_column(Money, default=Decimal("0.00"),
        comment="Rounding adjustment to nearest rupee")
    total_amount: Mapped[Decimal]     = mapped_column(Money,
        comment="Grand total = subtotal - discount + tax + round_off")

    is_cancelled: Mapped[bool]   = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    items: Mapped[List["BillItem"]] = relationship("BillItem", back_populates="bill",
                                                    cascade="all, delete-orphan")


# ── Bill Line Item ────────────────────────────────────────────────────────────
class BillItem(Base):
    __tablename__ = "bill_items"

    id: Mapped[int]       = mapped_column(primary_key=True)
    bill_id: Mapped[int]  = mapped_column(ForeignKey("bills.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("inventory.id"))

    qty: Mapped[int]              = mapped_column(Integer)
    unit_price: Mapped[Decimal]   = mapped_column(Money,
        comment="Effective selling price at time of billing")
    mrp_at_billing: Mapped[Decimal] = mapped_column(Money,
        comment="MRP snapshot — immutable audit trail")
    discount_amount: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"))

    # GST per line item
    hsn_code: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    gst_rate: Mapped[Decimal]       = mapped_column(GSTRate, default=Decimal("18.00"))
    taxable_amount: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"),
        comment="unit_price * qty - discount")
    cgst_amount: Mapped[Decimal]    = mapped_column(Money, default=Decimal("0.00"))
    sgst_amount: Mapped[Decimal]    = mapped_column(Money, default=Decimal("0.00"))
    igst_amount: Mapped[Decimal]    = mapped_column(Money, default=Decimal("0.00"))
    line_total: Mapped[Decimal]     = mapped_column(Money,
        comment="taxable_amount + total_tax for this line")

    bill: Mapped["Bill"] = relationship("Bill", back_populates="items")


# ── Promotional Schemes ───────────────────────────────────────────────────────
class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[int]    = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    name: Mapped[str]  = mapped_column(String(100))
    type: Mapped[str]  = mapped_column(String(20),
        comment="flat | percentage | bogo | combo")
    value: Mapped[Decimal]      = mapped_column(Money, default=Decimal("0.00"))
    min_amount: Mapped[Decimal] = mapped_column(Money, default=Decimal("0.00"))
    is_active: Mapped[bool]     = mapped_column(Boolean, default=True)
    start_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    end_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


# ── System Alerts ─────────────────────────────────────────────────────────────
class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int]    = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(String(1000))
    category: Mapped[str] = mapped_column(String(50),
        comment="inventory | security | system | gst")
    priority: Mapped[str] = mapped_column(String(10),
        comment="high | medium | low")
    is_read: Mapped[bool]    = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
