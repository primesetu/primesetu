# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# Protocol: DB Sovereign v1.0 – Shoper9 is truth.
# Refactored: Full S9 parity (Start to Product Creations.sql trace)
# ============================================================

from pydantic import BaseModel, Field, ConfigDict, field_validator
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal

# ────────────────────────────────────────────────────────────
# GenLookup Sync (Priority 3 – runs before ItemMaster INSERT)
# Mirrors the S9 pattern: INSERT INTO GenLookup WHERE code NOT EXISTS
# ────────────────────────────────────────────────────────────

class GenLookupSyncItem(BaseModel):
    """Single lookup value to upsert into GenLookup."""
    recid: int = Field(..., description="RecId: 1=Class1, 2=Class2, 51=SuperClass1, 52=SuperClass2, 53=SizeGroup, 54=ProdTaxType, 65-69=AnalCode1-5, 7026=AnalCode32(HSN), 7030=GradeCd, 7031=LocationCd")
    code: str = Field(..., max_length=16)
    descr: str = Field(..., max_length=40)
    flag: str = Field(default="", max_length=2)
    number: int = Field(default=0)

class GenLookupSyncRequest(BaseModel):
    """Batch upsert lookup values before item save. Mirrors S9 pipeline."""
    items: List[GenLookupSyncItem]

class GenLookupSyncResponse(BaseModel):
    inserted: int
    skipped: int

# ────────────────────────────────────────────────────────────
# CLASS12COMBO (Priority 2)
# Product × Brand matrix. Created before ItemMaster INSERT.
# ────────────────────────────────────────────────────────────

class Class12ComboCreate(BaseModel):
    class1cd: str = Field(..., max_length=16, description="Product (Class1) code")
    class2cd: str = Field(..., max_length=16, description="Brand (Class2) code")
    sizegroup: Optional[str] = Field(None, max_length=16, description="Size Group ID → GenLookup RecId=53")
    prodtaxtype: Optional[str] = Field(None, max_length=16, description="Product Tax Type → GenLookup RecId=54")
    billable: Optional[int] = Field(None, description="1=Billable, 0=Not Billable")
    isservicecombo: Optional[int] = Field(None)
    retailmarkup: Optional[Decimal] = Field(None, description="Retail Markup %")
    dealermarkup: Optional[Decimal] = Field(None, description="Dealer Markup %")
    prefvendorid: Optional[str] = Field(None, max_length=16)
    altvendorid1: Optional[str] = Field(None, max_length=16)
    altvendorid2: Optional[str] = Field(None, max_length=16)
    altvendorid3: Optional[str] = Field(None, max_length=16)
    superclass1: Optional[str] = Field(None, max_length=16, description="Department → GenLookup RecId=51")
    superclass2: Optional[str] = Field(None, max_length=16, description="Buyer → GenLookup RecId=52")
    isconsignmentitem: Optional[bool] = Field(None)

class Class12ComboResponse(BaseModel):
    class1cd: str
    class2cd: str
    sizegroup: Optional[str] = None
    prodtaxtype: Optional[str] = None
    superclass1: Optional[str] = None
    superclass2: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# ────────────────────────────────────────────────────────────
# SUBCLASS1CAT (Priority 2)
# Style (SubClass1) under Class1+Class2. Holds all 32 AnalCodes.
# ────────────────────────────────────────────────────────────

