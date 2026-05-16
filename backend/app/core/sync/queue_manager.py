# ============================================================
# SMRITI-OS — Sovereign Sync Queue Manager
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Infrastructure: Sync Queue Logic (v1.2)
# ============================================================

import logging
from typing import Dict, Any, Optional
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.observability.logger import logger

class QueueManager:
    """
    Sovereign Sync Queue Manager.
    Handles the append-only local persistence of sync packets.
    """
    
    @staticmethod
    async def enqueue(
        db: AsyncSession,
        table_name: str,
        operation: str,
        record: Dict[str, Any],
        pk_column: str = "id",
        idempotency_key: Optional[str] = None,
        tag: str = "DEFAULT"
    ) -> int:
        """
        Append-only enqueue operation.
        Writes a packet into the smriti_sync_queue for background replay.
        """
        query = text("""
            INSERT INTO shoper9.smriti_sync_queue (
                endpoint, method, payload, status, created_at, attempts, tag, idempotency_key
            ) VALUES (
                :endpoint, :method, :payload, 'pending', NOW(), 0, :tag, :idempotency_key
            ) RETURNING id
        """)
        
        # Method mapping: INSERT/UPDATE -> POST (Supabase Upsert)
        method = "POST" 
        if operation == "DELETE":
            method = "DELETE"
            
        result = await db.execute(query, {
            "endpoint": table_name,
            "method": method,
            "payload": record,
            "tag": tag,
            "idempotency_key": idempotency_key
        })
        
        queue_id = result.scalar()
        
        logger.log('INFO', f"Sync packet enqueued: {operation} -> {table_name}", {
            "module": "SYNC",
            "workflow": "SYNC_RUNTIME",
            "queue_id": queue_id,
            "table": table_name
        })
        
        return queue_id
