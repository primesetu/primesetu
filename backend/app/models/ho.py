from __future__ import annotations
import enum
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, model_validator, ConfigDict
from sqlalchemy import String, Integer, DateTime, text, JSON, Boolean, Enum as SQLEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

# ─────────────────────────────────────────────────────────────
# COMMAND TYPES
# ─────────────────────────────────────────────────────────────

class RemoteCommandType(str, enum.Enum):
    """
    Exhaustive list of commands HQ may issue to a sovereign node.
    SQL execution is PERMANENTLY DEPRECATED.
    """
    FORCE_SYNC      = "FORCE_SYNC"
    FLUSH_CACHE     = "FLUSH_CACHE"
    RESTART_SERVICE = "RESTART_SERVICE"
    UPDATE_CONFIG   = "UPDATE_CONFIG"
    SYSTEM_REBOOT   = "SYSTEM_REBOOT"

# ─────────────────────────────────────────────────────────────
# NODE-SIDE POLICY  (Ground Truth)
# ─────────────────────────────────────────────────────────────

_COMMAND_POLICY: Dict[RemoteCommandType, Dict[str, Any]] = {
    RemoteCommandType.FORCE_SYNC: {
        "is_destructive": False,
        "approval_required": False,
        "ttl_seconds": 3600,
    },
    RemoteCommandType.FLUSH_CACHE: {
        "is_destructive": False,
        "approval_required": False,
        "ttl_seconds": 3600,
    },
    RemoteCommandType.RESTART_SERVICE: {
        "is_destructive": False,
        "approval_required": True,
        "ttl_seconds": 300,
    },
    RemoteCommandType.UPDATE_CONFIG: {
        "is_destructive": False,
        "approval_required": True,
        "ttl_seconds": 600,
    },
    RemoteCommandType.SYSTEM_REBOOT: {
        "is_destructive": True,
        "approval_required": True,
        "ttl_seconds": 300,
    },
}

# ─────────────────────────────────────────────────────────────
# SCHEMAS (Pydantic)
# ─────────────────────────────────────────────────────────────

class ConfigUpdatePayload(BaseModel):
    param_code: str = Field(..., min_length=1, max_length=64)
    value: Any = Field(...)
    opt_type: str = Field(..., pattern=r"^[BCIS]$")

    @model_validator(mode="after")
    def validate_currency(self) -> "ConfigUpdatePayload":
        if self.opt_type == "C" and not isinstance(self.value, int):
            raise ValueError(f"Currency {self.param_code} must be integer paise.")
        return self

# ─────────────────────────────────────────────────────────────
# DATABASE MODELS (SQLAlchemy)
# ─────────────────────────────────────────────────────────────

class SyncPacket(Base):
    __tablename__ = "sync_packets"
    id: Mapped[int] = mapped_column(primary_key=True)
    store_id: Mapped[str] = mapped_column(String, index=True)
    payload: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String, default="PENDING")
    synced_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))

class RemoteCommand(Base):
    __tablename__ = "remote_commands"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    store_id: Mapped[str] = mapped_column(String, index=True)
    command_type: Mapped[RemoteCommandType] = mapped_column(SQLEnum(RemoteCommandType), nullable=False)
    payload: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[str] = mapped_column(String, default="Pending")
    
    # Confirmation Tracking
    confirmed_by_id: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    confirmed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    
    executed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=text("now()"))
    expires_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    @property
    def policy(self) -> Dict[str, Any]:
        return _COMMAND_POLICY.get(self.command_type, {
            "is_destructive": True, "approval_required": True, "ttl_seconds": 60
        })

    @property
    def requires_approval(self) -> bool:
        return self.policy["approval_required"]

    @property
    def is_destructive(self) -> bool:
        return self.policy["is_destructive"]

    def is_expired(self) -> bool:
        if self.expires_at and datetime.utcnow() > self.expires_at:
            return True
        return False
