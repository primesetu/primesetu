# ============================================================
# SMRITI-OS — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.models.legacy_s9 import Genlookup
from app.models.base import Department
from app.core.security import require_auth, CurrentUser
from pydantic import BaseModel

router = APIRouter(prefix="/departments", tags=["departments"])

class DepartmentBase(BaseModel):
    name: str
    code: str
    parent_id: Optional[UUID] = None
    level: int = 1
    shoper_recid: Optional[int] = None

class DepartmentResponse(DepartmentBase):
    id: UUID
    class Config:
        from_attributes = True

@router.post("/", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    payload: DepartmentBase,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new classification level (Class1, Class2, etc).
    Supports hierarchical Shoper9 combo logic.
    """
    new_dept = Department(
        store_id=current_user.store_id,
        name=payload.name,
        code=payload.code,
        parent_id=payload.parent_id,
        level=payload.level,
        shoper_recid=payload.shoper_recid
    )
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept

@router.get("/")
async def list_departments(
    level: Optional[int] = Query(None, description="Shoper9 recid (65=Class, 66=Subclass)"),
    parent_id: Optional[str] = None,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    List departments from Shoper9 GeneralLookup.
    Default recid is 65 (Class1/Department).
    """
    recid = level or 65
    stmt = select(GeneralLookup).where(GeneralLookup.recid == recid)
    
    # parent_id filtering for subclass would require complex logic or class12combo join
    # For now, just return all for the level.
    
    result = await db.execute(stmt.order_by(GeneralLookup.descr))
    rows = result.scalars().all()
    
    return [
        {
            "id": row.code,
            "code": row.code,
            "name": row.descr,
            "level": 1 if recid == 65 else 2,
            "shoper_recid": row.recid
        } for row in rows
    ]
