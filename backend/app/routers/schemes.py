from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.schemes import PromoHeader, PromoBillDisc, PromoBuyGet
from app.schemas.schemes import PromoHeaderCreate, PromoHeaderResponse

router = APIRouter(prefix="/api/v1/schemes", tags=["Promotional Engine"])

@router.get("", response_model=list[PromoHeaderResponse])
async def list_promos(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    result = await db.execute(
        select(PromoHeader)
        .where(PromoHeader.store_id == current_user.store_id)
        .options(selectinload(PromoHeader.bill_discounts), selectinload(PromoHeader.buy_get_rules))
    )
    return result.scalars().all()

@router.post("", response_model=PromoHeaderResponse)
async def create_promo(
    payload: PromoHeaderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    new_promo = PromoHeader(
        store_id=current_user.store_id,
        promo_code=payload.promo_code,
        description=payload.description,
        promo_type=payload.promo_type,
        priority=payload.priority,
        is_active=payload.is_active,
        valid_from=payload.valid_from,
        valid_to=payload.valid_to,
        happy_hours=payload.happy_hours
    )
    
    db.add(new_promo)
    await db.flush() # flush to get the id

    if payload.promo_type == "BILL_LEVEL" and payload.bill_discounts:
        for bd in payload.bill_discounts:
            new_bd = PromoBillDisc(
                promo_id=new_promo.id,
                min_bill_amt=bd.min_bill_amt,
                max_bill_amt=bd.max_bill_amt,
                disc_type=bd.disc_type,
                disc_value=bd.disc_value
            )
            db.add(new_bd)
            
    elif payload.promo_type == "BUY_GET" and payload.buy_get_rules:
        for bg in payload.buy_get_rules:
            new_bg = PromoBuyGet(
                promo_id=new_promo.id,
                buy_item_id=bg.buy_item_id,
                buy_qty=bg.buy_qty,
                get_item_id=bg.get_item_id,
                get_qty=bg.get_qty,
                get_disc_pct=bg.get_disc_pct
            )
            db.add(new_bg)

    await db.commit()
    
    # Reload with relations to return full schema
    result = await db.execute(
        select(PromoHeader)
        .where(PromoHeader.id == new_promo.id)
        .options(selectinload(PromoHeader.bill_discounts), selectinload(PromoHeader.buy_get_rules))
    )
    return result.scalar_one()
