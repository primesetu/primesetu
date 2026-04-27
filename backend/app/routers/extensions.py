from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uuid
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.base import GeneralLookup

router = APIRouter()

class ExtensionUpdate(BaseModel):
    code: str
    is_active: bool
    meta: Optional[Dict[str, Any]] = None

class ExtensionRead(BaseModel):
    id: uuid.UUID
    code: str
    label: str
    is_active: bool
    meta: Optional[Dict[str, Any]] = None

    model_config = {"from_attributes": True}

@router.get("/", response_model=List[ExtensionRead])
async def get_extensions(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Fetch all extensions for the current store."""
    result = await db.execute(
        select(GeneralLookup)
        .where(
            and_(
                GeneralLookup.store_id == current_user.store_id,
                GeneralLookup.category == "extension_flag"
            )
        )
    )
    return result.scalars().all()

@router.post("/", response_model=Dict[str, str])
async def update_extensions(
    updates: List[ExtensionUpdate],
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Batch update store extensions."""
    for update in updates:
        # Check if exists
        result = await db.execute(
            select(GeneralLookup)
            .where(
                and_(
                    GeneralLookup.store_id == current_user.store_id,
                    GeneralLookup.category == "extension_flag",
                    GeneralLookup.code == update.code
                )
            )
        )
        ext = result.scalar_one_or_none()
        
        if ext:
            ext.is_active = update.is_active
            if update.meta is not None:
                ext.meta = update.meta
        else:
            # Create new
            new_ext = GeneralLookup(
                store_id=current_user.store_id,
                category="extension_flag",
                code=update.code,
                label=update.code.replace("_", " ").title(), # Generate simple label
                is_active=update.is_active,
                meta=update.meta or {}
            )
            db.add(new_ext)
            
    await db.commit()
    return {"status": "SUCCESS"}
