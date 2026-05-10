# ============================================================
# SMRITI-OS - SOVEREIGN SCHEMAS (MODERNIZED)
# These tables represent the modernized 'SMRITI_' identities
# derived from legacy Shoper9 structures.
# ============================================================

from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, Float, text
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

class SmritiAD(Base):
    """ Modernized AcceptDisplayDtls """
    __tablename__ = 'smriti_ad'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    trntype: Mapped[Integer] = mapped_column(Integer, nullable=False)
    index: Mapped[Integer] = mapped_column(Integer, nullable=False)
    acptcap: Mapped[Optional[String]] = mapped_column(String, nullable=True)
    dispcap: Mapped[Optional[String]] = mapped_column(String, nullable=True)
    visible: Mapped[Boolean] = mapped_column(Boolean, default=True)
    position: Mapped[Integer] = mapped_column(Integer, nullable=True)
    column_name: Mapped[Optional[String]] = mapped_column(String, nullable=True)
    data_type: Mapped[Optional[Integer]] = mapped_column(Integer, nullable=True)
    width: Mapped[Optional[Float]] = mapped_column(Float, nullable=True)
    is_mandatory: Mapped[Boolean] = mapped_column(Boolean, default=False)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiParam(Base):
    """ Modernized SysParam """
    __tablename__ = 'smriti_param'
    
    param_code: Mapped[str] = mapped_column(String(50), primary_key=True)
    descr: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    value_txt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    value_bool: Mapped[bool] = mapped_column(Boolean, default=False)
    value_int: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiLookup(Base):
    """ Modernized GenLookUp """
    __tablename__ = 'smriti_lookup'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rec_id: Mapped[int] = mapped_column(Integer, index=True)
    code: Mapped[str] = mapped_column(String(50), index=True)
    descr: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiLookupMap(Base):
    """ Modernized GenLookUpExtd """
    __tablename__ = 'smriti_lookup_map'
    
    rec_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    rec_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiCombo(Base):
    """ Modernized Class12Combo """
    __tablename__ = 'smriti_combo'
    
    class1: Mapped[str] = mapped_column(String(50), primary_key=True)
    class2: Mapped[str] = mapped_column(String(50), primary_key=True)
    is_billable: Mapped[bool] = mapped_column(Boolean, default=True)
    tax_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiItem(Base):
    """ Modernized ItemMaster """
    __tablename__ = 'smriti_item'
    
    sku: Mapped[str] = mapped_column(String(50), primary_key=True)
    name: Mapped[str] = mapped_column(String(255))
    class1: Mapped[Optional[str]] = mapped_column(String(50))
    class2: Mapped[Optional[str]] = mapped_column(String(50))
    subclass1: Mapped[Optional[str]] = mapped_column(String(50))
    subclass2: Mapped[Optional[str]] = mapped_column(String(50))
    mrp: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    cost_price: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    hsn_code: Mapped[Optional[str]] = mapped_column(String(20))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    # E-Commerce / Web attributes
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    description_html: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiStock(Base):
    """ Modernized StockMaster """
    __tablename__ = 'smriti_stock'
    
    sku: Mapped[str] = mapped_column(String(50), primary_key=True)
    store_id: Mapped[str] = mapped_column(String(20), primary_key=True)
    on_hand: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    on_order: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    min_stock: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiStaff(Base):
    """ Modernized Personnel Registry """
    __tablename__ = 'smriti_staff'
    
    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    role: Mapped[Optional[str]] = mapped_column(String(50))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiPayMode(Base):
    """ Modernized POSPayModes """
    __tablename__ = 'smriti_pay_mode'
    
    code: Mapped[str] = mapped_column(String(20), primary_key=True)
    descr: Mapped[str] = mapped_column(String(100))
    type: Mapped[Integer] = mapped_column(Integer) # 1=Cash, 2=Card, etc.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiDocNo(Base):
    """ Modernized PrefixTrnNo (Document Numbering) """
    __tablename__ = 'smriti_docno'
    
    trn_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    prefix: Mapped[str] = mapped_column(String(10), primary_key=True)
    next_no: Mapped[int] = mapped_column(Integer, default=1)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiSaleHdr(Base):
    """ Modernized StkTrnHdr (Sales Header) """
    __tablename__ = 'smriti_sale_hdr'
    
    bill_no: Mapped[str] = mapped_column(String(50), primary_key=True)
    bill_date: Mapped[datetime] = mapped_column(DateTime, primary_key=True)
    cust_code: Mapped[Optional[str]] = mapped_column(String(50))
    total_qty: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    net_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    staff_code: Mapped[Optional[str]] = mapped_column(String(20))
    
    # E-Invoice / NIC Integration
    irn: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    irn_ack_no: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    irn_ack_dt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qr_code_data: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Tally Sync
    tally_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    tally_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    tally_retry_count: Mapped[int] = mapped_column(Integer, default=0)

    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiSaleDtl(Base):
    """ Modernized StkTrnDtls (Sales Details) """
    __tablename__ = 'smriti_sale_dtl'
    
    bill_no: Mapped[str] = mapped_column(String(50), primary_key=True)
    srl_no: Mapped[int] = mapped_column(Integer, primary_key=True)
    sku: Mapped[str] = mapped_column(String(50))
    qty: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    rate: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    disc_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    tax_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    last_sync: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

class SmritiAuditLog(Base):
    __tablename__ = 'smriti_audit_log'
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)
    entity_id: Mapped[str] = mapped_column(String(100), index=True)
    action: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[Optional[str]] = mapped_column(String(100))
    old_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)