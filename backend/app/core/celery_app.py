import os
from celery import Celery
from celery.schedules import crontab

from kombu import Queue, Exchange
from celery.signals import worker_process_init, task_prerun, task_postrun
import structlog
from app.core.config import settings

# Configure Celery
celery_app = Celery(
    "smritios_worker",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
)

default_exchange = Exchange('default', type='direct')

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    
    # [R4] Queue Topology & Isolation
    task_queues=(
        Queue('q_billing_critical', default_exchange, routing_key='billing.#', queue_arguments={'x-max-priority': 10}),
        Queue('q_sync_delta', default_exchange, routing_key='sync.#', queue_arguments={'x-max-priority': 5}),
        Queue('q_omnichannel', default_exchange, routing_key='omnichannel.#'),
        Queue('q_notifications', default_exchange, routing_key='notifications.#'),
        Queue('dlq_smriti_unresolved', default_exchange, routing_key='dlq')
    ),
    task_default_queue='q_notifications',
    task_default_exchange='default',
    task_default_routing_key='notifications.default',

    # [R4] Timeout Governance
    task_soft_time_limit=60,
    task_time_limit=120,

    # [R4] Operational Guarantees
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=100,
    # Configure beat schedule
    beat_schedule={
        "daily-tier-upgrade": {
            "task": "app.tasks.loyalty_tasks.run_tier_upgrade_batch",
            "schedule": crontab(hour=2, minute=0), # Run every night at 2:00 AM
            "options": {"queue": "q_billing_critical"}
        },
        "tally-sync": {
            "task": "app.tasks.tally_sync.run_tally_sync",
            "schedule": crontab(minute="*/5"), # Run every 5 minutes
            "options": {"queue": "q_sync_delta"}
        }
    }
)

@worker_process_init.connect
def init_worker_db_pool(**kwargs):
    """
    [R4] Worker DB Pool Isolation
    Creates a completely separate connection pool for Celery workers
    to prevent starvation of synchronous FastAPI requests.
    """
    from sqlalchemy.ext.asyncio import create_async_engine
    global worker_engine
    
    worker_engine = create_async_engine(
        settings.local_database_url,
        echo=False,
        pool_size=5,       
        max_overflow=10,
        pool_pre_ping=True,
    )
    
    log = structlog.get_logger()
    log.info("worker_db_pool_initialized", node_id=settings.node_id)

@task_prerun.connect
def bind_task_telemetry(task_id, task, args, kwargs, **kw):
    """
    [R4] Inject task context and node_id into structlog.
    """
    correlation_id = kwargs.get("correlation_id", "system-task")
    task_version = kwargs.get("task_version", "1.0")
    
    structlog.contextvars.bind_contextvars(
        request_id=correlation_id,
        task_id=task_id,
        task_name=task.name,
        task_version=task_version,
        node_id=settings.node_id
    )

@task_postrun.connect
def unbind_task_telemetry(**kw):
    structlog.contextvars.clear_contextvars()
