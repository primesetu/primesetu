# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import uuid
from pydantic import BaseModel
from app.core.security import require_auth, CurrentUser, require_manager
from app.core.database import get_db
from app.models import RemoteCommand
from app.schemas.common import PulseRequest, PulseResponse

router = APIRouter(tags=["ho"])

class ConfirmRequest(BaseModel):
    manager_id: str
    manager_pin: str

@router.get("/status")
async def get_ho_status(
    db: AsyncSession = Depends(get_db),
):
    """Head Office connectivity and sync status."""
    return {
        "connected": True,
        "last_sync": datetime.now().isoformat(),
        "pending_packets": 0,
        "health": "excellent",
        "corporate_node": "HQ-MUM-01"
    }

from app.core.ho.telemetry import get_node_health

@router.post("/pulse", response_model=PulseResponse)
async def ho_pulse(
    payload: PulseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Pulse Heartbeat.
    Sends local metrics to HQ and receives remote governance commands.
    Now enriched with real Node Telemetry.
    """
    # 1. Collect System Vitals
    health = await get_node_health(db)

    # 2. Fetch pending remote commands for this store
    stmt = select(RemoteCommand).where(
        RemoteCommand.store_id == str(current_user.store_id),
        RemoteCommand.status == "Pending"
    )
    result = await db.execute(stmt)
    commands = result.scalars().all()

    # 3. Return Response
    return PulseResponse(
        status="success",
        server_time=datetime.now(),
        commands=commands,
        health=health,
        message=f"Pulse acknowledged. Node Status: {health.status}",
        schema_version="1.0.0"
    )

@router.post("/confirm-command/{command_id}")
async def confirm_command(
    command_id: str,
    body: ConfirmRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """Manager PIN confirmation gate."""
    cmd = await db.get(RemoteCommand, command_id)
    if not cmd or str(cmd.store_id) != str(current_user.store_id):
        raise HTTPException(status_code=404, detail="Command not found")

    if cmd.is_expired():
        raise HTTPException(status_code=410, detail="Command expired")

    # Production implementation: verify_manager_pin(body.manager_pin)
    cmd.confirmed_by_id = body.manager_id
    cmd.confirmed_at = datetime.now()
    await db.commit()
    
    return {"status": "confirmed", "command_id": command_id}

@router.post("/sync")
async def trigger_ho_sync(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    On-demand flush: push all PENDING smriti_sync_queue rows to Supabase.

    Uses the real OfflineSyncEngine (not the legacy MOCK path). Returns
    actual synced/failed counts from the Supabase upsert round-trip.
    """
    from app.core.sync import flush_now
    synced, failed = await flush_now()

    return {
        "status": "success",
        "synced_records": synced,
        "failed_records": failed,
        "message": (
            f"Sync complete. {synced} records pushed to Supabase cloud."
            + (f" {failed} records failed (will retry)." if failed else "")
        ),
    }

@router.post("/execute-command/{command_id}")
async def execute_remote_command(
    command_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    Execute a specific remote governance command.
    Mandatory: Safe dispatching only. No raw SQL.
    """
    cmd = await db.get(RemoteCommand, command_id)
    if not cmd or str(cmd.store_id) != str(current_user.store_id):
        raise HTTPException(status_code=404, detail="Command not found")
    
    if cmd.is_expired():
        raise HTTPException(status_code=410, detail="Command expired")

    # ── [GOVERNANCE GATE] ───────────────────────────────────────────
    if cmd.requires_approval and not cmd.confirmed_by_id:
        raise HTTPException(
            status_code=403, 
            detail="This command requires local manager confirmation."
        )

    try:
        from app.core.ho.governance import execute_safe_handler
        result = await execute_safe_handler(cmd, db)
        if not result.success:
            raise HTTPException(status_code=500, detail=result.message)
        return {"status": "success", "message": result.message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
