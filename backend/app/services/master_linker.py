# ============================================================
# SMRITI-OS - MASTER LINKER SERVICE (SOVEREIGN NATIVE)
# Governs Metadata Mapping & Validation using SMRITI_ tables.
# ============================================================
# (c) 2026 - Jawahar R Mallah | AITDL Network
# ============================================================

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.sovereign import (
    SmritiParam, SmritiLookupMap, SmritiLookup, 
    SmritiCombo, SmritiAD
)
from typing import Dict, List, Optional, Any

class MasterLinker:
    @staticmethod
    async def get_system_captions(db: AsyncSession) -> Dict[str, str]:
        """
        Fetches human-readable captions from SMRITI_PARAM.
        """
        codes = [
            'ItemClass1Cap', 'ItemClass2Cap', 
            'ItemSubClass1Cap', 'ItemSubClass2Cap',
            'ItemAnaCd32Caption' # HSN Code
        ]
        
        query = select(SmritiParam).where(SmritiParam.param_code.in_(codes))
        result = await db.execute(query)
        results = result.scalars().all()
        return {r.param_code: r.value_txt for r in results}

    @staticmethod
    async def get_recid_map(db: AsyncSession) -> Dict[str, int]:
        """
        Maps logical categories to their legacy RecIDs from SMRITI_LOOKUP_MAP.
        """
        query = select(SmritiLookupMap)
        result = await db.execute(query)
        results = result.scalars().all()
        return {r.category: r.rec_id for r in results}

    @staticmethod
    async def get_lookup_options(db: AsyncSession, recid: int) -> List[Dict[str, str]]:
        """
        Fetches all valid options for a given RecID from SMRITI_LOOKUP.
        """
        query = select(SmritiLookup).where(
            SmritiLookup.rec_id == recid
        ).order_by(SmritiLookup.descr)
        
        result = await db.execute(query)
        results = result.scalars().all()
        return [{"code": r.code, "descr": r.descr} for r in results]

    @staticmethod
    async def get_grid_config(db: AsyncSession, trn_type: int = 1101) -> List[Dict[str, Any]]:
        """
        Fetches UI grid configuration (visibility, captions, sequence) from SMRITI_AD.
        """
        query = select(SmritiAD).where(
            and_(
                SmritiAD.trntype == trn_type,
                SmritiAD.visible == True
            )
        ).order_by(SmritiAD.position)
        
        result = await db.execute(query)
        results = result.scalars().all()
        return [
            {
                "index": r.index,
                "caption": r.dispcap or r.acptcap,
                "column": r.column_name,
                "type": r.data_type,
                "width": r.width,
                "mandatory": r.is_mandatory
            } for r in results
        ]

    @staticmethod
    async def validate_class_combo(db: AsyncSession, class1: str, class2: str) -> bool:
        """
        Checks if the Class1 + Class2 combination is valid in SMRITI_COMBO.
        """
        query = select(SmritiCombo).where(
            and_(
                SmritiCombo.class1 == class1,
                SmritiCombo.class2 == class2
            )
        )
        result = await db.execute(query)
        return result.first() is not None

linker_service = MasterLinker()
