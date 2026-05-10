"""
loyalty.py — SMRITI-OS Loyalty & CRM API Router

Endpoints:
  GET  /loyalty/profile/{partner_id}    — Full CRM loyalty card
  GET  /loyalty/ledger/{partner_id}     — Points history (paginated)
  POST /loyalty/redeem                  — Deduct points at POS (returns paise discount)
  POST /loyalty/adjust                  — Manual adjustment (HO override)
  POST /loyalty/batch-upgrade           — Nightly tier recalculation (called by Celery Beat)
  GET  /loyalty/search                  — Customer lookup for POS redemption UI
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.base import Partner, LoyaltyLedger
from app.services.loyalty_engine import LoyaltyEngine, max_redeemable_points, TIERS

router = APIRouter(prefix="/api/v1/loyalty", tags=["Loyalty & CRM"])


@router.get("/profile/{partner_id}")
async def get_loyalty_profile(
    partner_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Full loyalty profile + ledger for CRM workbench."""
    import uuid
    try:
        pid = uuid.UUID(partner_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid partner_id format.")

    profile = await LoyaltyEngine.get_profile(db, pid)
    if not profile:
        raise HTTPException(status_code=404, detail="Customer not found.")
    return profile


@router.get("/search")
async def search_loyalty_customers(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Quick customer search for POS redemption input."""
    term = f"%{q}%"
    result = await db.execute(
        select(Partner)
        .where(
            Partner.type == "CUSTOMER",
            Partner.is_active == True,
            or_(Partner.mobile.ilike(term), Partner.name.ilike(term)),
        )
        .limit(10)
    )
    rows = result.scalars().all()
    return [
        {
            "id": str(r.id),
            "name": r.name,
            "mobile": r.mobile,
            "tier": r.loyalty_tier or "BRONZE",
            "points_balance": r.loyalty_points or 0,
            "points_value_rs": round((r.loyalty_points or 0) * 0.5, 2),
        }
        for r in rows
    ]


@router.post("/redeem")
async def redeem_points(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Deduct points at POS checkout.

    Payload: { partner_id, points, bill_total_paise }
    Returns: { discount_paise, points_redeemed, balance_after }
    """
    import uuid

    partner_id = payload.get("partner_id")
    points = int(payload.get("points", 0))
    bill_total = int(payload.get("bill_total_paise", 0))

    if not partner_id or points <= 0:
        raise HTTPException(status_code=400, detail="partner_id and points > 0 required.")

    try:
        result = await LoyaltyEngine.redeem(
            db=db,
            store_id=current_user.store_id,
            partner_id=uuid.UUID(partner_id),
            sale_id=None,
            points_to_redeem=points,
            bill_total_paise=bill_total,
        )
        await db.commit()
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/adjust")
async def adjust_points(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Manual points adjustment (HO override, complaint resolution).
    Payload: { partner_id, points, reason }  — positive = add, negative = deduct
    """
    import uuid
    partner_id = payload.get("partner_id")
    points = int(payload.get("points", 0))
    reason = payload.get("reason", "Manual adjustment")

    if not partner_id or points == 0:
        raise HTTPException(status_code=400, detail="partner_id and non-zero points required.")

    partner = await db.get(Partner, uuid.UUID(partner_id))
    if not partner:
        raise HTTPException(status_code=404, detail="Customer not found.")

    partner.loyalty_points = max(0, (partner.loyalty_points or 0) + points)
    if points > 0:
        partner.total_points_earned = (partner.total_points_earned or 0) + points

    db.add(LoyaltyLedger(
        store_id=current_user.store_id,
        partner_id=partner.id,
        txn_type="adjust",
        points=points,
        balance=partner.loyalty_points,
        txn_date=__import__("datetime").datetime.utcnow().date(),
    ))
    await db.commit()

    return {
        "status": "adjusted",
        "partner_id": str(partner.id),
        "adjusted_by": points,
        "new_balance": partner.loyalty_points,
        "reason": reason,
    }


@router.post("/batch-upgrade")
async def run_batch_tier_upgrade(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Nightly tier recalculation — call via Celery Beat at 00:01."""
    result = await LoyaltyEngine.run_tier_upgrade_batch(db)
    return {"status": "complete", **result}


@router.get("/tiers")
async def get_tier_config():
    """Return tier configuration for the CRM workbench display."""
    return {
        name: {
            "label": cfg["label"],
            "color": cfg["color"],
            "min_pts": cfg["min_pts"],
            "multiplier": cfg["multiplier"],
            "points_value_rs": 0.50,
        }
        for name, cfg in TIERS.items()
    }