class Subclass1CatCreate(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    subclass1cd: str = Field(..., max_length=16, description="Style code")
    subclass1desc: Optional[str] = Field(None, max_length=40, description="Style description")
    prodtaxtype: Optional[str] = Field(None, max_length=16)
    regularind: Optional[int] = Field(None)
    imageid: Optional[str] = Field(None, max_length=16)
    # All 32 AnalCodes mirroring S9 SUBCLASS1CAT schema
    analcode1: Optional[str] = Field(None, max_length=16)
    analcode2: Optional[str] = Field(None, max_length=16)
    analcode3: Optional[str] = Field(None, max_length=16)
    analcode4: Optional[str] = Field(None, max_length=16)
    analcode5: Optional[str] = Field(None, max_length=16)
    analcode6: Optional[str] = Field(None, max_length=16)
    analcode7: Optional[str] = Field(None, max_length=16)
    analcode8: Optional[str] = Field(None, max_length=16)
    analcode9: Optional[str] = Field(None, max_length=16)
    analcode10: Optional[str] = Field(None, max_length=16)
    analcode11: Optional[str] = Field(None, max_length=16)
    analcode12: Optional[str] = Field(None, max_length=16)
    analcode13: Optional[str] = Field(None, max_length=16)
    analcode14: Optional[str] = Field(None, max_length=16)
    analcode15: Optional[str] = Field(None, max_length=16)
    analcode16: Optional[str] = Field(None, max_length=16)
    analcode17: Optional[str] = Field(None, max_length=16)
    analcode18: Optional[str] = Field(None, max_length=16)
    analcode19: Optional[str] = Field(None, max_length=16)
    analcode20: Optional[str] = Field(None, max_length=16)
    analcode21: Optional[str] = Field(None, max_length=16)
    analcode22: Optional[str] = Field(None, max_length=16)
    analcode23: Optional[str] = Field(None, max_length=16)
    analcode24: Optional[str] = Field(None, max_length=16)
    analcode25: Optional[str] = Field(None, max_length=16)
    analcode26: Optional[str] = Field(None, max_length=16)
    analcode27: Optional[str] = Field(None, max_length=16)
    analcode28: Optional[str] = Field(None, max_length=16)
    analcode29: Optional[str] = Field(None, max_length=16)
    analcode30: Optional[str] = Field(None, max_length=16)
    analcode31: Optional[str] = Field(None, max_length=16)
    analcode32: Optional[str] = Field(None, max_length=16, description="HSN Code → GenLookup RecId=7026")

# ────────────────────────────────────────────────────────────
# SUBCLASS2CAT (Priority 2)
# Shade/Colour (SubClass2) under Class1+Class2.
# ────────────────────────────────────────────────────────────

class Subclass2CatCreate(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    subclass2cd: str = Field(..., max_length=16, description="Shade/Colour code")
    subclass2desc: Optional[str] = Field(None, max_length=40)

# ────────────────────────────────────────────────────────────
# SIZECAT (Priority 2)
# Size under Class1+Class2. Holds PivotalSize + SizeGroupSrlNo.
# ────────────────────────────────────────────────────────────

class SizeCatCreate(BaseModel):
    class1cd: str = Field(..., max_length=16)
    class2cd: str = Field(..., max_length=16)
    sizecd: str = Field(..., max_length=16)
    sizegroupid: Optional[str] = Field(None, max_length=16)
    ispivotalsize: Optional[int] = Field(None, description="1=Pivotal size for the size group")
    sizegroupsrlno: Optional[int] = Field(None)
    idealstockratioqty: Optional[Decimal] = Field(None)
    convsizecd: Optional[str] = Field(None, max_length=16)
    convfactor: Optional[Decimal] = Field(None)

# ────────────────────────────────────────────────────────────
# ITEMMASTER – Full S9 parity (116 columns)
# Priority 1: Fixed column names, types, and defaults
# ────────────────────────────────────────────────────────────

class ItemCreate(BaseModel):
    """
    Maps 1:1 to Shoper 9 ItemMaster table columns.
    Follows the S9 INSERT pipeline from Start to Product Creations.sql.
    """
    # ── Identity (Required) ──────────────────────────────────
    stockno: str = Field(..., max_length=20, description="StockNo – primary key")
    batchsrlno: int = Field(default=0, description="Batch serial no. 0=new item sentinel")
    itemdesc: str = Field(..., max_length=40, description="Item description")

    # ── Classification (FK → GenLookup) ──────────────────────
    class1cd: str = Field(..., max_length=16, description="Product → GenLookup RecId=1")
    class2cd: str = Field(..., max_length=16, description="Brand → GenLookup RecId=2")
    subclass1cd: Optional[str] = Field(None, max_length=16, description="Style → SUBCLASS1CAT")
    subclass2cd: Optional[str] = Field(None, max_length=16, description="Shade → SUBCLASS2CAT")
    sizecd: Optional[str] = Field(None, max_length=16, description="Size → SIZECAT")

    # ── Pricing ──────────────────────────────────────────────
    retail_price: Decimal = Field(default=Decimal("0"), description="MRP (Retail Price)")
    dealer_price: Optional[Decimal] = Field(default=Decimal("0"), description="Dealer/Wholesale Price")
    currentcost: Optional[Decimal] = Field(default=Decimal("0"), description="Current Cost")
    lastpurchprice: Optional[Decimal] = Field(None, description="Last Purchase Price. Auto=CurrentCost if NULL.")
    finalmrp: Optional[Decimal] = Field(None, description="MRP inclusive of tax")
    rtlmarkup: Optional[Decimal] = Field(None, description="Retail Markup %")
    dlrmarkup: Optional[Decimal] = Field(None, description="Dealer Markup %")

    # ── Tax ──────────────────────────────────────────────────
    prodtaxtype: Optional[str] = Field(None, max_length=16, description="GST Slab → GenLookup RecId=54")
    srctaxtype: Optional[str] = Field(None, max_length=16, description="Source Tax Type")
    isrptaxinclusive: Optional[bool] = Field(default=False, description="Is Retail Price tax inclusive?")

    # ── Flags ─────────────────────────────────────────────────
    isinventoryitem: Optional[bool] = Field(default=True)
    isbillable: Optional[bool] = Field(default=True)
    isservice: Optional[bool] = Field(default=False)
    isconsignmentitem: Optional[bool] = Field(default=False)
    regularind: Optional[int] = Field(default=1, description="1=Regular Item")
    leastsalableqty: Optional[Decimal] = Field(default=Decimal("1"))

    # ── Reorder ──────────────────────────────────────────────
    reordlvl: Optional[Decimal] = Field(default=Decimal("0"))
    eoq: Optional[Decimal] = Field(default=Decimal("0"))
    minordqty: Optional[Decimal] = Field(default=Decimal("0"))

    # ── Jewellery (default 0 for non-jwl stores) ─────────────
    usejwlpricing: Optional[int] = Field(default=0)
    jwlmetalind: Optional[str] = Field(None, max_length=1)
    jwlcaratage: Optional[Decimal] = Field(default=Decimal("0"))
    jwlgrosswt: Optional[Decimal] = Field(default=Decimal("0"))
    jwlstonewt: Optional[Decimal] = Field(default=Decimal("0"))
    jwlwtfactor: Optional[Decimal] = Field(default=Decimal("0"))
    jwlratefactor: Optional[Decimal] = Field(default=Decimal("0"))
    jwlstoneval: Optional[Decimal] = Field(default=Decimal("0"))
    jwlmakecharge: Optional[Decimal] = Field(default=Decimal("0"))
    jwlvalfactor: Optional[Decimal] = Field(default=Decimal("0"))

    # ── 32 AnalCodes (Attributes) ─────────────────────────────
    analcode1: Optional[str] = Field(None, max_length=16, description="Fibre → RecId=65")
    analcode2: Optional[str] = Field(None, max_length=16, description="Finish → RecId=66")
    analcode3: Optional[str] = Field(None, max_length=16, description="Colour Base → RecId=67")
    analcode4: Optional[str] = Field(None, max_length=16, description="Styling → RecId=68")
    analcode5: Optional[str] = Field(None, max_length=16, description="Usage → RecId=69")
    analcode6: Optional[str] = Field(None, max_length=16)
    analcode7: Optional[str] = Field(None, max_length=16)
    analcode8: Optional[str] = Field(None, max_length=16)
    analcode9: Optional[str] = Field(None, max_length=16)
    analcode10: Optional[str] = Field(None, max_length=16)
    analcode11: Optional[str] = Field(None, max_length=16)
    analcode12: Optional[str] = Field(None, max_length=16)
    analcode13: Optional[str] = Field(None, max_length=16)
    analcode14: Optional[str] = Field(None, max_length=16)
    analcode15: Optional[str] = Field(None, max_length=16)
    analcode16: Optional[str] = Field(None, max_length=16)
    analcode17: Optional[str] = Field(None, max_length=16)
    analcode18: Optional[str] = Field(None, max_length=16)
    analcode19: Optional[str] = Field(None, max_length=16)
    analcode20: Optional[str] = Field(None, max_length=16)
    analcode21: Optional[str] = Field(None, max_length=16)
    analcode22: Optional[str] = Field(None, max_length=16)
    analcode23: Optional[str] = Field(None, max_length=16)
    analcode24: Optional[str] = Field(None, max_length=16)
    analcode25: Optional[str] = Field(None, max_length=16)
    analcode26: Optional[str] = Field(None, max_length=16)
    analcode27: Optional[str] = Field(None, max_length=16)
    analcode28: Optional[str] = Field(None, max_length=16)
    analcode29: Optional[str] = Field(None, max_length=16)
    analcode30: Optional[str] = Field(None, max_length=16)
    analcode31: Optional[str] = Field(None, max_length=16)
    analcode32: Optional[str] = Field(None, max_length=16, description="HSN Code → RecId=7026")

    # ── Batch / Grade / Location ──────────────────────────────
    gradecd: Optional[str] = Field(None, max_length=16, description="Grade → GenLookup RecId=7030")
    batchapplicable: Optional[int] = Field(default=0)
    gradeapplicable: Optional[int] = Field(default=0)
    locationapplicable: Optional[int] = Field(default=0)

    # ── Dates / Image ─────────────────────────────────────────
    mfgdate: Optional[date] = Field(None)
    expdate: Optional[date] = Field(None)
    shelflife: Optional[int] = Field(None)
    imagepresent: Optional[bool] = Field(default=False)
    imageid: Optional[str] = Field(None, max_length=50)
    extdescpresent: Optional[bool] = Field(default=False)

    # ── Stock Flags ───────────────────────────────────────────
    flgstocktake: Optional[int] = Field(default=0)
    flgratealterable: Optional[int] = Field(default=0)
    flgstockchkappl: Optional[int] = Field(default=0)
    stocktolerance: Optional[Decimal] = Field(default=Decimal("0"))

    # ── Custom Fields (S/N/D/B) ───────────────────────────────
    sfield1: Optional[str] = Field(None, max_length=50, description="Barcode/EAN or custom string")
    sfield2: Optional[str] = Field(None, max_length=50)
    sfield3: Optional[str] = Field(None, max_length=50)
    sfield4: Optional[str] = Field(None, max_length=50)
    sfield5: Optional[str] = Field(None, max_length=50)
    nfield1: Optional[int] = Field(None)
    nfield2: Optional[int] = Field(None)
    nfield3: Optional[int] = Field(None)
    nfield4: Optional[int] = Field(None)
    nfield5: Optional[int] = Field(None)
    bfield1: Optional[bool] = Field(default=False, description="Used as StockMaster init sentinel: BField1=0 → insert Stockmaster row")
    bfield2: Optional[bool] = Field(None)

    # ── Cross-Chain ───────────────────────────────────────────
    ccstockno: Optional[str] = Field(None, max_length=20)

    # ── Discount / Pricing Rules ──────────────────────────────
    merchid: Optional[str] = Field(None, max_length=16)
    discid: Optional[int] = Field(None)
    discper: Optional[int] = Field(None)
    discamt: Optional[int] = Field(None)

    # ── VA Audit Trail (defaults from current user session) ───
    vauid: Optional[str] = Field(None, max_length=32)
    vactr: Optional[int] = Field(default=1)
    vatermid: Optional[str] = Field(default=".", max_length=32)
    vacompcode: Optional[str] = Field(None, max_length=4)

    @field_validator("lastpurchprice", mode="before")
    @classmethod
    def default_lastpurchprice(cls, v, info):
        """S9 rule: LastPurchPrice = CurrentCost if NULL or 0."""
        if v is None or v == 0:
            return info.data.get("currentcost") or Decimal("0")
        return v


class ItemResponse(BaseModel):
    stockno: str
    batchsrlno: int
    itemdesc: str
    class1cd: str
    class2cd: str
    subclass1cd: Optional[str] = None
    subclass2cd: Optional[str] = None
    sizecd: Optional[str] = None
    retail_price: Optional[Decimal] = None
    dealer_price: Optional[Decimal] = None
    currentcost: Optional[Decimal] = None
    prodtaxtype: Optional[str] = None
    analcode32: Optional[str] = None  # HSN Code
    sfield1: Optional[str] = None     # Barcode
    isinventoryitem: Optional[bool] = None
    isbillable: Optional[bool] = None
    isservice: Optional[bool] = None
    gradecd: Optional[str] = None
    imageid: Optional[str] = None
    finalmrp: Optional[Decimal] = None
    dateinsert: Optional[datetime] = None
    lastupdateddate: Optional[datetime] = None
    # Injected from Stockmaster join
    total_stock: int = 0

    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────
# STOCKMASTER INIT ROW (Priority 1)
# Created automatically after ItemMaster INSERT, mirroring S9:
#   Insert into stockmaster (stockno, LocnId=0, BatchSrlno, curbalqty=0, ...)
# ────────────────────────────────────────────────────────────

class StockMasterInitRow(BaseModel):
    """Auto-created StockMaster row. Not exposed to frontend directly."""
    stockno: str
    locnid: int = Field(default=0)
    batchsrlno: int = Field(default=0)
    curbalqty: Decimal = Field(default=Decimal("0"))
    curbalval: Decimal = Field(default=Decimal("0"))
    yropbalqty: Decimal = Field(default=Decimal("0"))
    yropbalval: Decimal = Field(default=Decimal("0"))
    vactr: int = Field(default=1)
    vauid: Optional[str] = None
    vatermid: Optional[str] = Field(default=".")
    vacompcode: Optional[str] = None


# ────────────────────────────────────────────────────────────
# BATCH CREATE (with full cascade)
# Priority 1+2: Batch create items with cascade to all 5 tables
# ────────────────────────────────────────────────────────────

class ItemBatchCreate(BaseModel):
    items: List[ItemCreate]
    omit_duplicates: bool = Field(default=True, description="Skip items with existing StockNo")
    cascade_class12: bool = Field(default=True, description="Auto-upsert CLASS12COMBO for each item")
    cascade_subclasses: bool = Field(default=True, description="Auto-upsert SUBCLASS1CAT + SUBCLASS2CAT")
    cascade_sizecat: bool = Field(default=True, description="Auto-upsert SIZECAT")
    sync_genlookup: bool = Field(default=True, description="Auto-upsert GenLookup for Class1/Class2/AnalCodes")

class BatchCreateResponse(BaseModel):
    success_count: int
    skipped_count: int
    error_count: int
    items: List[ItemResponse] = []
    skipped_codes: List[str] = []
    cascade_summary: dict = Field(default_factory=dict)


# ────────────────────────────────────────────────────────────
# PRICE UPDATE
# ────────────────────────────────────────────────────────────

class PriceLevelUpdate(BaseModel):
    stockno: str
    retail_price: Optional[Decimal] = None
    dealer_price: Optional[Decimal] = None
    currentcost: Optional[Decimal] = None
    finalmrp: Optional[Decimal] = None

class StockMatrixEntry(BaseModel):
    locnid: int = Field(default=0)
    batchsrlno: int = Field(default=0)
    curbalqty: Decimal = Field(default=Decimal("0"))
    curbalval: Decimal = Field(default=Decimal("0"))

class StockMatrixResponse(BaseModel):
    stockno: str
    matrix: List[StockMatrixEntry]
    model_config = ConfigDict(from_attributes=True)


# ────────────────────────────────────────────────────────────
# ITEM MASTER CONFIG (Priority 4 – dynamic labels)
# Fetched from itemmasterconfig.FC to drive UI column labels
# ────────────────────────────────────────────────────────────

class ItemMasterConfigEntry(BaseModel):
    fn: str       # Field Name (e.g. 'Class1Cd')
    fc: str       # Field Caption (e.g. 'Product')
    fid: str      # Field ID
    flag1: int = 0
    flag2: int = 0
    flag3: int = 0
    flag4: int = 0
    model_config = ConfigDict(from_attributes=True)

class ItemCaptionsResponse(BaseModel):
    captions: dict = Field(default_factory=dict, description="{'class1cd': 'Product', 'class2cd': 'Brand', ...}")

# ────────────────────────────────────────────────────────────
# SEARCH SCHEMA
# ────────────────────────────────────────────────────────────

class SearchFilter(BaseModel):
    field: str
    operator: str
    value: str

class AdvancedSearchRequest(BaseModel):
    filters: List[SearchFilter]
    logic: str = "AND"
