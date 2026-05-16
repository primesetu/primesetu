from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Dict, Any, Optional
import logging

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import Sysparam, Sysparamextd, Sysparamlookup

router = APIRouter(prefix="/legacy-sysparam", tags=["sysparam-manager"])

@router.get("/categories")
async def get_sysparam_categories(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Fetch all unique categories for Sysparam navigation.
    Filters out hidden and installation categories.
    """
    stmt = (
        select(Sysparam.category, Sysparam.catdescr)
        .where(Sysparam.tenant_id == "SYSTEM")
        .where(Sysparam.category.notin_(['HIDDEN', 'INSTALLATION', '']))
        .distinct()
        .order_by(Sysparam.category)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [{"category": r.category, "catdescr": r.catdescr} for r in rows]

@router.get("/parameters/{category}")
async def get_parameters_by_category(
    category: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Fetch all variable parameters for a specific category.
    Includes extended descriptions and lookup options if applicable.
    """
    stmt = (
        select(Sysparam, Sysparamextd.fixed, Sysparamextd.valuelist)
        .outerjoin(
            Sysparamextd, 
            (Sysparam.paramcode == Sysparamextd.paramcode) & 
            (Sysparam.tenant_id == Sysparamextd.tenant_id)
        )
        .where(Sysparam.tenant_id == "SYSTEM")
        .where(Sysparam.category == category)
        .where(Sysparamextd.fixed.in_(['Variable', 'Both']))  # Only editable fields
        .order_by(Sysparam.disporder)
    )
    result = await db.execute(stmt)
    rows = result.all()
    
    params = []
    for p, fixed, valuelist in rows:
        # Determine current value based on OPT
        opt = p.opt.upper() if p.opt else "T"
        if opt == "B":
            value = p.boolean
        elif opt == "I":
            value = p.intg
        elif opt in ("S", "C", "D"): # Sng, Cur, Dt
            value = p.sng
        else:
            value = p.txt
            
        param_data = {
            "paramcode": p.paramcode,
            "descr": p.descr,
            "opt": opt,
            "value": value,
            "fixed": fixed,
            "valuelist": valuelist,
            "lookup_options": []
        }
        
        # If valuelist is exactly 1, it means we must fetch dropdown options from Sysparamlookup
        if valuelist == 1:
            lookup_stmt = select(Sysparamlookup.code, Sysparamlookup.descr).where(
                Sysparamlookup.tenant_id == "SYSTEM",
                Sysparamlookup.paramcode == p.paramcode
            ).order_by(Sysparamlookup.disporder)
            l_result = await db.execute(lookup_stmt)
            param_data["lookup_options"] = [{"code": l.code, "descr": l.descr} for l in l_result.all()]
            
        params.append(param_data)
        
    return params

@router.patch("/parameters/{paramcode}")
async def update_parameter(
    paramcode: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Update a sysparam value atomically.
    Updates the correct column (boolean, intg, sng, txt) based on opt type.
    """
    if "value" not in payload:
        raise HTTPException(status_code=400, detail="Missing 'value' in payload")
        
    stmt = select(Sysparam).where(Sysparam.tenant_id == "SYSTEM", Sysparam.paramcode == paramcode)
    result = await db.execute(stmt)
    param = result.scalar_one_or_none()
    
    if not param:
        raise HTTPException(status_code=404, detail="Parameter not found")
        
    opt = param.opt.upper() if param.opt else "T"
    raw_val = payload["value"]
    
    try:
        if opt == "B":
            param.boolean = bool(raw_val)
        elif opt == "I":
            param.intg = int(raw_val)
        elif opt in ("S", "C", "D"):
            param.sng = float(raw_val)
            param.cur = float(raw_val) # legacy mirror
        else:
            param.txt = str(raw_val)
            
        # Update audit trail
        param.vauid = current_user.user_id or "ADMIN"
        
        await db.commit()
        return {"status": "success", "paramcode": paramcode, "updated_value": raw_val}
    except ValueError as e:
        raise HTTPException(status_code=422, detail=f"Invalid value type for parameter {paramcode}: {str(e)}")
