# ============================================================
# SMRITI-OS — Sovereign Replay Engine
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Sync Replay Logic (v1.2)
# ============================================================

import asyncio
from typing import List, Dict, Any
from sqlalchemy import text, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.sync.retry_policy import RetryPolicy
from app.core.observability.logger import logger

class ReplayEngine:
    """
    Sovereign Replay Engine.
    Orchestrates the deterministic cloud-side flush loop.
    """
    
    @staticmethod
    async def get_runnable_packets(db: AsyncSession, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetches PENDING or RETRY_SCHEDULED packets using SKIP LOCKED.
        Ensures exactly-once delivery across concurrent replay loops.
        """
        query = text("""
            SELECT id, endpoint, method, payload, attempts, idempotency_key
            FROM shoper9.smriti_sync_queue
            WHERE status IN ('pending', 'retry_scheduled')
            AND (next_retry_at IS NULL OR next_retry_at <= NOW())
            ORDER BY id ASC
            LIMIT :limit
            FOR UPDATE SKIP LOCKED
        """)
        
        result = await db.execute(query, {"limit": limit})
        return [dict(row._mapping) for row in result]

    @staticmethod
    async def mark_success(db: AsyncSession, packet_id: int):
        """Marks a packet as successfully synchronized."""
        await db.execute(
            text("UPDATE shoper9.smriti_sync_queue SET status = 'done', synced_at = NOW() WHERE id = :id"),
            {"id": packet_id}
        )

    @staticmethod
    async def mark_failure(db: AsyncSession, packet_id: int, attempts: int, error: str):
        """Processes a failure and schedules a retry or DLQ isolation."""
        if RetryPolicy.is_dead_letter(attempts + 1):
            status = 'dead_letter'
            next_retry = None
        else:
            status = 'retry_scheduled'
            next_retry = RetryPolicy.get_next_retry_time(attempts + 1)
            
        await db.execute(
            text("""
                UPDATE shoper9.smriti_sync_queue 
                SET status = :status, 
                    attempts = attempts + 1, 
                    last_error = :error,
                    next_retry_at = :next_retry
                WHERE id = :id
            """),
            {
                "id": packet_id,
                "status": status,
                "error": error[:500],
                "next_retry": next_retry
            }
        )
        
        logger.log('WARN' if status == 'retry_scheduled' else 'ERROR', 
                   f"Sync packet failure: ID {packet_id} ({status})", {
            "module": "SYNC",
            "workflow": "REPLAY_ENGINE",
            "packet_id": packet_id,
            "status": status,
            "error": error
        })
