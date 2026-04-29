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

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Department
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

@router.get("/", response_model=List[DepartmentResponse])
async def list_departments(
    level: Optional[int] = None,
    parent_id: Optional[UUID] = None,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    List departments with optional level/parent filtering.
    Used for Class1 -> Class2 combo selection.
    """
    stmt = select(Department).where(Department.store_id == current_user.store_id)
    if level:
        stmt = stmt.where(Department.level == level)
    if parent_id:
        stmt = stmt.where(Department.parent_id == parent_id)
        
    result = await db.execute(stmt.order_by(Department.name))
    return result.scalars().all()
