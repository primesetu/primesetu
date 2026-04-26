# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, and_
from typing import List, Optional
from uuid import UUID
from datetime import date, datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Partner, CustomerLedger, LoyaltyLedger
from app.schemas.customer import (
    CustomerCreate, CustomerResponse, CustomerLookupResponse,
    LedgerEntryResponse, LoyaltyRedeemRequest
)

router = APIRouter(prefix="/customers", tags=["customer"])

async def generate_customer_code(db: AsyncSession, store_id: UUID) -> str:
    """
    Generate next sequential customer code (C0001 format).
    """
    result = await db.execute(
        text("""
            SELECT code FROM public.partners
            WHERE store_id = :store_id
              AND partner_type IN ('customer', 'both')
              AND code ~ '^C[0-9]{4}$'
            ORDER BY code DESC
            LIMIT 1
        """),
        {"store_id": store_id}
    )
    last = result.scalar_one_or_none()
    if last:
        # Extract number from C0001
        try:
            next_num = int(last[1:]) + 1
        except ValueError:
            next_num = 1
    else:
        next_num = 1
    return f"C{next_num:04d}"

@router.post("/", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
async def create_customer(
    payload: CustomerCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Register a new customer with auto-generated code and GSTIN validation.
    """
    # 1. Check if phone already exists
    existing_q = await db.execute(
        select(Partner).where(
            Partner.store_id == current_user.store_id,
            Partner.phone == payload.phone,
            Partner.partner_type.in_(['customer', 'both'])
        )
    )
    if existing_q.scalar_one_or_none():
        raise HTTPException(
            status_code=409,
            detail=f"Customer with phone '{payload.phone}' already exists."
        )

    # 2. Generate sequential code
    code = await generate_customer_code(db, current_user.store_id)

    # 3. Handle state_code from GSTIN if not provided
    state_code = payload.state_code
    if payload.gstin and not state_code:
        state_code = payload.gstin[:2]

    # 4. Create Partner
    new_customer = Partner(
        store_id=current_user.store_id,
        partner_type="customer",
        code=code,
        name=payload.name,
        phone=payload.phone,
        email=payload.email,
        gstin=payload.gstin,
        address_line1=payload.address_line1,
        address_line2=payload.address_line2,
        city=payload.city,
        state_code=state_code,
        pincode=payload.pincode,
        credit_limit_paise=payload.credit_limit_paise,
        credit_days=payload.credit_days,
        price_group_id=payload.price_group_id,
        loyalty_points=0,
        is_active=True
    )
    db.add(new_customer)
    await db.commit()
    await db.refresh(new_customer)
    return new_customer

@router.get("/lookup", response_model=CustomerLookupResponse)
async def lookup_customer(
    phone: str = Query(..., min_length=10),
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    POS Hot Path: Quick lookup by phone.
    Returns loyalty and outstanding balance.
    """
    result = await db.execute(
        text("""
            SELECT
                p.id, p.code, p.name, p.phone,
                p.loyalty_points, p.price_group_id, p.credit_limit_paise,
                COALESCE(SUM(cl.amount_paise), 0) AS outstanding_paise
            FROM public.partners p
            LEFT JOIN public.customer_ledger cl
                ON cl.partner_id = p.id AND cl.store_id = :store_id
            WHERE p.store_id = :store_id
              AND p.phone = :phone
              AND p.partner_type IN ('customer','both')
              AND p.is_active = true
            GROUP BY p.id
            LIMIT 1
        """),
        {"store_id": current_user.store_id, "phone": phone}
    )
    customer = result.mappings().first()
    if not customer:
        return {"found": False}
    return {"found": True, **dict(customer)}

@router.get("/{customer_id}/ledger", response_model=List[LedgerEntryResponse])
async def get_customer_ledger(
    customer_id: UUID,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the account statement for a customer.
    """
    result = await db.execute(
        select(CustomerLedger)
        .where(
            CustomerLedger.partner_id == customer_id,
            CustomerLedger.store_id == current_user.store_id
        )
        .order_by(CustomerLedger.txn_date.desc(), CustomerLedger.created_at.desc())
    )
    return result.scalars().all()

@router.post("/{customer_id}/loyalty/redeem")
async def redeem_loyalty(
    customer_id: UUID,
    payload: LoyaltyRedeemRequest,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Redeem loyalty points.
    Validation: 
    1. Points available balance check.
    2. Max 50% of invoice value redemption rule.
    """
    # 1. Fetch customer
    customer = await db.get(Partner, customer_id)
    if not customer or customer.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Customer not found")

    # 2. Points balance check
    if customer.loyalty_points < payload.points_to_redeem:
        raise HTTPException(
            status_code=400,
            detail=f"Insufficient loyalty points. Balance: {customer.loyalty_points}"
        )

    # 3. 50% Rule: 1 point = 1 Rupee (100 paise)
    redemption_value_paise = payload.points_to_redeem * 100
    max_redemption_paise = payload.invoice_value_paise // 2
    
    if redemption_value_paise > max_redemption_paise:
        max_points = max_redemption_paise // 100
        raise HTTPException(
            status_code=400,
            detail=f"Redemption limit exceeded. Max allowed points for this invoice: {max_points}"
        )

    # 4. Atomic update: Ledger + Partner balance
    ledger_entry = LoyaltyLedger(
        store_id=current_user.store_id,
        partner_id=customer_id,
        txn_type="redeem",
        points=-payload.points_to_redeem,
        balance=customer.loyalty_points - payload.points_to_redeem,
        sale_id=payload.sale_id,
        txn_date=date.today()
    )
    db.add(ledger_entry)
    
    customer.loyalty_points -= payload.points_to_redeem
    
    await db.commit()
    return {
        "status": "success",
        "points_redeemed": payload.points_to_redeem,
        "new_balance": customer.loyalty_points
    }
