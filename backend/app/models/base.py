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
    gstin: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    hierarchy_role: Mapped[str] = mapped_column(String, default="standalone")
    parent_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("stores.id"), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    
    # TRANSFER PRICING DNA (ChainStores Parity)
    buying_factor: Mapped[float] = mapped_column(Numeric(10, 4), default=1.0000)
    selling_factor: Mapped[float] = mapped_column(Numeric(10, 4), default=1.0000)
    
    # SYNC & CONNECTIVITY DNA
    sync_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    sync_key: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    metadata_json: Mapped[Dict[str, Any]] = mapped_column(JSON, name="metadata", default={})

    inventory: Mapped[List["ItemStock"]] = relationship("ItemStock")
    parent: Mapped[Optional["Store"]] = relationship("Store", remote_side=[id], back_populates="branches")
    branches: Mapped[List["Store"]] = relationship("Store", back_populates="parent")

class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True)
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"), nullable=False)
    email: Mapped[str] = mapped_column(String, nullable=False)
    full_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="cashier")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    narration: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # SHOPER9 PARITY FIELDS
    cashier_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    till_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tills.id"), nullable=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    
    # OPERATIONAL DNA (Shoper9 Parity)
    batch_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mfg_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    exp_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    grade: Mapped[Optional[str]] = mapped_column(String, nullable=True)

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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    store: Mapped[Optional["Store"]] = relationship("Store")

class SizeGroup(Base):
    __tablename__ = "size_groups"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String)
    sizes: Mapped[List[str]] = mapped_column(ARRAY(String)) # Stored as TEXT[] in DB
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    
    # LEGACY PARITY (crdtsalecustopbal)
    opening_balance_paise: Mapped[int] = mapped_column(Integer, default=0)
    opening_balance_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    # LIFESTYLE CRM (Parity with Customers table)
    birth_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    anniversary_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Male, Female, Other
    is_married: Mapped[bool] = mapped_column(Boolean, default=False)
    
    # LOYALTY DNA (Parity with Shoper9 LoyaltySchema)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    total_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    loyalty_tier: Mapped[str] = mapped_column(String, default="SILVER") # SILVER, GOLD, PLATINUM
    
    # BANKING DNA
    bank_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    bank_account_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # VENDOR DNA (Parity with Vendors table)
    buying_factor: Mapped[float] = mapped_column(Numeric(15, 4), default=1.0)
    selling_factor: Mapped[float] = mapped_column(Numeric(15, 4), default=1.0)
    commission_percent: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)

    credit_limit: Mapped[Optional[float]] = mapped_column(Numeric(15, 2), default=0.0)
    loyalty_points: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    external_id: Mapped[Optional[str]] = mapped_column(String, nullable=True, index=True) # For Shoper 9 PartyId
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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

class InvoiceSettlement(Base):
    """Parity with Shoper9 crdtinvrcvdtls - The Payment Settlement Map"""
    __tablename__ = "invoice_settlements"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    # THE LINK (Receipt -> Invoice)
    receipt_txn_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"))
    invoice_txn_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"))
    
    # FINANCIALS (Always integers/paise)
    amount_settled_paise: Mapped[int] = mapped_column(Integer)
    
    # AUDIT
    settled_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class CustomerSegment(Base):
    """Parity with CRMQryInfo & CrmQryStruc - The Marketing Strategy Master"""
    __tablename__ = "customer_segments"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String) # e.g. "Dormant VIPs"
    
    # JSON Logic for Filters (Mirroring CrmQryStruc)
    # [{"field": "total_spend", "op": "gt", "val": 10000}, {"field": "last_visit", "op": "lt_days", "val": 90}]
    rules: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=[])
    
    last_executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class SegmentResult(Base):
    """Parity with CRMFinalCustomer - The Campaign Snapshot"""
    __tablename__ = "segment_results"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    segment_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("customer_segments.id", ondelete="CASCADE"))
    partner_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("partners.id"))
    
    # Snapshot of contact info used for the campaign
    mobile_used: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    execution_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    segment: Mapped["CustomerSegment"] = relationship("CustomerSegment")
    partner: Mapped["Partner"] = relationship("Partner")

