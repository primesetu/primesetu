import asyncio
from app.core.celery_app import celery_app
from app.core.logging import logger

@celery_app.task(name="app.tasks.notification_tasks.send_whatsapp_receipt", bind=True, max_retries=2)
def send_whatsapp_receipt(self, mobile: str, bill_no: str, store_name: str, total_rs: float, points_earned: int, points_balance: int, idempotency_key: str, task_version: str = "1.0"):
    """
    [R4] Low Priority Task: WhatsApp Receipt.
    Runs on worker_notifications.
    """
    logger.info("task_whatsapp_receipt_started", bill_no=bill_no, mobile=mobile)
    
    async def _send():
        from app.services.whatsapp_gateway import get_gateway
        gw = get_gateway()
        await gw.send_bill_receipt(
            mobile=mobile,
            bill_no=bill_no,
            store_name=store_name,
            total_rs=total_rs,
            points_earned=points_earned,
            points_balance=points_balance
        )
            
    try:
        asyncio.run(_send())
        logger.info("task_whatsapp_receipt_completed", bill_no=bill_no)
    except Exception as exc:
        logger.warning("task_whatsapp_receipt_failed", bill_no=bill_no, error=str(exc))
        # Limited retries for notifications
        raise self.retry(exc=exc, countdown=10)

@celery_app.task(name="app.tasks.notification_tasks.send_whatsapp_tier_upgrade", bind=True, max_retries=2)
def send_whatsapp_tier_upgrade(self, mobile: str, customer_name: str, old_tier: str, new_tier: str, store_name: str, idempotency_key: str, task_version: str = "1.0"):
    logger.info("task_whatsapp_tier_upgrade_started", mobile=mobile, new_tier=new_tier)
    
    async def _send():
        from app.services.whatsapp_gateway import get_gateway
        gw = get_gateway()
        await gw.send_tier_upgrade(
            mobile=mobile,
            customer_name=customer_name,
            old_tier=old_tier,
            new_tier=new_tier,
            store_name=store_name
        )
            
    try:
        asyncio.run(_send())
        logger.info("task_whatsapp_tier_upgrade_completed", mobile=mobile)
    except Exception as exc:
        logger.warning("task_whatsapp_tier_upgrade_failed", mobile=mobile, error=str(exc))
        raise self.retry(exc=exc, countdown=10)
