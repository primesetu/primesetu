from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.sovereign import SmritiBarcodeTemplate

router = APIRouter(prefix="/barcode/templates", tags=["Barcode Templates"])

class TemplateNode(BaseModel):
    type: str # 'text', 'barcode', 'image'
    x: float
    y: float
    width: Optional[float] = None
    height: Optional[float] = None
    content: Optional[str] = None
    dataField: Optional[str] = None
    font: Optional[str] = None
    fontSize: Optional[float] = None
    symbology: Optional[str] = None

class BarcodeTemplateCreate(BaseModel):
    name: str
    description: Optional[str] = None
    printer_type: str = "STANDARD"
    width_mm: float = 50.0
    height_mm: float = 25.0
    layout_json: List[TemplateNode] = []
    is_active: bool = True

class BarcodeTemplateResponse(BarcodeTemplateCreate):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

@router.get("/", response_model=List[BarcodeTemplateResponse])
async def get_templates(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """ Fetch all barcode templates """
    res = await db.execute(select(SmritiBarcodeTemplate))
    return res.scalars().all()

@router.post("/", response_model=BarcodeTemplateResponse)
async def create_template(
    template: BarcodeTemplateCreate, 
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """ Create a new barcode template """
    # Simple check for existing name
    existing_res = await db.execute(select(SmritiBarcodeTemplate).filter(SmritiBarcodeTemplate.name == template.name))
    existing = existing_res.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Template with this name already exists")
    
    db_template = SmritiBarcodeTemplate(
        name=template.name,
        description=template.description,
        printer_type=template.printer_type,
        width_mm=template.width_mm,
        height_mm=template.height_mm,
        layout_json=[node.model_dump() for node in template.layout_json],
        is_active=template.is_active
    )
    db.add(db_template)
    await db.commit()
    await db.refresh(db_template)
    return db_template

@router.put("/{template_id}", response_model=BarcodeTemplateResponse)
async def update_template(
    template_id: int, 
    template: BarcodeTemplateCreate, 
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """ Update an existing barcode template """
    db_template_res = await db.execute(select(SmritiBarcodeTemplate).filter(SmritiBarcodeTemplate.id == template_id))
    db_template = db_template_res.scalar_one_or_none()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
        
    db_template.name = template.name
    db_template.description = template.description
    db_template.printer_type = template.printer_type
    db_template.width_mm = template.width_mm
    db_template.height_mm = template.height_mm
    db_template.layout_json = [node.model_dump() for node in template.layout_json]
    db_template.is_active = template.is_active
    db_template.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_template)
    return db_template

@router.delete("/{template_id}")
async def delete_template(
    template_id: int, 
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """ Delete a barcode template """
    db_template_res = await db.execute(select(SmritiBarcodeTemplate).filter(SmritiBarcodeTemplate.id == template_id))
    db_template = db_template_res.scalar_one_or_none()
    if not db_template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    await db.delete(db_template)
    await db.commit()
    return {"status": "success"}


class PrintTestRequest(BaseModel):
    printer_ip: str
    items: Optional[List[dict]] = None  # Pre-supplied test items; uses defaults if empty
    copies: int = 1

@router.post("/{template_id}/print")
async def print_template(
    template_id: int,
    req: PrintTestRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Sovereign Print Dispatch — Designer Hot Path.
    Renders the saved layout_json as ZPL and sends it raw over TCP to printer_ip:9100.
    Use this from the BarcodeDesigner 'Test Print' button.
    """
    from app.services.barcode import print_from_template

    tpl_res = await db.execute(select(SmritiBarcodeTemplate).filter(SmritiBarcodeTemplate.id == template_id))
    tpl = tpl_res.scalar_one_or_none()
    if not tpl:
        raise HTTPException(status_code=404, detail="Template not found")

    # Use provided test items or fall back to a built-in demo item
    test_items = req.items or [{
        "sku": "TEST-001",
        "name": "TEST ITEM",
        "mrp": 999.0,
        "class1": "DEMO",
        "class2": "BRAND",
        "barcode": "TEST-001",
        "size": "M",
        "colour": "Blue",
        "hsn_code": "6109",
        "store_name": "SMRITI-OS STORE",
    }]

    results = []
    for item_data in test_items:
        success = print_from_template(
            layout_json=tpl.layout_json,
            item_data=item_data,
            printer_ip=req.printer_ip,
            width_mm=tpl.width_mm,
            height_mm=tpl.height_mm,
            copies=req.copies,
        )
        results.append({"sku": item_data.get("sku", "?"), "printed": success})

    total = sum(1 for r in results if r["printed"])
    return {
        "template": tpl.name,
        "dispatched": total,
        "total": len(results),
        "results": results
    }
