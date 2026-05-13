# ============================================================
# SMRITI-OS - SOVEREIGN SCHEMAS (MODERNIZED)
# These tables represent the modernized 'SMRITI_' identities
# derived from legacy Shoper9 structures.
# ============================================================

from typing import Optional
from datetime import datetime
from sqlalchemy import String, Integer, Boolean, DateTime, Numeric, Float, text, JSON, SmallInteger
from sqlalchemy.orm import Mapped, mapped_column
from .base import Base

# Shared server-side timestamp expression used for all last_sync columns.
# Using server_default ensures the DB fills it in — never raises NotNullViolation.
_NOW = text("now()")

class SmritiAD(Base):
    """ Modernized AcceptDisplayDtls """
    __tablename__ = 'smriti_ad'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
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
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiParam(Base):
    """ Modernized SysParam — full Shoper9 sysparam parity """
    __tablename__ = 'smriti_param'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)

    param_code: Mapped[str] = mapped_column(String(100), primary_key=True)
    origin_id: Mapped[Optional[str]] = mapped_column(String(30), nullable=True, comment="Original Shoper9 Id e.g. SR1-0730-0000287")
    descr: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Data type discriminator: B=Boolean, I=Integer, T=Text, S=Float/Single, C=Currency
    opt_type: Mapped[Optional[str]] = mapped_column(String(1), nullable=True, comment="Shoper9 Opt column")

    # Value storage — the active field is determined by opt_type
    value_txt: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    value_bool: Mapped[bool] = mapped_column(Boolean, default=False)
    value_int: Mapped[int] = mapped_column(Integer, default=0)
    value_float: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Classification
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    cat_descr: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    disp_order: Mapped[int] = mapped_column(Integer, default=0)

    # Editability constraints: Variable, Hidden, One Time, Installation
    fixed_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True, comment="Fixed/Variable/Hidden/One Time")

    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiLookup(Base):
    """ Modernized GenLookUp """
    __tablename__ = 'smriti_lookup'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    rec_id: Mapped[int] = mapped_column(Integer, index=True)
    code: Mapped[str] = mapped_column(String(50), index=True)
    descr: Mapped[str] = mapped_column(String(255))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiLookupMap(Base):
    """ Modernized GenLookUpExtd """
    __tablename__ = 'smriti_lookup_map'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    rec_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(100))
    rec_type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiCombo(Base):
    """ Modernized Class12Combo """
    __tablename__ = 'smriti_combo'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    class1: Mapped[str] = mapped_column(String(50), primary_key=True)
    class2: Mapped[str] = mapped_column(String(50), primary_key=True)
    is_billable: Mapped[bool] = mapped_column(Boolean, default=True)
    tax_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiItem(Base):
    """ Modernized ItemMaster """
    __tablename__ = 'smriti_item'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    sku: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    class1: Mapped[Optional[str]] = mapped_column(String)
    class2: Mapped[Optional[str]] = mapped_column(String)
    subclass1: Mapped[Optional[str]] = mapped_column(String)
    subclass2: Mapped[Optional[str]] = mapped_column(String)
    mrp: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    cost_price: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    hsn_code: Mapped[Optional[str]] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default='true', default=True)
    
    # Shoper 9 Multi-barcode support
    barcode: Mapped[Optional[str]] = mapped_column(String, index=True, nullable=True)

    # Legacy Metadata (v3.0 Sovereign Standard)
    anal_codes: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="AnalCode1-40")
    user_fields: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, comment="UField1-N")
    
    # E-Commerce / Web attributes
    image_url: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description_html: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    is_featured: Mapped[bool] = mapped_column(Boolean, server_default='false', default=False)
    
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiStock(Base):
    """ Modernized StockMaster """
    __tablename__ = 'smriti_stock'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    sku: Mapped[str] = mapped_column(String, primary_key=True)
    store_id: Mapped[str] = mapped_column(String, primary_key=True)
    on_hand: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    on_order: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    min_stock: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    
    # Inventory Metadata (v3.0)
    metadata_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, name="metadata")
    
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiStaff(Base):
    """ Modernized Personnel Registry """
    __tablename__ = 'smriti_staff'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    code: Mapped[str] = mapped_column(String, primary_key=True)
    name: Mapped[str] = mapped_column(String)
    role: Mapped[Optional[str]] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiPayMode(Base):
    """ Modernized POSPayModes """
    __tablename__ = 'smriti_pay_mode'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    code: Mapped[str] = mapped_column(String, primary_key=True)
    descr: Mapped[str] = mapped_column(String)
    type: Mapped[Integer] = mapped_column(Integer) # 1=Cash, 2=Card, etc.
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiDocNo(Base):
    """ Modernized PrefixTrnNo (Document Numbering) """
    __tablename__ = 'smriti_docno'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    trn_type: Mapped[int] = mapped_column(Integer, primary_key=True)
    prefix: Mapped[str] = mapped_column(String, primary_key=True)
    next_no: Mapped[int] = mapped_column(Integer, default=1)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiSaleHdr(Base):
    """ Modernized StkTrnHdr (Sales Header) """
    __tablename__ = 'smriti_sale_hdr'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    bill_no: Mapped[str] = mapped_column(String, index=True)
    bill_date: Mapped[datetime] = mapped_column(DateTime)
    cust_code: Mapped[Optional[str]] = mapped_column(String)
    total_qty: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    net_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    staff_code: Mapped[Optional[str]] = mapped_column(String)
    
    # E-Invoice / NIC Integration
    irn: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    irn_ack_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    irn_ack_dt: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    qr_code_data: Mapped[Optional[str]] = mapped_column(String, nullable=True)

    # Tally Sync
    tally_synced: Mapped[bool] = mapped_column(Boolean, default=False)
    tally_synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    tally_retry_count: Mapped[int] = mapped_column(Integer, default=0)

    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiSaleDtl(Base):
    """ Modernized StkTrnDtls (Sales Details) """
    __tablename__ = 'smriti_sale_dtl'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    sale_id: Mapped[str] = mapped_column(String(36), index=True)
    bill_no: Mapped[str] = mapped_column(String)
    srl_no: Mapped[int] = mapped_column(Integer)
    sku: Mapped[str] = mapped_column(String)
    qty: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    rate: Mapped[Numeric] = mapped_column(Numeric(19, 4))
    disc_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    tax_amount: Mapped[Numeric] = mapped_column(Numeric(19, 4), default=0)
    last_sync: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)

class SmritiAuditLog(Base):
    __tablename__ = 'smriti_audit_log'
    tenant_id: Mapped[str] = mapped_column(String, default='SYSTEM', index=True)
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entity_type: Mapped[str] = mapped_column(String(50), index=True)
    entity_id: Mapped[str] = mapped_column(String(100), index=True)
    action: Mapped[str] = mapped_column(String(50))
    user_id: Mapped[Optional[str]] = mapped_column(String(100))
    old_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    new_value: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)