class Currency(Base):
    """Parity with CurrencyCat - Global Multi-Currency Support"""
    __tablename__ = "currencies"
    code: Mapped[str] = mapped_column(String(16), primary_key=True) # USD, INR
    name: Mapped[str] = mapped_column(String)
    symbol: Mapped[str] = mapped_column(String(10))
    exchange_rate: Mapped[float] = mapped_column(Numeric(15, 6), default=1.0)
    is_local: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class StoreOperationLog(Base):
    """Parity with DayBegin/EndPgms - Operational SOP Tracker"""
    __tablename__ = "store_operation_logs"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    op_type: Mapped[str] = mapped_column(String) # DAY_BEGIN, DAY_END
    status: Mapped[str] = mapped_column(String) # COMPLETED, FAILED
    performed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class EventHook(Base):
    """Parity with the Event Component Mapping Table - The Logic DNA"""
    __tablename__ = "event_hooks"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    trn_type: Mapped[int] = mapped_column(Integer) # 1100, 1300, etc.
    field_code: Mapped[str] = mapped_column(String) # ActQty, BatchNo, etc.
    event_id: Mapped[str] = mapped_column(String) # LOST_FOCUS, KEY_DOWN
    
    # THE LOGIC MAPPING
    handler_name: Mapped[str] = mapped_column(String) # e.g. "validate_inward_qty"
    order_of_execution: Mapped[int] = mapped_column(Integer, default=1)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Item(Base):
    __tablename__ = "items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id", ondelete="CASCADE"), nullable=False)
    item_code: Mapped[str] = mapped_column(String)
    item_name: Mapped[str] = mapped_column(String(40))
    uom: Mapped[str] = mapped_column(String, default="Pcs") # Pcs, Kg, Ltr, Mtr
    style_code: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)
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
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
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
    batch_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    mfg_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    exp_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qty_on_hand: Mapped[int] = mapped_column(Integer, default=0)
    qty_reserved: Mapped[int] = mapped_column(Integer, default=0)
    bin_location: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g., 'WH-A1'
    shelf_no: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g., 'S1-R4'
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

class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    doc_no: Mapped[str] = mapped_column(String, unique=True) # Stktrnhdr.DocNo
    doc_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    
    # Type: GRN, TRANSFER, ADJ, RETURN
    txn_type: Mapped[str] = mapped_column(String(20)) 
    
    from_store: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    to_store: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Finalized") # Draft, InTransit, Finalized, Cancelled
    
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, index=True)
    
    # NODAL LOGISTICS (Parity with StkTrnAddlHdr)
    logistics_meta: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True) # LRNo, VehicleNo, Driver, TransportMode
    ref_doc_no: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Linked PO or Return Ref
    
    total_tax_paise: Mapped[int] = mapped_column(Integer, default=0)
    total_addons_paise: Mapped[int] = mapped_column(Integer, default=0)
    total_dedns_paise: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    items: Mapped[List["StockTransactionItem"]] = relationship("StockTransactionItem", back_populates="header", cascade="all, delete-orphan")

