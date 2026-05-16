# ============================================================
# SMRITI-OS — Operational Event Contracts
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Distributed Event Schemas (v1.2)
# ============================================================

import uuid
from enum import Enum
from datetime import datetime
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

class EventType(str, Enum):
    BILL_CREATED = "BILL_CREATED"
    PAYMENT_SETTLED = "PAYMENT_SETTLED"
    PAYMENT_FAILED = "PAYMENT_FAILED"
    STOCK_RESERVED = "STOCK_RESERVED"
    STOCK_DEDUCTED = "STOCK_DEDUCTED"
    BILL_CANCELLED = "BILL_CANCELLED"
    SYNC_REPLAY_STARTED = "SYNC_REPLAY_STARTED"
    SYNC_REPLAY_COMPLETED = "SYNC_REPLAY_COMPLETED"
    QUEUE_RETRY_SCHEDULED = "QUEUE_RETRY_SCHEDULED"
    RECONCILIATION_REQUIRED = "RECONCILIATION_REQUIRED"

class OperationalEvent(BaseModel):
    """
    Authoritative Operational Event Contract.
    Enforces deterministic metadata for distributed tracing.
    """
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: EventType
    correlation_id: str  # Transaction ID or Workflow ID
    node_id: str         # Originating Retail Node
    cashier_code: str    # Originating Operator
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    payload: Dict[str, Any]
    metadata: Dict[str, Any] = Field(default_factory=dict)
    idempotency_key: Optional[str] = None

    class Config:
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }
