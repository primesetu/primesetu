"""
ho.py — Head Office Governance Models
Part of: Smriti-OS Sovereign Connectivity Hub, Phase 5
"""

from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, model_validator


# ─────────────────────────────────────────────────────────────
# COMMAND TYPES
# ─────────────────────────────────────────────────────────────

class RemoteCommandType(str, enum.Enum):
    """
    Exhaustive list of commands HQ may issue to a sovereign node.

    ── GOVERNANCE RULE ──────────────────────────────────────────
    SQL execution is PERMANENTLY DEPRECATED and will never be
    re-introduced. All data operations MUST use typed handlers
    in governance.py. Any PR that adds an `SQL` variant here
    will be rejected at review.
    ─────────────────────────────────────────────────────────────
    """
    FORCE_SYNC      = "FORCE_SYNC"       # Flush pending sync packets immediately
    FLUSH_CACHE     = "FLUSH_CACHE"      # Invalidate local application caches
    RESTART_SERVICE = "RESTART_SERVICE"  # Graceful service restart (non-destructive)
    UPDATE_CONFIG   = "UPDATE_CONFIG"    # Set a specific SmritiParam (scoped, auditable)
    SYSTEM_REBOOT   = "SYSTEM_REBOOT"    # Full OS-level reboot (destructive)


# ─────────────────────────────────────────────────────────────
# NODE-SIDE POLICY  (HQ cannot override these)
# ─────────────────────────────────────────────────────────────

# These are authoritative at the NODE. Even if HQ sends a command
# packet with different flags, the node enforces its own policy.
_COMMAND_POLICY: Dict[RemoteCommandType, Dict[str, Any]] = {
    RemoteCommandType.FORCE_SYNC: {
        "is_destructive":    False,
        "approval_required": False,
        "confirmation_ttl_seconds": None,
    },
    RemoteCommandType.FLUSH_CACHE: {
        "is_destructive":    False,
        "approval_required": False,
        "confirmation_ttl_seconds": None,
    },
    RemoteCommandType.RESTART_SERVICE: {
        "is_destructive":    False,
        "approval_required": True,
        "confirmation_ttl_seconds": 300,   # 5-minute window
    },
    RemoteCommandType.UPDATE_CONFIG: {
        "is_destructive":    False,
        "approval_required": True,
        "confirmation_ttl_seconds": 300,
    },
    RemoteCommandType.SYSTEM_REBOOT: {
        "is_destructive":    True,
        "approval_required": True,
        "confirmation_ttl_seconds": 300,
    },
}


def get_command_policy(cmd_type: RemoteCommandType) -> Dict[str, Any]:
    """Return the node-enforced policy for a given command type."""
    return _COMMAND_POLICY[cmd_type]


# ─────────────────────────────────────────────────────────────
# UPDATE_CONFIG PAYLOAD  (scoped — not a generic config blob)
# ─────────────────────────────────────────────────────────────

class ConfigUpdatePayload(BaseModel):
    """
    Payload for UPDATE_CONFIG commands.

    HQ may only update a single, named SmritiParam per command.
    Bulk updates require multiple commands, each independently auditable.
    Currency values must be submitted as paise (integer). The node
    will reject float values for opt_type='C'.
    """
    param_code: str = Field(..., min_length=1, max_length=64)
    value:      Any = Field(...)
    opt_type:   str = Field(..., pattern=r"^[BCIS]$")  # Boolean/Currency/Integer/String

    @model_validator(mode="after")
    def validate_currency_is_integer_paise(self) -> "ConfigUpdatePayload":
        if self.opt_type == "C":
            if not isinstance(self.value, int):
                raise ValueError(
                    f"Currency param '{self.param_code}' must be submitted as integer paise. "
                    f"Received {type(self.value).__name__}: {self.value!r}. "
                    "Multiply by 100 and round before sending."
                )
        return self


# ─────────────────────────────────────────────────────────────
# REMOTE COMMAND MODEL
# ─────────────────────────────────────────────────────────────

class RemoteCommand(BaseModel):
    """
    A governance command issued by HQ and received during a pulse response.

    ── SECURITY NOTE ─────────────────────────────────────────────
    `is_destructive` and `approval_required` are intentionally
    EXCLUDED from this model. They are determined exclusively by
    node-side policy (_COMMAND_POLICY) and cannot be influenced
    by the HQ payload. Use `get_command_policy(command_type)` to
    read these flags.
    ──────────────────────────────────────────────────────────────
    """
    command_id:   str               = Field(..., description="Globally unique command ID from HQ")
    command_type: RemoteCommandType = Field(..., description="Typed enum — SQL not accepted")
    payload:      Optional[Dict[str, Any]] = Field(
        default=None,
        description="Type-specific payload. For UPDATE_CONFIG, must conform to ConfigUpdatePayload."
    )
    issued_at:    datetime          = Field(..., description="UTC timestamp from HQ")
    expires_at:   Optional[datetime] = Field(
        default=None,
        description="If set, node must reject execution after this time."
    )

    # ── Confirmation tracking (node-populated, not HQ-supplied) ──
    confirmed_by_id:  Optional[str]      = Field(default=None)
    confirmed_at:     Optional[datetime] = Field(default=None)
    execution_status: Optional[str]      = Field(default=None)  # pending|confirmed|executed|expired|failed

    @property
    def policy(self) -> Dict[str, Any]:
        return get_command_policy(self.command_type)

    @property
    def requires_approval(self) -> bool:
        return self.policy["approval_required"]

    @property
    def is_destructive(self) -> bool:
        return self.policy["is_destructive"]

    @property
    def confirmation_ttl(self) -> Optional[int]:
        return self.policy["confirmation_ttl_seconds"]

    def is_expired(self) -> bool:
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return True
        return False


# ─────────────────────────────────────────────────────────────
# PULSE REQUEST / RESPONSE
# ─────────────────────────────────────────────────────────────

class NodeHealthTelemetry(BaseModel):
    """Enriched node health snapshot sent with every pulse."""
    disk_free_gb:        float
    db_latency_ms:       float
    active_till_count:   int
    pending_sync_count:  int


class PulseRequest(BaseModel):
    node_id:           str
    transaction_count: int
    last_sync_id:      str
    health:            NodeHealthTelemetry


class PulseResponse(BaseModel):
    server_time:  datetime
    commands:     List[RemoteCommand] = Field(default_factory=list)
    sync_required: bool = False
