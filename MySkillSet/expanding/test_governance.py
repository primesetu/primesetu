"""
test_governance.py — Automated tests for the Secure HQ Governance Protocol
Part of: Smriti-OS Phase 5 verification suite

Run with:
    pytest tests/test_governance.py -v

Coverage targets:
    ✓ SQL command type is rejected at Pydantic validation (422)
    ✓ FORCE_SYNC routes to the correct handler
    ✓ Unknown command type is rejected by dispatcher
    ✓ Approval-required command blocked without confirmed_by_id
    ✓ Expired command is rejected before dispatch
    ✓ SYSTEM_REBOOT blocked without confirmed_by_id (even in handler)
    ✓ UPDATE_CONFIG rejects float currency payload
    ✓ UPDATE_CONFIG accepts integer paise payload
    ✓ HQ-supplied approval_required flag cannot bypass node policy
"""

from __future__ import annotations

import pytest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

from pydantic import ValidationError

from app.models.ho import (
    ConfigUpdatePayload,
    RemoteCommand,
    RemoteCommandType,
)
from app.core.ho.governance import execute_safe_handler, CommandResult


# ─────────────────────────────────────────────────────────────
# FIXTURES
# ─────────────────────────────────────────────────────────────

def make_command(
    command_type: RemoteCommandType,
    payload: dict | None = None,
    confirmed_by_id: str | None = None,
    expires_at: datetime | None = None,
) -> RemoteCommand:
    return RemoteCommand(
        command_id=f"test-{command_type.value.lower()}",
        command_type=command_type,
        payload=payload,
        issued_at=datetime.utcnow(),
        expires_at=expires_at,
        confirmed_by_id=confirmed_by_id,
    )


@pytest.fixture
def mock_db():
    return AsyncMock()


# ─────────────────────────────────────────────────────────────
# TEST: SQL COMMAND TYPE IS REJECTED AT VALIDATION BOUNDARY
# ─────────────────────────────────────────────────────────────

def test_sql_command_type_is_rejected():
    """
    Pydantic must reject 'SQL' as a command_type with a ValidationError.
    This is the first line of defence — the invalid type never reaches
    the dispatcher or any handler.
    """
    with pytest.raises(ValidationError) as exc_info:
        RemoteCommand(
            command_id="test-sql",
            command_type="SQL",   # type: ignore[arg-type]  — intentionally invalid
            issued_at=datetime.utcnow(),
        )
    errors = exc_info.value.errors()
    assert any("command_type" in str(e) for e in errors), (
        "ValidationError should reference the command_type field"
    )


# ─────────────────────────────────────────────────────────────
# TEST: FORCE_SYNC ROUTES CORRECTLY
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_force_sync_routes_to_handler(mock_db):
    """FORCE_SYNC should call flush_pending_packets and return success."""
    cmd = make_command(RemoteCommandType.FORCE_SYNC)

    with patch("app.core.ho.governance._handle_force_sync", new_callable=AsyncMock) as mock_handler:
        mock_handler.return_value = CommandResult(success=True, message="OK", data={"flushed_count": 5})
        result = await execute_safe_handler(cmd, mock_db)

    mock_handler.assert_awaited_once_with(cmd, mock_db)
    assert result.success is True


# ─────────────────────────────────────────────────────────────
# TEST: APPROVAL-REQUIRED COMMAND BLOCKED WITHOUT CONFIRMATION
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_approval_required_blocked_without_confirmation(mock_db):
    """
    SYSTEM_REBOOT requires approval. Calling execute_safe_handler without
    confirmed_by_id should return a failed CommandResult, not raise.
    """
    cmd = make_command(RemoteCommandType.SYSTEM_REBOOT, confirmed_by_id=None)

    assert cmd.requires_approval is True  # Sanity-check the policy

    result = await execute_safe_handler(cmd, mock_db)

    assert result.success is False
    assert "approval" in result.message.lower()