class StockLedger(Base):
    """Parity with Shoper9 StockLedger - Fine-grained audit trail for every SKU +/-"""
    __tablename__ = "stock_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    
    size: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    colour: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    batch_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    txn_type: Mapped[str] = mapped_column(String) # GRN, SALE, RETURN, TRANSFER_IN, TRANSFER_OUT, ADJUSTMENT
    qty: Mapped[int] = mapped_column(Integer) # Positive for In, Negative for Out
    ref_no: Mapped[str] = mapped_column(String) # DocNo or TxnNo
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class StockTransactionItem(Base):
    __tablename__ = "stock_transaction_items"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    header_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("stock_transactions.id", ondelete="CASCADE"))
    
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    size: Mapped[str] = mapped_column(String)
    colour: Mapped[str] = mapped_column(String)
    
    qty: Mapped[int] = mapped_column(Integer) # Positive for Inward, Negative for Outward
    
    # PRICING DNA (Parity with StkTrnDtls)
    doc_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0)
    phy_qty: Mapped[float] = mapped_column(Numeric(12, 3), default=0)
    
    unit_rate_paise: Mapped[int] = mapped_column(Integer, default=0)
    net_amount_paise: Mapped[int] = mapped_column(Integer, default=0)
    
    # METADATA BUCKETS (JSONB for infinite flexibility)
    pricing_meta: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True) 
    # ^ Stores: {addons: [], deductions: [], promo_code: "SUMMER24", disc_reason: "Festive"}
    
    tax_meta: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True)
    # ^ Stores: {cgst: 450, sgst: 450, igst: 0, cess: 100}
    
    anal_codes: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True)
    
    unit_cost_paise: Mapped[int] = mapped_column(Integer)
    
    header: Mapped["StockTransaction"] = relationship("StockTransaction", back_populates="items")
    item: Mapped["Item"] = relationship("Item")

class TaxRule(Base):
    """Parity with Shoper9 TaxMatrix - The Tax Computation Brain"""
    __tablename__ = "tax_rules"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    hsn_code: Mapped[str] = mapped_column(String, index=True)
    
    # SLAB LOGIC (e.g. MRP < 1000 -> 5%, Else 12%)
    min_mrp_paise: Mapped[int] = mapped_column(Integer, default=0)
    max_mrp_paise: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    
    cgst_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    sgst_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    igst_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    cess_rate: Mapped[float] = mapped_column(Numeric(5, 2), default=0.0)
    
    # TEMPORAL COMPLIANCE (Parity with SalesTaxRevision)
    effective_from: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    effective_to: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    revision_id: Mapped[int] = mapped_column(Integer, default=1)
    
    # COMPLEX FORMULA (Parity with T1-T5 DerivedFormula)
    formula_meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    # ^ {cgst: "mrp * 0.09", sgst: "mrp * 0.09", surcharge: "cgst * 0.10"}
    
    # NEXUS DNA (Parity with SrcTaxType / DestTaxType)
    is_interstate: Mapped[bool] = mapped_column(Boolean, default=False)
    source_region: Mapped[Optional[str]] = mapped_column(String, nullable=True) # State/Region of Vendor
    dest_region: Mapped[Optional[str]] = mapped_column(String, nullable=True)   # State/Region of Store
    is_inclusive: Mapped[bool] = mapped_column(Boolean, default=False)
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class UIFieldConfig(Base):
    """Parity with Shoper9 AcceptDisplayDtls - Controls POS field behavior"""
    __tablename__ = "ui_field_configs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    screen_name: Mapped[str] = mapped_column(String) # e.g., 'BILLING', 'ITEM_MASTER'
    field_name: Mapped[str] = mapped_column(String)  # e.g., 'salesperson_id', 'discount_per'
    
    is_visible: Mapped[bool] = mapped_column(Boolean, default=True)
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_editable: Mapped[bool] = mapped_column(Boolean, default=True)
    default_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # BROWSE SETTINGS (Shoper9 Parity)
    display_label: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Column Caption
    column_width: Mapped[int] = mapped_column(Integer, default=150) # In pixels
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    format_type: Mapped[str] = mapped_column(String, default="TEXT") # TEXT, CURRENCY, DATE, QTY
    
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))


