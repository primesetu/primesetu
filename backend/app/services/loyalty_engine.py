"""
loyalty_engine.py — SMRITI-OS Loyalty & CRM Engine

Tier Thresholds (lifetime earned points):
  BRONZE  → default / entry
  SILVER  → 500 pts
  GOLD    → 2000 pts
  PLATINUM → 5000 pts

Points Accrual:
  1 point per Rs.100 spent (multiplied by tier bonus)
  SILVER  1x | GOLD 1.5x | PLATINUM 2x

Points Value: 1 point = Re.0.50 at redemption
Expiry: 365 days from last earn (configurable via SmritiParam)
"""

from __future__ import annotations
from typing import Optional
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.models.base import Partner, LoyaltyLedger, Transaction


# ── Tier Configuration ──────────────────────────────────────────────────────
TIERS = {
    "BRONZE":   {"min_pts": 0,    "multiplier": 1.0,  "label": "Bronze",   "color": "#b45309"},
    "SILVER":   {"min_pts": 500,  "multiplier": 1.0,  "label": "Silver",   "color": "#6b7280"},
    "GOLD":     {"min_pts": 2000, "multiplier": 1.5,  "label": "Gold",     "color": "#d97706"},
    "PLATINUM": {"min_pts": 5000, "multiplier": 2.0,  "label": "Platinum", "color": "#7c3aed"},
}

POINTS_PER_RUPEE = Decimal("0.01")    # 1 pt per Rs.100
POINTS_VALUE_PAISE = Decimal("50")    # 1 pt = Rs.0.50 = 50 paise
MAX_REDEEM_PCT = Decimal("0.20")      # max 20% of bill via points


def resolve_tier(total_earned: int) -> str:
    """Resolve tier from lifetime earned points."""
    tier = "BRONZE"
    for name, cfg in TIERS.items():
        if total_earned >= cfg["min_pts"]:
            tier = name
    return tier


def points_to_earn(net_amount_paise: int, tier: str) -> int:
    """Calculate points to accrue on a sale."""
    multiplier = Decimal(str(TIERS.get(tier, TIERS["BRONZE"])["multiplier"]))
    rupees = Decimal(str(net_amount_paise)) / 100
    raw_pts = rupees * POINTS_PER_RUPEE * multiplier
    return int(raw_pts)


def points_to_paise(points: int) -> int:
    """Convert redeemable points to paise discount value."""
    return int(Decimal(str(points)) * POINTS_VALUE_PAISE)


def max_redeemable_points(net_amount_paise: int, available_points: int) -> int:
    """Max points that can be redeemed on a bill (capped at MAX_REDEEM_PCT of bill)."""
    max_disc_paise = int(Decimal(str(net_amount_paise)) * MAX_REDEEM_PCT)
    max_pts_by_discount = int(Decimal(str(max_disc_paise)) / POINTS_VALUE_PAISE)
    return min(available_points, max_pts_by_discount)


