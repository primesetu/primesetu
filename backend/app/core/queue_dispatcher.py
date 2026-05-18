import json
import sqlite3
import os

# [FIX] Lazy import — Celery/Redis connection is NOT available in LOCAL_POSTGRES mode.
# Importing celery_app at module level would attempt a Redis connection on every startup,
# causing startup delays and potential pool exhaustion in offline deployments.
try:
    from celery.exceptions import CeleryError
    from kombu.exceptions import OperationalError
    from app.core.celery_app import celery_app
    _CELERY_AVAILABLE = True
except Exception:
    _CELERY_AVAILABLE = False
    celery_app = None
    CeleryError = Exception
    OperationalError = Exception

from app.core.logging import logger

OUTBOX_DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "outbox.sqlite3")

def init_outbox_db():
    with sqlite3.connect(OUTBOX_DB_PATH) as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS celery_outbox (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_name TEXT NOT NULL,
                queue_name TEXT NOT NULL,
                routing_key TEXT NOT NULL,
                payload_json TEXT NOT NULL,
                status TEXT DEFAULT 'PENDING',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

init_outbox_db()

def dispatch_task(task_name: str, queue_name: str, routing_key: str, payload: dict, use_outbox: bool = False):
    """
    [R4] Safe Task Dispatcher
    Wraps apply_async with explicit governance limits and optional SQLite outbox fallback.
    """
    # Enforce R4 additions
    payload['task_version'] = payload.get('task_version', '1.0')
    
    if 'idempotency_key' not in payload:
        logger.warning("task_dispatch_missing_idempotency_key", task=task_name)
    
    try:
        celery_app.send_task(
            task_name,
            kwargs=payload,
            queue=queue_name,
            routing_key=routing_key
        )
        logger.info("task_dispatched_to_redis", task=task_name, queue=queue_name)
    except (OperationalError, ConnectionError, CeleryError) as e:
        logger.error("redis_connection_failed", error=str(e), task=task_name)
        
        if use_outbox:
            logger.warning("writing_task_to_sqlite_outbox", task=task_name)
            with sqlite3.connect(OUTBOX_DB_PATH) as conn:
                conn.execute(
                    "INSERT INTO celery_outbox (task_name, queue_name, routing_key, payload_json) VALUES (?, ?, ?, ?)",
                    (task_name, queue_name, routing_key, json.dumps(payload))
                )
                conn.commit()
        else:
            logger.warning("task_dropped_no_outbox_fallback", task=task_name)
