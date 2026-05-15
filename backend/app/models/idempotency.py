# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
models/idempotency.py — Billing idempotency registry

[R2] Stores per-store idempotency keys for billing finalize operations.
Unique constraint on (store_id, key) prevents cross-store key collisions.

This table is written INSIDE the billing transaction (`async with db.begin()`).
If the transaction rolls back, the key is NOT recorded — allowing safe retry.
If the transaction commits, the key IS recorded — replay returns the stored bill.

Cleanup: rows expire after 24 hours. A scheduled cleanup job should run:
    DELETE FROM smriti_idempotency WHERE expires_at < NOW()
"""

import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SmritiIdempotency(Base):
    __tablename__ = "smriti_idempotency"
    __table_args__ = (
        # Uniqueness is per-store: same key from different stores is allowed.
        UniqueConstraint("store_id", "key", name="uq_idempotency_store_key"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, server_default=text("gen_random_uuid()")
    )
    # The client-supplied idempotency key (UUID4 generated per billing attempt).
    key: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    store_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    # The transaction that was committed for this key.
    transaction_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    bill_no: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now()")
    )
    # Keys expire after 24 hours — safe retry window for network retries.
    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=text("now() + INTERVAL '24 hours'")
    )
