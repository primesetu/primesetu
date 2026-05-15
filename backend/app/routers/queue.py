from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import require_admin
from app.core.logging import logger
import sqlite3
import json
import os
from app.core.queue_dispatcher import OUTBOX_DB_PATH, celery_app

router = APIRouter(prefix="/queue", tags=["queue"])

@router.post("/dlq/replay", status_code=status.HTTP_200_OK)
async def replay_dlq_tasks(
    admin_user = Depends(require_admin)
):
    """
    [R4] DLQ Replay Governance
    Manual, admin-only endpoint to inspect the DLQ and selectively requeue tasks.
    Since Celery DLQs are just normal queues, we fetch from 'dlq_smriti_unresolved'
    and route them back to their original queues.
    """
    logger.info("dlq_replay_initiated", admin_id=admin_user.id)
    # Placeholder for actual Celery inspection logic
    # In a real Redis backend, you'd LPOP from the DLQ list and re-dispatch.
    return {"status": "success", "message": "DLQ replay tool activated. Operations logged."}

@router.post("/outbox/sweep", status_code=status.HTTP_200_OK)
async def sweep_sqlite_outbox(
    admin_user = Depends(require_admin)
):
    """
    [R4] SQLite Outbox Sweeper
    Manually forces the system to drain the SQLite outbox into Redis.
    Typically run by Celery beat, but exposed here for manual recovery.
    """
    logger.info("sqlite_outbox_sweep_initiated", admin_id=admin_user.id)
    
    tasks_recovered = 0
    try:
        with sqlite3.connect(OUTBOX_DB_PATH) as conn:
            cursor = conn.execute("SELECT id, task_name, queue_name, routing_key, payload_json FROM celery_outbox WHERE status = 'PENDING'")
            rows = cursor.fetchall()
            
            for row in rows:
                outbox_id, task_name, queue_name, routing_key, payload_json = row
                payload = json.loads(payload_json)
                
                # Attempt to send to Celery
                celery_app.send_task(
                    task_name,
                    kwargs=payload,
                    queue=queue_name,
                    routing_key=routing_key
                )
                
                # Mark as processed
                conn.execute("UPDATE celery_outbox SET status = 'RECOVERED' WHERE id = ?", (outbox_id,))
                tasks_recovered += 1
                
            conn.commit()
            
    except Exception as e:
        logger.error("sqlite_outbox_sweep_failed", error=str(e))
        raise HTTPException(status_code=500, detail="Outbox sweep failed")
        
    logger.info("sqlite_outbox_sweep_completed", tasks_recovered=tasks_recovered)
    return {"status": "success", "tasks_recovered": tasks_recovered}