# ── Service ──────────────────────────────────────────────────────────────────
class LoyaltyEngine:

    @staticmethod
    async def accrue(
        db: AsyncSession,
        store_id: str,
        partner_id,
        sale_id,
        net_amount_paise: int,
    ) -> dict:
        """
        Add earned points after a successful sale.
        Upgrades tier automatically if threshold crossed.
        Returns accrual summary for WhatsApp notification.
        """
        partner = await db.get(Partner, partner_id)
        if not partner:
            return {"skipped": True, "reason": "partner_not_found"}

        old_tier = partner.loyalty_tier or "BRONZE"
        earned = points_to_earn(net_amount_paise, old_tier)

        if earned <= 0:
            return {"skipped": True, "reason": "zero_points"}

        partner.loyalty_points = (partner.loyalty_points or 0) + earned
        partner.total_points_earned = (partner.total_points_earned or 0) + earned

        new_tier = resolve_tier(partner.total_points_earned)
        tier_upgraded = new_tier != old_tier
        partner.loyalty_tier = new_tier

        db.add(LoyaltyLedger(
            store_id=store_id,
            partner_id=partner.id,
            txn_type="earn",
            points=earned,
            balance=partner.loyalty_points,
            sale_id=sale_id,
            txn_date=datetime.utcnow().date(),
        ))

        return {
            "partner_id": str(partner.id),
            "partner_name": partner.name,
            "mobile": partner.mobile,
            "earned": earned,
            "balance": partner.loyalty_points,
            "tier": new_tier,
            "tier_upgraded": tier_upgraded,
            "old_tier": old_tier if tier_upgraded else None,
        }

    @staticmethod
    async def redeem(
        db: AsyncSession,
        store_id: str,
        partner_id,
        sale_id,
        points_to_redeem: int,
        bill_total_paise: int,
    ) -> dict:
        """
        Deduct points at POS. Validates max redemption cap.
        Returns paise discount to apply on the bill.
        """
        partner = await db.get(Partner, partner_id)
        if not partner:
            raise ValueError("Customer not found")

        available = partner.loyalty_points or 0
        if points_to_redeem > available:
            raise ValueError(f"Insufficient points. Available: {available}")

        max_pts = max_redeemable_points(bill_total_paise, available)
        if points_to_redeem > max_pts:
            raise ValueError(
                f"Max redeemable for this bill: {max_pts} pts "
                f"({int(MAX_REDEEM_PCT * 100)}% of bill value)"
            )

        discount_paise = points_to_paise(points_to_redeem)
        partner.loyalty_points -= points_to_redeem

        db.add(LoyaltyLedger(
            store_id=store_id,
            partner_id=partner.id,
            txn_type="redeem",
            points=-points_to_redeem,
            balance=partner.loyalty_points,
            sale_id=sale_id,
            txn_date=datetime.utcnow().date(),
        ))

        return {
            "points_redeemed": points_to_redeem,
            "discount_paise": discount_paise,
            "balance_after": partner.loyalty_points,
        }

    @staticmethod
    async def get_profile(db: AsyncSession, partner_id) -> dict:
        """Full loyalty profile for the CRM workbench."""
        partner = await db.get(Partner, partner_id)
        if not partner:
            return {}

        tier = partner.loyalty_tier or "BRONZE"
        tier_cfg = TIERS.get(tier, TIERS["BRONZE"])
        next_tier_name = _next_tier(tier)
        next_tier_pts = TIERS[next_tier_name]["min_pts"] if next_tier_name else None
        pts_to_next = max(0, next_tier_pts - (partner.total_points_earned or 0)) if next_tier_pts else 0

        # Last 10 ledger entries
        ledger_res = await db.execute(
            select(LoyaltyLedger)
            .where(LoyaltyLedger.partner_id == partner.id)
            .order_by(LoyaltyLedger.created_at.desc())
            .limit(10)
        )
        ledger = ledger_res.scalars().all()

        # Lifetime spend
        spend_res = await db.execute(
            select(func.coalesce(func.sum(Transaction.net_payable), 0))
            .where(Transaction.customer_id == partner.id, Transaction.type == "Sales")
        )
        lifetime_spend = spend_res.scalar() or 0

        return {
            "id": str(partner.id),
            "name": partner.name,
            "mobile": partner.mobile,
            "email": partner.email,
            "tier": tier,
            "tier_label": tier_cfg["label"],
            "tier_color": tier_cfg["color"],
            "tier_multiplier": tier_cfg["multiplier"],
            "points_balance": partner.loyalty_points or 0,
            "total_earned": partner.total_points_earned or 0,
            "points_value_rs": round((partner.loyalty_points or 0) * float(POINTS_VALUE_PAISE) / 100, 2),
            "next_tier": next_tier_name,
            "pts_to_next_tier": pts_to_next,
            "lifetime_spend_rs": float(lifetime_spend) / 100,
            "ledger": [
                {
                    "type": e.txn_type,
                    "points": e.points,
                    "balance": e.balance,
                    "date": e.txn_date.isoformat() if e.txn_date else None,
                }
                for e in ledger
            ],
        }

    @staticmethod
    async def run_tier_upgrade_batch(db: AsyncSession) -> dict:
        """
        Nightly batch: recalculate and upgrade tiers for all partners
        based on their lifetime earned points.
        """
        result = await db.execute(select(Partner).where(Partner.type == "CUSTOMER", Partner.is_active == True))
        partners = result.scalars().all()

        upgraded, unchanged = 0, 0
        for p in partners:
            new_tier = resolve_tier(p.total_points_earned or 0)
            if new_tier != (p.loyalty_tier or "BRONZE"):
                p.loyalty_tier = new_tier
                upgraded += 1
            else:
                unchanged += 1

        await db.commit()
        return {"upgraded": upgraded, "unchanged": unchanged}


def _next_tier(current: str) -> Optional[str]:
    tier_order = ["BRONZE", "SILVER", "GOLD", "PLATINUM"]
    try:
        idx = tier_order.index(current)
        return tier_order[idx + 1] if idx + 1 < len(tier_order) else None
    except ValueError:
        return None
