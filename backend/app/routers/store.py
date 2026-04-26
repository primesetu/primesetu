# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# © 2026 AITDL Network
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Store
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/api/v1/store", tags=["store"])

class StoreSettings(BaseModel):
    name: str
    code: str
    address: Optional[str]
    gstin: Optional[str]
    phone: Optional[str]
    state_code: Optional[str]
    logo_url: Optional[str] = None
    currency: str = "INR"

@router.get("/settings", response_model=StoreSettings)
async def get_store_settings(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    stmt = select(Store).where(Store.id == current_user.store_id)
    store = (await db.execute(stmt)).scalar_one_or_none()
    
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
        
    return StoreSettings(
        name=store.name,
        code=store.code,
        address=store.address,
        gstin=store.gstin,
        phone=store.phone,
        state_code=store.state_code,
        logo_url=None,
        currency="INR"
    )

@router.patch("/settings")
async def update_store_settings(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    stmt = select(Store).where(Store.id == current_user.store_id)
    store = (await db.execute(stmt)).scalar_one_or_none()
    
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    
    for key, value in payload.items():
        if hasattr(store, key):
            setattr(store, key, value)
            
    await db.commit()
    return {"status": "success"}
