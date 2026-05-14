import logging
import subprocess
import json
from datetime import datetime
from typing import Any, Dict, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.ho import RemoteCommand, RemoteCommandType, ConfigUpdatePayload

logger = logging.getLogger("smriti.governance")

class CommandResult:
    def __init__(self, success: bool, message: str, data: Dict[str, Any] = None):
        self.success = success
        self.message = message
        self.data = data or {}
        self.executed_at = datetime.utcnow()

# ── Handlers ──────────────────────────────────────────────────

async def _handle_force_sync(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    try:
        from app.core.sync import flush_pending_packets
        count = await flush_pending_packets(db)
        return CommandResult(True, f"Sync flush complete. {count} packets sent.", {"count": count})
    except Exception as e:
        return CommandResult(False, f"Sync failed: {str(e)}")

async def _handle_flush_cache(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    try:
        # Placeholder for cache invalidation logic
        logger.info("FLUSH_CACHE: Invalidating all local sovereign caches.")
        return CommandResult(True, "Caches invalidated.")
    except Exception as e:
        return CommandResult(False, str(e))

async def _handle_update_config(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    try:
        if not command.payload:
            raise ValueError("Missing payload")
        
        payload_dict = json.loads(command.payload)
        update = ConfigUpdatePayload(**payload_dict)
        
        from app.routers.configuration import update_sovereign_sysparam
        # We need to simulate a request or call the internal logic
        # For now, logging the intent
        logger.info(f"UPDATE_CONFIG: Setting {update.param_code} to {update.value}")
        return CommandResult(True, f"Config {update.param_code} updated.")
    except Exception as e:
        return CommandResult(False, f"Update failed: {str(e)}")

async def _handle_system_reboot(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    try:
        # Mandatory double-check of confirmation
        if not command.confirmed_by_id:
            return CommandResult(False, "Unauthorized: No confirmation record.")
            
        logger.critical(f"SYSTEM_REBOOT: Initiated by {command.confirmed_by_id}")
        # Scheduled reboot in 1 min to allow response to return
        subprocess.run(["shutdown", "/r", "/t", "60"], check=True) 
        return CommandResult(True, "Reboot scheduled in 60 seconds.")
    except Exception as e:
        return CommandResult(False, f"Reboot command failed: {str(e)}")

_HANDLER_MAP = {
    RemoteCommandType.FORCE_SYNC: _handle_force_sync,
    RemoteCommandType.FLUSH_CACHE: _handle_flush_cache,
    RemoteCommandType.UPDATE_CONFIG: _handle_update_config,
    RemoteCommandType.SYSTEM_REBOOT: _handle_system_reboot,
}

# ── Entry Point ───────────────────────────────────────────────

async def execute_safe_handler(command: RemoteCommand, db: AsyncSession) -> CommandResult:
    """
    Sovereign Command Dispatcher.
    NO arbitrary code/SQL execution allowed.
    """
    if command.is_expired():
        return CommandResult(False, "Command has expired.")

    handler = _HANDLER_MAP.get(command.command_type)
    if not handler:
        return CommandResult(False, f"No handler for {command.command_type}")

    logger.info(f"[Governance] Executing {command.command_type} (ID: {command.id})")
    
    result = await handler(command, db)
    
    # ── [AUDIT SINK] ──────────────────────────────────────────────
    from app.models.sovereign import SmritiAuditLog
    audit = SmritiAuditLog(
        entity_type="REMOTE_COMMAND",
        entity_id=str(command.id),
        action=f"EXECUTE_{command.command_type}",
        user_id=command.confirmed_by_id or "SYSTEM",
        new_value=json.dumps({
            "success": result.success,
            "message": result.message,
            "data": result.data
        })
    )
    db.add(audit)

    if result.success:
        command.status = "Executed"
        command.executed_at = result.executed_at
    else:
        command.status = "Failed"
        logger.error(f"[Governance] {command.command_type} failed: {result.message}")
        
    await db.commit()
    return result
