# ============================================================
# * PrimeSetu ... Shoper9-Based Retail OS
# * Zero Cloud .. Sovereign .. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * .(c) 2026 ... All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.base import Alert
from app.core.security import get_current_user, UserContext
from typing import List

router = APIRouter()

@router.get("/")
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    result = await db.execute(select(Alert).order_by(Alert.is_read.asc(), Alert.created_at.desc()))
    return result.scalars().all()

@router.patch("/{alert_id}/read")
async def mark_alert_read(
    alert_id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    alert = await db.get(Alert, alert_id)
    if alert:
        alert.is_read = True
        await db.commit()
    return {"status": "success"}
