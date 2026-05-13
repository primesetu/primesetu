# ============================================================
# SMRITI-OS — Sovereign Item Classification Models
# Mirrors Shoper9 ItemMaster upstream dependency chain:
#   GenLookup → Class12Combo → SubClass1Cat / SubClass2Cat / SizeCat
#                            → ItemMaster → ExtdItemMaster → StockMaster
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

from __future__ import annotations
from datetime import datetime
from decimal import Decimal
from typing import Optional

from sqlalchemy import (
    String, Integer, Numeric, Boolean, DateTime, Text,
    UniqueConstraint, Index, text
)
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

_NOW = text("now()")


# ── TIER 1A ─────────────────────────────────────────────────
# SubClass1Cat — Style Master
# S9: SubClass1Cat (Class1Cd, Class2Cd, SubClass1Cd)
# Holds Style under a Product×Brand combo.
# Also carries all 32 AnalCodes at style-level (inherited by items).
# ─────────────────────────────────────────────────────────────

class SubClass1Cat(Base):
    """
    Style (SubClass1) master. Exact parity with S9 SUBCLASS1CAT.
    PK: (class1cd, class2cd, subclass1cd)
    FK: → smriti_combo (class1cd, class2cd)
    """
    __tablename__ = "subclass1cat"
    __table_args__ = (
        UniqueConstraint("class1cd", "class2cd", "subclass1cd", name="uq_subclass1cat_pk"),
        Index("ix_subclass1cat_class12", "class1cd", "class2cd"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    # ── Classification ──────────────────────────────────────
    class1cd: Mapped[str] = mapped_column(String(16), nullable=False, comment="Product → GenLookup RecId=1")
    class2cd: Mapped[str] = mapped_column(String(16), nullable=False, comment="Brand → GenLookup RecId=2")
    subclass1cd: Mapped[str] = mapped_column(String(16), nullable=False, comment="Style code → GenLookup RecId=3")
    subclass1desc: Mapped[Optional[str]] = mapped_column(String(40), nullable=True, comment="Style description")

    # ── Tax / Flags ─────────────────────────────────────────
    prodtaxtype: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="GST Slab → GenLookup RecId=54")
    regularind: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, comment="1=Regular Item")
    imageid: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    # ── All 32 AnalCodes (S9 parity) ────────────────────────
    analcode1:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="Fibre → RecId=65")
    analcode2:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="Finish → RecId=66")
    analcode3:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="Colour Base → RecId=67")
    analcode4:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="Styling → RecId=68")
    analcode5:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="Usage → RecId=69")
    analcode6:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode7:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode8:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode9:  Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode10: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode11: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode12: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode13: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode14: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode15: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode16: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode17: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode18: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode19: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode20: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode21: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode22: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode23: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode24: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode25: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode26: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode27: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode28: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode29: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode30: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode31: Mapped[Optional[str]] = mapped_column(String(16), nullable=True)
    analcode32: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="HSN Code → GenLookup RecId=7026")

    # ── VA Audit ─────────────────────────────────────────────
    vauid:     Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vactr:     Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid:  Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vacompcode:Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    dateinsert:      Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)
    lastupdateddate: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, onupdate=_NOW, nullable=True)
    last_sync:       Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)


# ── TIER 1B ─────────────────────────────────────────────────
# SubClass2Cat — Shade / Colour Master
# S9: SubClass2Cat (Class1Cd, Class2Cd, SubClass2Cd)
# ─────────────────────────────────────────────────────────────

class SubClass2Cat(Base):
    """
    Shade / Colour (SubClass2) master.
    PK: (class1cd, class2cd, subclass2cd)
    FK: → smriti_combo (class1cd, class2cd)
    """
    __tablename__ = "subclass2cat"
    __table_args__ = (
        UniqueConstraint("class1cd", "class2cd", "subclass2cd", name="uq_subclass2cat_pk"),
        Index("ix_subclass2cat_class12", "class1cd", "class2cd"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    class1cd:     Mapped[str]           = mapped_column(String(16), nullable=False)
    class2cd:     Mapped[str]           = mapped_column(String(16), nullable=False)
    subclass2cd:  Mapped[str]           = mapped_column(String(16), nullable=False, comment="Shade/Colour code")
    subclass2desc:Mapped[Optional[str]] = mapped_column(String(40), nullable=True)

    # ── VA Audit ─────────────────────────────────────────────
    vauid:     Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vactr:     Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid:  Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vacompcode:Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    dateinsert:      Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)
    lastupdateddate: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, onupdate=_NOW, nullable=True)
    last_sync:       Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)


