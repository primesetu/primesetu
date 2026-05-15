import asyncio
from app.core.celery_app import celery_app
from app.core.logging import logger

@celery_app.task(name="app.tasks.billing_tasks.accrue_loyalty", bind=True, max_retries=3)
def accrue_loyalty(self, store_id: str, partner_id: str, sale_id: str, net_amount_paise: int, idempotency_key: str, task_version: str = "1.0"):
    """
    [R4] Critical Billing Task: Accrue Loyalty Points.
    Runs on isolated worker_billing.
    """
    logger.info("task_accrue_loyalty_started", sale_id=sale_id, partner_id=partner_id)
    
    async def _run_accrual():
        # Import engine here to avoid circular imports during worker boot
        from app.core.celery_app import worker_engine
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.services.loyalty_engine import LoyaltyEngine
        
        async with AsyncSession(worker_engine) as session:
            return await LoyaltyEngine.accrue(
                db=session,
                store_id=store_id,
                partner_id=partner_id,
                sale_id=sale_id,
                net_amount_paise=net_amount_paise
            )
            
    try:
        loyalty_summary = asyncio.run(_run_accrual())
        logger.info("task_accrue_loyalty_completed", sale_id=sale_id, summary=loyalty_summary)
        
        # [R4] Trigger WhatsApp notification via dispatcher (Chaining equivalent)
        mobile = loyalty_summary.get("mobile")
        if mobile:
            from app.core.queue_dispatcher import dispatch_task
            
            # 2. Dispatch basic receipt
            dispatch_task(
                task_name="app.tasks.notification_tasks.send_whatsapp_receipt",
                queue_name="q_notifications",
                routing_key="notifications.whatsapp.receipt",
                payload={
                    "mobile": mobile,
                    "bill_no": "BILL", # Ideally pass this from parent, but simplified here
                    "store_name": store_id,
                    "total_rs": float(net_amount_paise) / 100,
                    "points_earned": loyalty_summary.get("earned", 0),
                    "points_balance": loyalty_summary.get("balance", 0),
                    "idempotency_key": idempotency_key + "_receipt",
                    "task_version": "1.0"
                },
                use_outbox=False # Rule: Notifications do not use outbox fallback
            )
            
            # 3. Dispatch Tier Upgrade if applicable
            if loyalty_summary.get("tier_upgraded"):
                dispatch_task(
                    task_name="app.tasks.notification_tasks.send_whatsapp_tier_upgrade",
                    queue_name="q_notifications",
                    routing_key="notifications.whatsapp.tier",
                    payload={
                        "mobile": mobile,
                        "customer_name": loyalty_summary.get("partner_name", ""),
                        "old_tier": loyalty_summary.get("old_tier", ""),
                        "new_tier": loyalty_summary.get("tier", ""),
                        "store_name": store_id,
                        "idempotency_key": idempotency_key + "_tier",
                        "task_version": "1.0"
                    },
                    use_outbox=False
                )

        return loyalty_summary
    except Exception as exc:
        logger.error("task_accrue_loyalty_failed", sale_id=sale_id, error=str(exc))
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)