class AttributeAlias(Base):
    """Parity with Shoper9 CatalogSettings - Maps AnalCodes to Real Names"""
    __tablename__ = "attribute_aliases"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    code_type: Mapped[str] = mapped_column(String) # 'ANAL_CODE', 'USER_FIELD', 'ANAL_CODE_NUM'
    code_index: Mapped[int] = mapped_column(Integer) # 1 to 32
    alias_name: Mapped[str] = mapped_column(String) # e.g., 'Fabric', 'Season'
    
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    lookup_category: Mapped[Optional[str]] = mapped_column(String, nullable=True) # Link to GeneralLookup category
    
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class CategoryPolicy(Base):
    """Unified Parity with Shoper9 Class12Combo & Class12LocWise - Governance Engine"""
    __tablename__ = "category_policies"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    # Links to the Department hierarchy (Class1/Class2)
    department_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("departments.id"))
    
    # MARKUP DNA
    retail_markup_per: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    dealer_markup_per: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00)
    
    # PRICING FLEXIBILITY
    is_location_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_batch_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    is_grade_price_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    allow_multiple_prices: Mapped[bool] = mapped_column(Boolean, default=False)

    # BATCH & EXPIRY DNA
    is_batch_applicable: Mapped[bool] = mapped_column(Boolean, default=False)
    size_group_id: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g. 'SHIRT_MEN'
    is_mfg_date_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    is_exp_date_mandatory: Mapped[bool] = mapped_column(Boolean, default=False)
    batch_mfg_format: Mapped[Optional[str]] = mapped_column(String, nullable=True) # e.g. 'MM-YYYY'
    batch_exp_format: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    stop_sales_before_expiry_days: Mapped[int] = mapped_column(Integer, default=0)
    
    # VENDOR DNA
    preferred_vendor_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    
    # FLAGS
    is_service: Mapped[bool] = mapped_column(Boolean, default=False)
    is_consignment: Mapped[bool] = mapped_column(Boolean, default=False)
    
    shoper_recid: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class StockAuditLedger(Base):
    """Parity with TRNStockAudit - The Forensic Immutability Ledger"""
    __tablename__ = "stock_audit_ledger"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    txn_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"))
    
    # BEFORE & AFTER (Forensic Snapshot)
    prev_qty: Mapped[int] = mapped_column(Integer)
    change_qty: Mapped[int] = mapped_column(Integer) # +ve for Inward, -ve for Sale
    new_qty: Mapped[int] = mapped_column(Integer)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class DeliveryTrip(Base):
    """Parity with TripSheetHdr - Logistics Management"""
    __tablename__ = "delivery_trips"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    trip_no: Mapped[str] = mapped_column(String, unique=True)
    driver_name: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    vehicle_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Scheduled") # Scheduled, InProgress, Completed
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class StoreTraffic(Base):
    """Parity with WalkIn - Conversion Analytics"""
    __tablename__ = "store_traffic"
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    date: Mapped[datetime] = mapped_column(DateTime, server_default=text("CURRENT_DATE"))
    hour_block: Mapped[int] = mapped_column(Integer) # 0-23
    
    walkin_count: Mapped[int] = mapped_column(Integer, default=0)
    sale_count: Mapped[int] = mapped_column(Integer, default=0)
    sale_value_paise: Mapped[int] = mapped_column(Integer, default=0)

class TallyConfig(Base):
    """Parity with TallyMapSettingInfo - The Integration Brain"""
    __tablename__ = "tally_configs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    tally_company_name: Mapped[str] = mapped_column(String)
    tally_server_ip: Mapped[str] = mapped_column(String, default="localhost")
    tally_server_port: Mapped[int] = mapped_column(Integer, default=9000)
    
    is_hsn_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    ledger_name_format: Mapped[str] = mapped_column(String, default="{NAME}")
    
    last_posted_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class TallyLedgerMap(Base):
    """Parity with TallyMasterInfo - Maps SMRITI-OS categories to Tally Ledgers"""
    __tablename__ = "tally_ledger_maps"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    SMRITI-OS_category: Mapped[str] = mapped_column(String) # payment_mode, tax_category, sales_ledger
    SMRITI-OS_code: Mapped[str] = mapped_column(String) # e.g. "CASH", "GST_18"
    tally_ledger_name: Mapped[str] = mapped_column(String) # e.g. "Cash in Hand", "Sales @ 18%"
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class TallyExportLog(Base):
    """Parity with TallyVchInfo - Tracks exported vouchers"""
    __tablename__ = "tally_export_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    transaction_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("transactions.id"))
    tally_guid: Mapped[str] = mapped_column(String) # Unique ID assigned by Tally
    
    exported_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    status: Mapped[str] = mapped_column(String) # Success, Error

