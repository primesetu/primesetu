"""
governance.py — Secure HQ Command Dispatcher
Part of: Smriti-OS Sovereign Connectivity Hub, Phase 5

This module is the ONLY place where RemoteCommands are executed.
All handlers are hardcoded Python functions. There is no dynamic
dispatch, no eval(), and no raw SQL execution path.

─── EXTENSION GUIDE ────────────────────────────────────────────
To add a new command type:
  1. Add the variant to RemoteCommandType in ho.py (models).
  2. Add its policy to _COMMAND_POLICY in ho.py (models).
  3. Implement a handler here following the _handle_* pattern.
  4. Register it in _HANDLER_MAP at the bottom of this file.
  5. Write a pytest for the new handler.
Never add a handler that executes arbitrary strings from the payload.
────────────────────────────────────────────────────────────────
"""

from __future__ import annotations

import logging
from datetime import datetime
from typing import Any, Dict

from sqlalchemy.ext.asyncio import AsyncSession

# Internal imports (adjust paths to match your project layout)
from app.models.ho import (
    ConfigUpdatePayload,
    RemoteCommand,
    RemoteCommandType,
)

logger = logging.getLogger("smriti.governance")


# ─────────────────────────────────────────────────────────────
# RESULT TYPE
# ─────────────────────────────────────────────────────────────

class CommandResult:
    def __init__(self, success: bool, message: str, data: Dict[str, Any] | None = None):
        self.success   = success
        self.message   = message
        self.data      = data or {}
        self.executed_at = datetime.utcnow()

    def __repr__(self) -> str:
        status = "OK" if self.success else "FAIL"
        return f"CommandResult[{status}] {self.message}"


# ─────────────────────────────────────────────────────────────
# INDIVIDUAL HANDLERS
# Each handler signature: (command, db) -> CommandResult
# Handlers must be idempotent where possible.
# ─────────────────────────────────────────────────────────────

