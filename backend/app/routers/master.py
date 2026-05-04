# ============================================================
# SMRITI-OS - MASTER METADATA ROUTER (SOVEREIGN NATIVE)
# Exposes SMRITI_ Resolved Data to Frontend
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.master_linker import linker_service
from typing import Dict, Any, List

router = APIRouter(prefix="/master", tags=["master"])

@router.get("/config")
async def get_master_config(db: AsyncSession = Depends(get_db)):
    """
    Returns a unified configuration object for UI rendering from SMRITI_ tables.
    Maps Captions -> RecIDs -> Options
    """
    try:
        # 1. Get Captions from SMRITI_PARAM
        captions = await linker_service.get_system_captions(db)
        
        # 2. Get RecID Mapping from SMRITI_LOOKUP_MAP
        recid_map = await linker_service.get_recid_map(db)
        
        # 3. Build UI Map (Resolution)
        resolution = {
            "class1": {
                "label": captions.get('ItemClass1Cap', 'Class 1'),
                "recid": recid_map.get('Product', 1),
                "options": []
            },
            "class2": {
                "label": captions.get('ItemClass2Cap', 'Class 2'),
                "recid": recid_map.get('Brand', 2),
                "options": []
            },
            "subclass1": {
                "label": captions.get('ItemSubClass1Cap', 'SubClass 1'),
                "recid": recid_map.get('Article No.', 5), # Mapping from GKP extd
                "options": []
            },
            "subclass2": {
                "label": captions.get('ItemSubClass2Cap', 'SubClass 2'),
                "recid": recid_map.get('Color', 6), # Mapping from GKP extd
                "options": []
            },
            "hsn": {
                "label": captions.get('ItemAnaCd32Caption', 'HSN Code'),
                "recid": 7026, 
                "options": []
            }
        }
        
        # 4. Fetch Options for each resolved field
        for key in resolution:
            rid = resolution[key]["recid"]
            if rid:
                resolution[key]["options"] = await linker_service.get_lookup_options(db, rid)
            
        return resolution

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/grid-config/{trn_type}")
async def get_grid_config(trn_type: int, db: AsyncSession = Depends(get_db)):
    """
    Returns dynamic grid configuration for a specific transaction type.
    """
    try:
        config = await linker_service.get_grid_config(db, trn_type)
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/validate-combo")
async def validate_combo(c1: str, c2: str, db: AsyncSession = Depends(get_db)):
    """
    Validates if a Class1 + Class2 combination exists in SMRITI_COMBO.
    """
    is_valid = await linker_service.validate_class_combo(db, c1, c2)
    return {"is_valid": is_valid}
