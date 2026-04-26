from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.reporting import PrintTemplate, PrintTemplateField, ReportConfig, ReportSchedule
from app.schemas.reporting import PrintTemplateCreate, PrintTemplateResponse, ReportConfigCreate, ReportConfigResponse

router = APIRouter(prefix="/api/v1/reporting", tags=["Print Designer & Reports"])

@router.get("/templates", response_model=list[PrintTemplateResponse])
async def list_print_templates(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    result = await db.execute(
        select(PrintTemplate)
        .where(PrintTemplate.store_id == current_user.store_id)
        .options(selectinload(PrintTemplate.fields))
    )
    return result.scalars().all()

@router.post("/templates", response_model=PrintTemplateResponse)
async def create_print_template(
    payload: PrintTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    new_tmpl = PrintTemplate(
        store_id=current_user.store_id,
        template_name=payload.template_name,
        template_type=payload.template_type,
        is_active=payload.is_active,
        page_width=payload.page_width,
        page_height=payload.page_height
    )
    db.add(new_tmpl)
    await db.flush()

    if payload.fields:
        for fld in payload.fields:
            new_fld = PrintTemplateField(
                template_id=new_tmpl.id,
                field_name=fld.field_name,
                pos_x=fld.pos_x,
                pos_y=fld.pos_y,
                font_size=fld.font_size,
                font_weight=fld.font_weight,
                is_visible=fld.is_visible
            )
            db.add(new_fld)

    await db.commit()
    
    result = await db.execute(
        select(PrintTemplate)
        .where(PrintTemplate.id == new_tmpl.id)
        .options(selectinload(PrintTemplate.fields))
    )
    return result.scalar_one()

@router.get("/configs", response_model=list[ReportConfigResponse])
async def list_report_configs(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    result = await db.execute(
        select(ReportConfig)
        .where(ReportConfig.store_id == current_user.store_id)
        .options(selectinload(ReportConfig.schedules))
    )
    return result.scalars().all()

@router.post("/configs", response_model=ReportConfigResponse)
async def create_report_config(
    payload: ReportConfigCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    new_rep = ReportConfig(
        store_id=current_user.store_id,
        report_name=payload.report_name,
        module=payload.module,
        query_json=payload.query_json
    )
    db.add(new_rep)
    await db.flush()

    if payload.schedules:
        for sch in payload.schedules:
            new_sch = ReportSchedule(
                report_id=new_rep.id,
                store_id=current_user.store_id,
                frequency=sch.frequency,
                send_time=sch.send_time,
                email_to=sch.email_to,
                is_active=sch.is_active
            )
            db.add(new_sch)

    await db.commit()
    
    result = await db.execute(
        select(ReportConfig)
        .where(ReportConfig.id == new_rep.id)
        .options(selectinload(ReportConfig.schedules))
    )
    return result.scalar_one()
