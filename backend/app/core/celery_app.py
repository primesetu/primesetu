import os
from celery import Celery
from celery.schedules import crontab

# Configure Celery
celery_app = Celery(
    "smritios_worker",
    broker=os.environ.get("CELERY_BROKER_URL", "redis://localhost:6379/0"),
    backend=os.environ.get("CELERY_RESULT_BACKEND", "redis://localhost:6379/0")
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    # Configure beat schedule
    beat_schedule={
        "daily-tier-upgrade": {
            "task": "app.tasks.loyalty_tasks.run_tier_upgrade_batch",
            "schedule": crontab(hour=2, minute=0), # Run every night at 2:00 AM
        },
        "tally-sync": {
            "task": "app.tasks.tally_sync.run_tally_sync",
            "schedule": crontab(minute="*/5"), # Run every 5 minutes
        }
    }
)
