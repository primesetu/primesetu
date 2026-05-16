from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.e_invoice import EInvoiceService

router = APIRouter(prefix="/einvoice", tags=["E-Invoice compliance"])

@router.post("/generate/{bill_no}")
async def generate_invoice_irn(
    bill_no: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Trigger NIC IRP API IRN generation for a finalized invoice.
    """
    try:
        result = await EInvoiceService.generate_irn(bill_no, db)
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}

@router.post("/cancel/{bill_no}")
async def cancel_invoice_irn(
    bill_no: str,
    reason: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Cancel an IRN within 24 hours.
    """
    try:
        result = await EInvoiceService.cancel_irn(bill_no, reason, db)
        return result
    except Exception as e:
        return {"status": "error", "message": str(e)}
