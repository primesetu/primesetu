"""
ho.py — Head Office Router
Part of: Smriti-OS Sovereign Connectivity Hub, Phase 5

Endpoints:
  POST /api/v1/ho/pulse              — Sovereign heartbeat
  POST /api/v1/ho/execute-command/{command_id}  — Typed command execution
  POST /api/v1/ho/confirm-command/{command_id}  — Manager PIN confirmation gate
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.ho.governance import CommandResult, execute_safe_handler
from app.models.ho import PulseRequest, PulseResponse, RemoteCommand
from app.core.auth import verify_manager_pin  # production implementation required

logger = logging.getLogger("smriti.ho.router")

router = APIRouter(prefix="/api/v1/ho", tags=["Head Office"])

# In-memory pending command store.
# Replace with a persistent store (Redis or DB table) before Phase 5 production.
_pending_commands: dict[str, RemoteCommand] = {}


# ─────────────────────────────────────────────────────────────
# PULSE ENDPOINT
# ─────────────────────────────────────────────────────────────

@router.post("/pulse", response_model=PulseResponse)
async def pulse(
    body: PulseRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PulseResponse:
    """
    Sovereign heartbeat. The node sends health telemetry and receives
    any pending governance commands from HQ.

    Commands requiring approval are stored in _pending_commands.
    They are NOT executed here — execution requires a separate call
    to /confirm-command/{command_id} followed by /execute-command/{command_id}.
    """
    logger.info(
        "Pulse received. node=%s tx_count=%d pending_sync=%d db_latency=%.1fms",
        body.node_id,
        body.transaction_count,
        body.health.pending_sync_count,
        body.health.db_latency_ms,
    )

    # Fetch commands from HQ (replace with actual HQ API call)
    incoming_commands: list[RemoteCommand] = await _fetch_commands_from_hq(body.node_id, db)

    # Stage commands that require approval; auto-queue safe ones
    for cmd in incoming_commands:
        _pending_commands[cmd.command_id] = cmd
        if not cmd.requires_approval:
            logger.info(
                "Auto-queuing non-approval command. command_id=%s type=%s",
                cmd.command_id, cmd.command_type,
            )

    return PulseResponse(
        server_time=datetime.utcnow(),
        commands=incoming_commands,
        sync_required=body.health.pending_sync_count > 0,
    )


# ─────────────────────────────────────────────────────────────
# CONFIRMATION ENDPOINT  (manager PIN gate)
# ─────────────────────────────────────────────────────────────

class ConfirmRequest(BaseModel):
    manager_pin: str
    manager_id:  str


@router.post("/confirm-command/{command_id}", status_code=status.HTTP_200_OK)
async def confirm_command(
    command_id: str,
    body: ConfirmRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Manager PIN confirmation gate for destructive/approval-required commands.

    The frontend calls this after the operator enters their PIN in the
    non-dismissible confirmation dialog. Only after this succeeds should
    the frontend call /execute-command/{command_id}.
    """
    command = _pending_commands.get(command_id)
    if not command:
        raise HTTPException(status_code=404, detail=f"Command '{command_id}' not found.")

    if command.is_expired():
        _pending_commands.pop(command_id, None)
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Command '{command_id}' has expired. HQ must re-issue.",
        )

    if not command.requires_approval:
        # Should not normally be called for non-approval commands, but handle gracefully
        return {"status": "not_required", "command_id": command_id}

    # ── PIN VERIFICATION ──────────────────────────────────────
    # verify_manager_pin raises HTTPException(403) on failure.
    # Production implementation required — see verifyManagerPin.ts notes.
    await verify_manager_pin(manager_id=body.manager_id, pin=body.manager_pin, db=db)

    # Stamp confirmation metadata onto the command
    command.confirmed_by_id = body.manager_id
    command.confirmed_at    = datetime.utcnow()
    command.execution_status = "confirmed"

    logger.info(
        "Command confirmed. command_id=%s type=%s confirmed_by=%s",
        command_id, command.command_type, body.manager_id,
    )
    return {
        "status":     "confirmed",
        "command_id": command_id,
        "confirmed_by": body.manager_id,
    }


# ─────────────────────────────────────────────────────────────
# EXECUTION ENDPOINT
# ─────────────────────────────────────────────────────────────

@router.post("/execute-command/{command_id}", status_code=status.HTTP_200_OK)
async def execute_command(
    command_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict:
    """
    Execute a staged governance command.

    For approval-required commands, /confirm-command must be called first.
    This endpoint calls execute_safe_handler, which routes to the
    appropriate typed handler in governance.py.

    Raw SQL execution is not supported and will never be added.
    """
    command = _pending_commands.get(command_id)
    if not command:
        raise HTTPException(status_code=404, detail=f"Command '{command_id}' not found.")

    if command.is_expired():
        _pending_commands.pop(command_id, None)
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail=f"Command '{command_id}' has expired. HQ must re-issue.",
        )

    # Guard: approval-required commands must have passed /confirm-command first
    if command.requires_approval and not command.confirmed_by_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                f"Command '{command_id}' requires manager approval before execution. "
                "Call /confirm-command/{command_id} first."
            ),
        )

    # Dispatch to governance.py — the ONLY execution path
    result: CommandResult = await execute_safe_handler(command, db)

    command.execution_status = "executed" if result.success else "failed"
    _pending_commands.pop(command_id, None)  # Remove from pending after execution

    logger.info(
        "Command execution complete. command_id=%s type=%s success=%s message=%s",
        command_id, command.command_type, result.success, result.message,
    )

    if not result.success:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=result.message,
        )

    return {
        "status":       "executed",
        "command_id":   command_id,
        "command_type": command.command_type,
        "message":      result.message,
        "data":         result.data,
        "executed_at":  result.executed_at.isoformat(),
    }


# ─────────────────────────────────────────────────────────────
# STUB — replace with actual HQ API call
# ─────────────────────────────────────────────────────────────

async def _fetch_commands_from_hq(
    node_id: str, db: AsyncSession
) -> list[RemoteCommand]:
    """
    Stub: fetch pending commands from the central HQ API.
    Replace with an authenticated outbound HTTP call to HQ.
    """
    return []
