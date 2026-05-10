from app.core.celery_app import celery_app
from app.services.tally_sync import run_tally_sync as service_run_tally_sync

@celery_app.task(name="app.tasks.tally_sync.run_tally_sync")
def run_tally_sync():
    """
    Celery task to run the Tally Sync batch process.
    """
    service_run_tally_sync()