class SystemSetting(Base):
    """Parity with Shoper9 SysParam - The Command Center DNA"""
    __tablename__ = "system_settings"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    key: Mapped[str] = mapped_column(String(50), index=True) # ParamCode
    description: Mapped[Optional[str]] = mapped_column(String(256), nullable=True)
    category: Mapped[str] = mapped_column(String(50), default="GENERAL") # Category from SysParamExtd
    
    # POLYMORPHIC VALUES (Native Types for Forensic Clarity)
    value_bool: Mapped[Optional[bool]] = mapped_column(Boolean, nullable=True)
    value_int: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    value_text: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    value_date: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    value_paise: Mapped[Optional[int]] = mapped_column(Integer, nullable=True) # For Currency/Money
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class StockBalanceSummary(Base):
    """Parity with StockTrnSummary - Optimized for fast reporting"""
    __tablename__ = "stock_balance_summary"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    item_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("items.id"))
    
    month_no: Mapped[int] = mapped_column(Integer) # 1-12
    year: Mapped[int] = mapped_column(Integer)
    
    opening_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    inward_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    outward_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    closing_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"), onupdate=text("now()"))

class Season(Base):
    """Parity with SeasonsMaster - Temporal Inventory Lifecycle"""
    __tablename__ = "seasons"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String) # e.g. 'Winter-2026'
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PromotionScheme(Base):
    """Parity with SchemesDefinitionHdr - Campaign DNA"""
    __tablename__ = "promotion_schemes"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    name: Mapped[str] = mapped_column(String)
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    
    # JSON-based Loyalty DNA (Parity with SchemesPointsSlabs)
    loyalty_config: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True) 
    # ^ {slabs: [{from: 0, to: 1000, points_per_rs: 0.01}]}
    
    priority_no: Mapped[int] = mapped_column(Integer, default=100) # Lower = Higher Priority
    week_days: Mapped[str] = mapped_column(String, default="1111111") # MTWTFSS
    happy_hours_meta: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    # ^ {start_time: "14:00", end_time: "16:00"}
    can_be_combined: Mapped[bool] = mapped_column(Boolean, default=False)
    
    status: Mapped[str] = mapped_column(String, default="Active")
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PromotionRule(Base):
    """Parity with SchemesDefinitionDtls - The Logic DNA"""
    __tablename__ = "promotion_rules"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    scheme_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("promotion_schemes.id"))
    
    # CONDITION DNA (Links to Item, Department, Season, or AnalCodes)
    condition_meta: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True) 
    # ^ {department_id: "...", season_id: "...", brand: "Adidas"}
    
    # REWARD DNA
    in_terms_of: Mapped[str] = mapped_column(String) # PERCENT, VALUE, FREE_ITEM
    reward_value: Mapped[float] = mapped_column(Numeric(15, 2))
    
    rule_type: Mapped[str] = mapped_column(String, default="TRIGGER") # TRIGGER (Buy), REWARD (Get)
    set_no: Mapped[int] = mapped_column(Integer, default=1) # Grouping for complex BOGO
    max_discount_paise: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    min_bill_value_paise: Mapped[int] = mapped_column(Integer, default=0)

    slab_from: Mapped[int] = mapped_column(Integer, default=0)
    slab_to: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PromotionLog(Base):
    """Parity with PromoLogHeader - Immutable History of Marketing Logic"""
    __tablename__ = "promotion_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    scheme_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("promotion_schemes.id"))
    
    # SNAPSHOT DNA
    # Stores the entire state of the promotion at the time of change
    snapshot_payload: Mapped[Dict[str, Any]] = mapped_column(JSON)
    
    changed_by: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class RemoteCommand(Base):
    """Parity with ShrmScript - The HQ Governance Engine"""
    __tablename__ = "remote_commands"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    command_type: Mapped[str] = mapped_column(String) # SQL, PYTHON, POLICY_UPDATE
    payload: Mapped[str] = mapped_column(String) # The actual script or JSON config
    
    status: Mapped[str] = mapped_column(String, default="Pending") # Pending, Executed, Failed
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))



