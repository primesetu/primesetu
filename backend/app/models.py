# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from sqlalchemy import String, Integer, Float, Boolean, DateTime, text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base
from datetime import datetime
from typing import List

class Store(Base):
    __tablename__ = "stores"

    id: Mapped[str] = mapped_column(String, primary_key=True, server_default=text("gen_random_uuid()"))
    name: Mapped[str] = mapped_column(String)
    code: Mapped[str] = mapped_column(String, unique=True)
    address: Mapped[str] = mapped_column(String, nullable=True)
    gstin: Mapped[str] = mapped_column(String, nullable=True)
    phone: Mapped[str] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    users: Mapped[List["User"]] = relationship("User", back_populates="store")

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True) # References auth.users
    store_id: Mapped[str] = mapped_column(ForeignKey("stores.id"))
    email: Mapped[str] = mapped_column(String)
    full_name: Mapped[str] = mapped_column(String, nullable=True)
    role: Mapped[str] = mapped_column(String, default="cashier")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

    store: Mapped["Store"] = relationship("Store", back_populates="users")

class Till(Base):
    __tablename__ = "tills"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    code: Mapped[str] = mapped_column(String(10), unique=True)
    status: Mapped[str] = mapped_column(String(20), default="closed")
    cash_collected: Mapped[float] = mapped_column(Float, default=0.0)
    last_sync: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class Product(Base):
    __tablename__ = "inventory"

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True)
    name: Mapped[str] = mapped_column(String(255))
    barcode: Mapped[str] = mapped_column(String(50), nullable=True)
    mrp: Mapped[float] = mapped_column(Float)
    stock_qty: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(100))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

class Bill(Base):
    __tablename__ = "bills"

    id: Mapped[int] = mapped_column(primary_key=True)
    bill_number: Mapped[str] = mapped_column(String(20), unique=True)
    customer_name: Mapped[str] = mapped_column(String(100), nullable=True)
    total_amount: Mapped[float] = mapped_column(Float)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    
    items: Mapped[List["BillItem"]] = relationship("BillItem", back_populates="bill")

class BillItem(Base):
    __tablename__ = "bill_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    bill_id: Mapped[int] = mapped_column(ForeignKey("bills.id"))
    product_id: Mapped[int] = mapped_column(ForeignKey("inventory.id"))
    qty: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[float] = mapped_column(Float)
    
    bill: Mapped["Bill"] = relationship("Bill", back_populates="items")

class Scheme(Base):
    __tablename__ = "schemes"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    type: Mapped[str] = mapped_column(String(50)) # flat, percentage, bogo
    value: Mapped[float] = mapped_column(Float, default=0.0)
    min_amount: Mapped[float] = mapped_column(Float, default=0.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    start_date: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    end_date: Mapped[datetime] = mapped_column(DateTime, nullable=True)

class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(String)
    category: Mapped[str] = mapped_column(String(50)) # inventory, security, system
    priority: Mapped[str] = mapped_column(String(20)) # high, medium, low
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

