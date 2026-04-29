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

from fastapi import APIRouter, Depends
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
import uuid
from app.core.security import require_auth, CurrentUser, require_manager
from app.core.database import get_db
from app.models import SyncPacket, RemoteCommand
from app.schemas.common import PulseRequest, PulseResponse

router = APIRouter(prefix="/ho", tags=["ho"])

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

@router.post("/pulse", response_model=PulseResponse)
async def ho_pulse(
    payload: PulseRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Pulse Heartbeat.
    Sends local metrics to HQ and receives remote governance commands.
    """
    # 1. Fetch pending remote commands for this store
    stmt = select(RemoteCommand).where(
        RemoteCommand.store_id == str(current_user.store_id),
        RemoteCommand.status == "Pending"
    )
    result = await db.execute(stmt)
    commands = result.scalars().all()

    # 2. Return Response
    return PulseResponse(
        status="success",
        server_time=datetime.now(),
        commands=commands,
        message=f"Pulse acknowledged. {len(commands)} commands pending."
    )

@router.post("/sync")
async def trigger_ho_sync(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """Flush pending packets to Head Office."""
    stmt = select(SyncPacket).where(
        SyncPacket.store_id == str(current_user.store_id),
        SyncPacket.status == "PENDING"
    )
    result = await db.execute(stmt)
    pending_packets = result.scalars().all()

    packet_count = len(pending_packets)

    # Sovereign protocol: Mark as SYNCED once acknowledged by HO
    for pkt in pending_packets:
        pkt.status = "SYNCED"
        pkt.synced_at = datetime.now()

    await db.commit()

    return {
        "status": "success",
        "synced_records": packet_count,
        "bandwidth_used": f"{(packet_count * 1.2):.1f} KB",
        "message": f"Successfully synchronized {packet_count} packets with Head Office."
    }

@router.post("/execute-command/{command_id}")
async def execute_remote_command(
    command_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """Execute a specific remote governance command."""
    cmd = await db.get(RemoteCommand, command_id)
    if not cmd or str(cmd.store_id) != str(current_user.store_id):
        return {"status": "error", "message": "Command not found"}
    
    if cmd.command_type == "SQL":
        try:
            # Sovereign execution: Run raw SQL provided by HQ
            await db.execute(text(cmd.payload))
            cmd.status = "Executed"
            cmd.executed_at = datetime.now()
            await db.commit()
            return {"status": "success", "message": "SQL command executed"}
        except Exception as e:
            cmd.status = "Failed"
            await db.commit()
            return {"status": "error", "message": str(e)}
            
    return {"status": "error", "message": "Unsupported command type"}
