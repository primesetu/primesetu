from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.models.legacy_s9 import Sysparam, Genlookup
from sqlalchemy import func

router = APIRouter(prefix="/api/v1/settings", tags=["settings"])

# ── SysParam Endpoints ────────────────────────────────────────

@router.get("/sysparams/categories")
def get_categories(db: Session = Depends(get_db)):
    """Fetch all unique system parameter categories."""
    categories = db.query(
        Sysparam.category, 
        Sysparam.catdescr
    ).distinct().order_by(Sysparam.category).all()
    
    return [{"code": c.category, "description": c.catdescr} for c in categories if c.category]

@router.get("/sysparams/{category_code}")
def get_params_by_category(category_code: str, db: Session = Depends(get_db)):
    """Fetch all parameters for a specific category."""
    params = db.query(Sysparam).filter(
        Sysparam.category == category_code
    ).order_by(Sysparam.disporder).all()
    
    return params

@router.put("/sysparams/{param_id}")
def update_param(param_id: str, data: Dict[str, Any], db: Session = Depends(get_db)):
    """Update a specific system parameter."""
    param = db.query(Sysparam).filter(Sysparam.id == param_id).first()
    if not param:
        raise HTTPException(status_code=404, detail="Parameter not found")
    
    # Update fields if provided
    if "boolean" in data: param.boolean = data["boolean"]
    if "intg" in data: param.intg = data["intg"]
    if "txt" in data: param.txt = data["txt"]
    if "dt" in data: param.dt = data["dt"]
    if "sng" in data: param.sng = data["sng"]
    
    db.commit()
    db.refresh(param)
    return param

# ── GenLookUp Endpoints ────────────────────────────────────────

@router.get("/genlookups/types")
def get_genlookup_types(db: Session = Depends(get_db)):
    """Fetch all unique GenLookUp record types."""
    types = db.query(func.distinct(Genlookup.rectype)).order_by(Genlookup.rectype).all()
    return [t[0] for t in types if t[0]]

@router.get("/genlookups/{rectype}")
def get_genlookups_by_type(rectype: str, db: Session = Depends(get_db)):
    """Fetch all lookup entries for a specific record type."""
    lookups = db.query(Genlookup).filter(Genlookup.rectype == rectype).all()
    return lookups