class SavedReport(Base):
    """Parity with ReportConfigSettings - Custom Analytical Views"""
    __tablename__ = "saved_reports"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"))
    name: Mapped[str] = mapped_column(String) # "Weekly Sales Dashboard"
    task_id: Mapped[str] = mapped_column(String) # The module/page this report belongs to
    
    # JSON-based Configuration (Filters, Sorting, Columns)
    config_payload: Mapped[Dict[str, Any]] = mapped_column(JSON) 
    
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class ReportDateFormula(Base):
    """Parity with ReportDates - Dynamic Date Calculation Engine"""
    __tablename__ = "report_date_formulas"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    caption: Mapped[str] = mapped_column(String) # e.g., "Current Financial Year"
    
    # FORMULA DNA (Controlled logic tokens)
    # e.g., "START_OF_MONTH", "END_OF_MONTH", "START_OF_FY"
    from_date_logic: Mapped[str] = mapped_column(String) 
    to_date_logic: Mapped[str] = mapped_column(String)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class ReportTemplate(Base):
    """Parity with RptSelFileName - The Print/Export Layout Engine"""
    __tablename__ = "report_templates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    name: Mapped[str] = mapped_column(String) # e.g., "Standard Thermal GST"
    task_id: Mapped[str] = mapped_column(String) # "POS", "GRN", "STOCK_LEDGER"
    
    # TEMPLATE SOURCE (HTML/CSS layout)
    template_payload: Mapped[str] = mapped_column(String) 
    
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PriceFactor(Base):
    """Parity with SalesFactors - Dynamic Pricing & Overrides"""
    __tablename__ = "price_factors"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    # CONDITION DNA (Who/What/When)
    condition_meta: Mapped[Dict[str, Any]] = mapped_column(JSON, default={}, nullable=True)
    # ^ {item_id: "...", customer_group_id: "...", app_wk_days: "1111100"}
    
    # PRICE DNA
    is_rate: Mapped[bool] = mapped_column(Boolean, default=True)
    rate_amt_paise: Mapped[int] = mapped_column(Integer, default=0)
    markup_per: Mapped[float] = mapped_column(Numeric(10, 2), default=0.0)
    
    valid_from: Mapped[datetime] = mapped_column(DateTime)
    valid_to: Mapped[datetime] = mapped_column(DateTime)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class PurchasePlan(Base):
    """Parity with PurchPlan - The Open-To-Buy (OTB) Strategy"""
    __tablename__ = "purchase_plans"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, server_default=text("gen_random_uuid()"))
    store_id: Mapped[str] = mapped_column(String, ForeignKey("stores.id"))
    
    start_date: Mapped[datetime] = mapped_column(DateTime)
    end_date: Mapped[datetime] = mapped_column(DateTime)
    
    # TARGETS (Paise for financial precision)
    planned_purch_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0.0)
    planned_purch_paise: Mapped[int] = mapped_column(Integer, default=0)
    
    # ACTUALS (Populated by the System)
    actual_purch_qty: Mapped[float] = mapped_column(Numeric(15, 3), default=0.0)
    actual_purch_paise: Mapped[int] = mapped_column(Integer, default=0)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
