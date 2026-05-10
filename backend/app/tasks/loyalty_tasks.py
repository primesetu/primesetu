import asyncio
from app.core.celery_app import celery_app
from app.core.database import get_db_session
from app.services.loyalty_engine import LoyaltyEngine

@celery_app.task(name="app.tasks.loyalty_tasks.run_tier_upgrade_batch")
def run_tier_upgrade_batch():
    """
    Nightly Celery worker task to upgrade customer loyalty tiers.
    """
    async def _run():
        async with get_db_session() as db:
            result = await LoyaltyEngine.run_tier_upgrade_batch(db)
            return result
            
    result = asyncio.run(_run())
    return result
