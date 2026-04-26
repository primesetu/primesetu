# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# © 2026 AITDL Network
# ============================================================

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import InventoryAudit as AuditSession, InventoryAuditItem as AuditEntry, Item

router = APIRouter(prefix="/api/v1/inventory-audit", tags=["inventory-audit"])

@router.get("/")
async def list_audit_sessions(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    result = await db.execute(
        select(AuditSession)
        .where(AuditSession.store_id == current_user.store_id)
        .order_by(AuditSession.created_at.desc())
    )
    return result.scalars().all()

@router.post("/")
async def create_audit_session(
    db: AsyncSession = Depends(get_db), 
    current_user: CurrentUser = Depends(require_auth)
):
    from datetime import datetime
    audit_no = f"AUD-{datetime.now().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
    session = AuditSession(
        audit_no=audit_no,
        store_id=current_user.store_id,
        status="OPEN"
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session

@router.get("/{session_id}")
async def get_audit_session(
    session_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Re-using logic from inventory.py but at this prefix
    from app.routers.inventory import get_audit_session as get_impl
    return await get_impl(session_id, db, current_user)

@router.post("/{session_id}/entries")
async def add_audit_entry(
    session_id: uuid.UUID, 
    data: dict, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    from app.routers.inventory import upsert_audit_entry as upsert_impl, AuditItemEntry
    return await upsert_impl(session_id, AuditItemEntry(**data), db, current_user)

@router.post("/{session_id}/submit")
async def submit_audit(
    session_id: uuid.UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    from app.routers.inventory import finalize_audit_session as finalize_impl
    return await finalize_impl(session_id, db, current_user)