# ── TIER 1C ─────────────────────────────────────────────────
# SizeCat — Size Master
# S9: SizeCat (Class1Cd, Class2Cd, SizeCd)
# PivotalSize + SizeGroupSrlNo drive ratio-based replenishment.
# ─────────────────────────────────────────────────────────────

class SizeCat(Base):
    """
    Size master under a Product×Brand combo.
    PK: (class1cd, class2cd, sizecd)
    FK: → smriti_combo (class1cd, class2cd)
    """
    __tablename__ = "sizecat"
    __table_args__ = (
        UniqueConstraint("class1cd", "class2cd", "sizecd", name="uq_sizecat_pk"),
        Index("ix_sizecat_class12", "class1cd", "class2cd"),
        Index("ix_sizecat_sizegroupid", "sizegroupid"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)

    class1cd:    Mapped[str]           = mapped_column(String(16), nullable=False)
    class2cd:    Mapped[str]           = mapped_column(String(16), nullable=False)
    sizecd:      Mapped[str]           = mapped_column(String(16), nullable=False, comment="Size code")
    sizegroupid: Mapped[Optional[str]] = mapped_column(String(16), nullable=True, comment="SizeGroup → GenLookup RecId=53")

    ispivotalsize:      Mapped[Optional[int]]     = mapped_column(Integer, nullable=True, comment="1=Pivotal size for replenishment ratio")
    sizegroupsrlno:     Mapped[Optional[int]]     = mapped_column(Integer, nullable=True, comment="Ordinal within size group")
    idealstockratioqty: Mapped[Optional[Decimal]] = mapped_column(Numeric(19, 4), nullable=True, comment="Replenishment ratio quantity")
    convsizecd:         Mapped[Optional[str]]     = mapped_column(String(16), nullable=True, comment="Conversion size code")
    convfactor:         Mapped[Optional[Decimal]] = mapped_column(Numeric(19, 4), nullable=True, comment="Conversion factor")

    # ── VA Audit ─────────────────────────────────────────────
    vauid:     Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vactr:     Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid:  Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vacompcode:Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    dateinsert:      Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)
    lastupdateddate: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, onupdate=_NOW, nullable=True)
    last_sync:       Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)


# ── TIER 2A ─────────────────────────────────────────────────
# ExtdItemMaster — Extended Item Description (1:1 with ItemMaster)
# S9: ExtdItemMaster (StockNo, ItemExtDesc, ImageId)
# Created when ItemMaster.ExtDescPresent = TRUE
# ─────────────────────────────────────────────────────────────

class ExtdItemMaster(Base):
    """
    Extended item description + image. 1:1 with legacy.itemmaster.
    PK: stockno (same as ItemMaster.StockNo)
    """
    __tablename__ = "extd_item_master"

    stockno: Mapped[str] = mapped_column(
        String(32), primary_key=True,
        comment="FK → legacy.itemmaster.stockno"
    )
    item_ext_desc: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True,
        comment="Extended description up to S9 max 256 chars"
    )
    image_id:   Mapped[Optional[str]] = mapped_column(String(60),  nullable=True, comment="S9 ImageId")
    image_url:  Mapped[Optional[str]] = mapped_column(String(512), nullable=True, comment="Sovereign: CDN / local image path")
    image_b64:  Mapped[Optional[str]] = mapped_column(Text, nullable=True,        comment="Sovereign: Base64 thumbnail for offline PWA")

    # ── VA Audit ─────────────────────────────────────────────
    vauid:     Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vactr:     Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    vatermid:  Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    vacompcode:Mapped[Optional[str]] = mapped_column(String(16), nullable=True)

    dateinsert:      Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)
    lastupdateddate: Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, onupdate=_NOW, nullable=True)
    last_sync:       Mapped[Optional[datetime]] = mapped_column(DateTime, server_default=_NOW, nullable=True)