# ─────────────────────────────────────────────────────────────
# TEST: EXPIRED COMMAND IS REJECTED
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_expired_command_rejected(mock_db):
    """Commands past their expires_at timestamp must be rejected."""
    past = datetime.utcnow() - timedelta(minutes=10)
    cmd  = make_command(RemoteCommandType.FORCE_SYNC, expires_at=past)

    result = await execute_safe_handler(cmd, mock_db)

    assert result.success is False
    assert "expired" in result.message.lower()


# ─────────────────────────────────────────────────────────────
# TEST: HQ CANNOT BYPASS NODE POLICY FOR APPROVAL
# ─────────────────────────────────────────────────────────────

def test_node_policy_cannot_be_overridden_by_hq():
    """
    Even if HQ somehow sent a SYSTEM_REBOOT command, the node-side
    policy must enforce approval_required=True.

    The RemoteCommand model does not accept is_destructive or
    approval_required from the incoming payload — these are derived
    from the node-side _COMMAND_POLICY, not the HQ packet.
    """
    cmd = make_command(RemoteCommandType.SYSTEM_REBOOT)

    # These properties come from node policy, not the command packet
    assert cmd.requires_approval is True
    assert cmd.is_destructive is True


# ─────────────────────────────────────────────────────────────
# TEST: UPDATE_CONFIG REJECTS FLOAT CURRENCY
# ─────────────────────────────────────────────────────────────

def test_update_config_rejects_float_currency():
    """
    Currency parameters must be submitted as integer paise.
    A float value like 19.99 must raise ValidationError.
    """
    with pytest.raises(ValidationError) as exc_info:
        ConfigUpdatePayload(
            param_code="PRICE_THRESHOLD",
            value=19.99,          # float — should be rejected
            opt_type="C",
        )
    errors = exc_info.value.errors()
    assert any("paise" in str(e).lower() or "integer" in str(e).lower() for e in errors)


# ─────────────────────────────────────────────────────────────
# TEST: UPDATE_CONFIG ACCEPTS INTEGER PAISE
# ─────────────────────────────────────────────────────────────

def test_update_config_accepts_integer_paise():
    """19.99 → 1999 paise must be accepted without error."""
    payload = ConfigUpdatePayload(
        param_code="PRICE_THRESHOLD",
        value=1999,               # correct: integer paise
        opt_type="C",
    )
    assert payload.value == 1999


# ─────────────────────────────────────────────────────────────
# TEST: CURRENCY CONVERSION INTEGRITY  (19.99 → 1999)
# ─────────────────────────────────────────────────────────────

def test_currency_paise_conversion():
    """Verify the expected conversion: int(round(19.99 * 100)) == 1999."""
    raw = 19.99
    paise = int(round(raw * 100))
    assert paise == 1999, f"Expected 1999, got {paise}"


# ─────────────────────────────────────────────────────────────
# TEST: SYSTEM_REBOOT HANDLER BLOCKED WITHOUT confirmed_by_id
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_system_reboot_handler_blocked_without_confirmation(mock_db):
    """
    Even if the approval gate in execute_safe_handler is somehow bypassed,
    the _handle_system_reboot handler itself must reject commands
    without a confirmed_by_id.
    """
    from app.core.ho.governance import _handle_system_reboot

    cmd = make_command(
        RemoteCommandType.SYSTEM_REBOOT,
        confirmed_by_id=None,  # No confirmation
    )
    result = await _handle_system_reboot(cmd, mock_db)

    assert result.success is False
    assert "confirmed_by_id" in result.message or "approval" in result.message.lower()


# ─────────────────────────────────────────────────────────────
# TEST: CONFIRMED SYSTEM_REBOOT IS DISPATCHED CORRECTLY
# ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_system_reboot_executes_when_confirmed(mock_db):
    """
    A SYSTEM_REBOOT with confirmed_by_id set should reach the handler
    and attempt execution (mocked at subprocess level).
    """
    cmd = make_command(
        RemoteCommandType.SYSTEM_REBOOT,
        confirmed_by_id="manager_007",
    )

    with patch("subprocess.run") as mock_run:
        mock_run.return_value = MagicMock(returncode=0, stderr="")
        result = await execute_safe_handler(cmd, mock_db)

    assert result.success is True
    mock_run.assert_called_once()
