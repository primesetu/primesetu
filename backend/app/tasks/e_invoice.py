import asyncio
from app.core.celery_app import celery_app
from app.core.database import get_db_session
from app.services.e_invoice import EInvoiceService

@celery_app.task(name="app.tasks.e_invoice.generate_irn")
def generate_irn(bill_no: str):
    """
    Celery task to generate IRN for a finalized invoice via NIC IRP.
    """
    async def _run():
        async with get_db_session() as db:
            result = await EInvoiceService.generate_irn(bill_no, db)
            return result
            
    return asyncio.run(_run())

@celery_app.task(name="app.tasks.e_invoice.cancel_irn")
def cancel_irn(bill_no: str, reason: str):
    """
    Celery task to cancel an IRN via NIC IRP.
    """
    async def _run():
        async with get_db_session() as db:
            result = await EInvoiceService.cancel_irn(bill_no, reason, db)
            return result
            
    return asyncio.run(_run())
