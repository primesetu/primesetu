from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from app.services.company_provisioner import provision_new_company

router = APIRouter(prefix="/companies", tags=["companies"])

class CompanySetupRequest(BaseModel):
    company_name: str
    invoice_prefix: str
    gstin: str = ""
    owner_mobile: str = ""

@router.post("/setup", status_code=status.HTTP_201_CREATED)
async def setup_company(payload: CompanySetupRequest):
    try:
        result = await provision_new_company(
            company_name=payload.company_name,
            invoice_prefix=payload.invoice_prefix,
            gstin=payload.gstin,
            owner_mobile=payload.owner_mobile
        )
        return {"status": result["status"], "tenant_id": result["tenant_id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