async def _handle_force_sync(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Flush all pending sync packets to HQ immediately.
    Calls the existing sync flush logic — does not reimplement it here.
    """
    try:
        # Import here to avoid circular dependencies
        from app.core.sync import flush_pending_packets
        flushed_count = await flush_pending_packets(db)
        logger.info(
            "FORCE_SYNC executed. command_id=%s flushed_packets=%d",
            command.command_id, flushed_count
        )
        return CommandResult(
            success=True,
            message=f"Sync flush complete. {flushed_count} packets sent.",
            data={"flushed_count": flushed_count},
        )
    except Exception as exc:
        logger.error("FORCE_SYNC failed. command_id=%s error=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))


async def _handle_flush_cache(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Invalidate application-level caches (category cache, param cache, etc.).
    Does not touch the database.
    """
    try:
        from app.core.cache import invalidate_all
        invalidate_all()
        logger.info("FLUSH_CACHE executed. command_id=%s", command.command_id)
        return CommandResult(success=True, message="All application caches invalidated.")
    except Exception as exc:
        logger.error("FLUSH_CACHE failed. command_id=%s error=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))


async def _handle_restart_service(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Trigger a graceful service restart via the OS process manager.
    Requires approval_required=True (enforced by policy, not this handler).
    The actual restart is delegated to the supervisor/systemd wrapper to
    ensure the process comes back up — this process does not kill itself.
    """
    try:
        import subprocess  # noqa: S404 — intentional, controlled invocation only
        result = subprocess.run(  # noqa: S603
            ["sudo", "systemctl", "reload", "smriti-backend"],
            capture_output=True, text=True, timeout=10,
            check=False,
        )
        if result.returncode != 0:
            raise RuntimeError(result.stderr.strip())
        logger.warning(
            "RESTART_SERVICE executed. command_id=%s confirmed_by=%s",
            command.command_id, command.confirmed_by_id,
        )
        return CommandResult(success=True, message="Service reload signal sent.")
    except Exception as exc:
        logger.error("RESTART_SERVICE failed. command_id=%s error=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))


async def _handle_update_config(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Update a single SmritiParam as directed by HQ.

    Payload is validated against ConfigUpdatePayload, which enforces:
      - param_code is a known, bounded string
      - Currency values are integer paise (no floats)
      - opt_type is one of B/C/I/S
    HQ cannot push arbitrary config blobs through this path.
    """
    try:
        if not command.payload:
            raise ValueError("UPDATE_CONFIG command missing payload.")

        # Validate payload shape — raises ValidationError on failure
        update = ConfigUpdatePayload(**command.payload)

        from app.core.config_writer import apply_param_update
        await apply_param_update(
            db=db,
            param_code=update.param_code,
            value=update.value,
            opt_type=update.opt_type,
            changed_by=f"HQ:{command.command_id}",
        )
        logger.info(
            "UPDATE_CONFIG executed. command_id=%s param=%s confirmed_by=%s",
            command.command_id, update.param_code, command.confirmed_by_id,
        )
        return CommandResult(
            success=True,
            message=f"Parameter '{update.param_code}' updated.",
            data={"param_code": update.param_code},
        )
    except (ValueError, TypeError) as exc:
        logger.error(
            "UPDATE_CONFIG rejected (validation). command_id=%s error=%s",
            command.command_id, exc,
        )
        return CommandResult(success=False, message=f"Validation error: {exc}")
    except Exception as exc:
        logger.error("UPDATE_CONFIG failed. command_id=%s error=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))


async def _handle_system_reboot(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Initiate a full OS-level reboot.

    ── DESTRUCTIVE ───────────────────────────────────────────────
    This command will take the node offline. It requires:
      1. approval_required=True (policy-enforced)
      2. A valid confirmed_by_id (manager PIN verified by the frontend)
      3. The command must not be expired
    The handler itself does not re-verify PIN — that is the router's
    responsibility before calling execute_safe_handler().
    ──────────────────────────────────────────────────────────────
    """
    try:
        if not command.confirmed_by_id:
            raise PermissionError("SYSTEM_REBOOT requires confirmed_by_id. Execution blocked.")

        import subprocess  # noqa: S404
        logger.critical(
            "SYSTEM_REBOOT initiated. command_id=%s confirmed_by=%s",
            command.command_id, command.confirmed_by_id,
        )
        subprocess.run(  # noqa: S603
            ["sudo", "shutdown", "-r", "+1", "Smriti-OS HQ-directed reboot"],
            check=True, capture_output=True, text=True, timeout=10,
        )
        return CommandResult(
            success=True,
            message="Reboot scheduled in 1 minute. All sessions will be terminated.",
        )
    except PermissionError as exc:
        logger.error("SYSTEM_REBOOT blocked. command_id=%s reason=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))
    except Exception as exc:
        logger.error("SYSTEM_REBOOT failed. command_id=%s error=%s", command.command_id, exc)
        return CommandResult(success=False, message=str(exc))


# ─────────────────────────────────────────────────────────────
# HANDLER MAP  (the only dispatch table — keep it exhaustive)
# ─────────────────────────────────────────────────────────────

_HANDLER_MAP = {
    RemoteCommandType.FORCE_SYNC:      _handle_force_sync,
    RemoteCommandType.FLUSH_CACHE:     _handle_flush_cache,
    RemoteCommandType.RESTART_SERVICE: _handle_restart_service,
    RemoteCommandType.UPDATE_CONFIG:   _handle_update_config,
    RemoteCommandType.SYSTEM_REBOOT:   _handle_system_reboot,
}


# ─────────────────────────────────────────────────────────────
# PUBLIC ENTRY POINT
# ─────────────────────────────────────────────────────────────

async def execute_safe_handler(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Route a RemoteCommand to its registered handler.

    Pre-conditions (enforced here — router must also check):
      1. Command has not expired.
      2. If approval_required, confirmed_by_id must be set.
      3. command_type must exist in _HANDLER_MAP.

    The router is responsible for PIN verification BEFORE calling this.
    This function does not verify PINs — it only checks that confirmation
    metadata is present.
    """

    # Guard 1 — expiry
    if command.is_expired():
        logger.warning(
            "Command rejected: expired. command_id=%s type=%s expired_at=%s",
            command.command_id, command.command_type, command.expires_at,
        )
        return CommandResult(
            success=False,
            message=f"Command {command.command_id} has expired and cannot be executed.",
        )

    # Guard 2 — approval gate
    if command.requires_approval and not command.confirmed_by_id:
        logger.warning(
            "Command rejected: approval required but not confirmed. command_id=%s type=%s",
            command.command_id, command.command_type,
        )
        return CommandResult(
            success=False,
            message=(
                f"Command '{command.command_type}' requires manager approval. "
                "Set confirmed_by_id before calling execute_safe_handler."
            ),
        )

    # Guard 3 — unknown type (should not happen if Pydantic validation ran)
    handler = _HANDLER_MAP.get(command.command_type)
    if handler is None:
        logger.error(
            "Command rejected: no handler registered. command_id=%s type=%s",
            command.command_id, command.command_type,
        )
        return CommandResult(
            success=False,
            message=f"No handler registered for command type '{command.command_type}'.",
        )

    return await handler(command, db)
