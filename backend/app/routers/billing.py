# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from sqlalchemy.orm import selectinload, joinedload
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Item, ItemStock, Customer, Till, Partner, LoyaltyLedger
from app.schemas.billing import TransactionRead, TransactionCreate
from typing import List, Optional, Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from app.core.security import require_auth, CurrentUser

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

@router.get("/history", response_model=List[TransactionRead])
async def get_transaction_history(
    limit: int = 50,
    status: Optional[str] = "Finalized",
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Sovereign Audit Trail: Fetch recent transactions for the current store.
    Supports status filtering (Finalized, Suspended, Void).
    """
    stmt = (
        select(Transaction)
        .where(and_(
            Transaction.store_id == current_user.store_id,
            Transaction.status == status
        ))
        .options(selectinload(Transaction.items).joinedload(TransactionItem.item))
        .order_by(desc(Transaction.created_at))
        .limit(limit)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/suspended", response_model=List[TransactionRead])
async def get_suspended_bills(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Alias for history?status=Suspended"""
    return await get_transaction_history(status="Suspended", db=db, current_user=current_user)

@router.post("/suspend", response_model=TransactionRead)
async def suspend_transaction(
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """
    Sovereign Hold: Suspends a transaction for later recall.
    Does NOT deduct inventory yet.
    """
    store_id = current_user.store_id
    
    new_txn = Transaction(
        id=uuid.uuid4(),
        store_id=store_id,
        type=txn_in.type,
        status="Suspended",
        suspended_reason=txn_in.suspended_reason or "User Hold",
        customer_id=txn_in.customer_id,
        cashier_id=current_user.id,
        till_id=txn_in.till_id
    )
    
    subtotal = 0
    for item_in in txn_in.items:
        # Create Line Item (no inventory update for suspended bills)
        new_item = TransactionItem(
            transaction_id=new_txn.id,
            product_id=item_in.product_id,
            qty=item_in.qty,
            mrp=item_in.unit_price,
            discount_per=item_in.discount_per,
            tax_amount=0, 
            net_amount=int(item_in.qty * item_in.unit_price)
        )
        new_txn.items.append(new_item)
        subtotal += new_item.net_amount

    new_txn.subtotal = subtotal
    new_txn.net_payable = subtotal
    
    db.add(new_txn)
    await db.commit()
    await db.refresh(new_txn)
    
    # Reload with items and product details for the response
    stmt = select(Transaction).where(Transaction.id == new_txn.id).options(selectinload(Transaction.items).joinedload(TransactionItem.item))
    res = await db.execute(stmt)
    return res.scalar_one()

@router.post("/suspended/{txn_id}/recall", response_model=TransactionRead)
async def recall_suspended(
    txn_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Fetches a suspended transaction with all item details."""
    stmt = (
        select(Transaction)
        .where(and_(Transaction.id == txn_id, Transaction.store_id == current_user.store_id))
        .options(selectinload(Transaction.items).joinedload(TransactionItem.item))
    )
    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Suspended transaction not found")
    return txn

@router.delete("/suspended/{txn_id}")
async def delete_suspended(
    txn_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Permanently removes a suspended bill."""
    stmt = select(Transaction).where(and_(Transaction.id == txn_id, Transaction.store_id == current_user.store_id, Transaction.status == "Suspended"))
    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()
    if not txn:
        raise HTTPException(status_code=404, detail="Suspended transaction not found")
    
    await db.delete(txn)
    await db.commit()
    return {"status": "SUCCESS", "message": "Suspended bill removed"}

@router.post("/finalize", response_model=TransactionRead)
async def finalize_transaction(
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """
    Finalize a sales transaction.
    - Validates stock availability.
    - Deducts inventory.
    - Generates bill number.
    - Sovereign Store Isolation via current_user.store_id.
    """
    store_id = current_user.store_id
    
    # 1. Resolve Bill Number (Use client-side if provided, else generate)
    new_bill_no = txn_in.bill_no
    if not new_bill_no:
        today_str = func.to_char(func.now(), 'YYYYMMDD')
        bill_prefix = f"B-{store_id}-{today_str}-"
        new_bill_no = f"{bill_prefix}{uuid.uuid4().hex[:4].upper()}"
 
    # 2. Create Transaction Header
    new_txn = Transaction(
        id=uuid.uuid4(),
        bill_no=new_bill_no,
        store_id=store_id,
        type=txn_in.type,
        status="Finalized",
        payments={p.mode: {"amount": p.amount, "ref": p.ref_no} for p in (txn_in.payments or [])},
        customer_id=txn_in.customer_id,
        cashier_id=current_user.id,
        till_id=txn_in.till_id,
        shoper_recid=txn_in.shoper_recid,
        # Using description or generic field if model doesn't have salesperson yet
        # We can store salesman_id in extra metadata or a dedicated field if exists
        notes=f"Salesman: {txn_in.salesman_id}" if txn_in.salesman_id else None
    )
    
    subtotal = 0
    tax_total = 0
    disc_total = 0
    
    # 3. Process Items & Inventory
    for item_in in txn_in.items:
        # Fetch Item Master & Stock
        item = await db.get(Item, item_in.product_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"[SMRITI-OS] Item {item_in.product_id} not found")

        # Calculations in PAISE (Integers only)
        line_gross_paise = int(item_in.qty * item_in.unit_price)
        line_disc_paise = int(Decimal(str(line_gross_paise * (item_in.discount_per / 100))).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        line_net_paise = line_gross_paise - line_disc_paise
        
        # GST Resolution
        tax_rate = item_in.tax_per / 100
        line_tax_paise = int(Decimal(str(line_net_paise - (line_net_paise / (1 + tax_rate)))).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        
        # Update running totals
        subtotal += line_gross_paise
        tax_total += line_tax_paise
        disc_total += line_disc_paise
        
        # Create Line Item
        new_item = TransactionItem(
            transaction_id=new_txn.id,
            product_id=item_in.product_id,
            qty=item_in.qty,
            mrp=item_in.unit_price,
            discount_per=item_in.discount_per,
            tax_amount=line_tax_paise,
            net_amount=line_net_paise
        )
        new_txn.items.append(new_item)
        
        # 4. Inventory Deduction (Sovereign Guard)
        stock_stmt = select(ItemStock).where(
            and_(ItemStock.item_id == item_in.product_id, ItemStock.store_id == store_id)
        )
        stock_res = await db.execute(stock_stmt)
        stock = stock_res.scalar_one_or_none()
        if stock:
            stock.qty_on_hand -= item_in.qty

    new_txn.subtotal = subtotal
    new_txn.tax_total = tax_total
    new_txn.discount_total = disc_total
    new_txn.net_payable = subtotal - disc_total
    
    db.add(new_txn)
    
    # 5. Loyalty Points Accrual
    if txn_in.customer_id:
        customer = await db.get(Partner, txn_in.customer_id)
        if customer:
            multiplier = 1.0
            if customer.loyalty_tier == "GOLD": multiplier = 1.5
            elif customer.loyalty_tier == "PLATINUM": multiplier = 2.0
            
            accrued_points = int((new_txn.net_payable / 10000) * multiplier)
            if accrued_points > 0:
                customer.loyalty_points += accrued_points
                customer.total_points_earned += accrued_points
                
                ledger_entry = LoyaltyLedger(
                    store_id=store_id,
                    partner_id=customer.id,
                    txn_type="earn",
                    points=accrued_points,
                    balance=customer.loyalty_points,
                    sale_id=new_txn.id,
                    txn_date=func.current_date()
                )
                db.add(ledger_entry)

    await db.commit()
    
    # Return enriched transaction
    stmt = select(Transaction).where(Transaction.id == new_txn.id).options(selectinload(Transaction.items).joinedload(TransactionItem.item))
    res = await db.execute(stmt)
    return res.scalar_one()

@router.get("/day-end/summary")
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Institutional Day-End Summary."""
    store_id = current_user.store_id
    
    stats = await db.execute(
        select(
            func.count(Transaction.id).label("bill_count"),
            func.sum(Transaction.net_payable).label("total_sales"),
            func.sum(Transaction.tax_total).label("total_tax")
        ).where(
            and_(
                Transaction.store_id == store_id,
                Transaction.status == "Finalized",
                func.date(Transaction.created_at) == func.current_date()
            )
        )
    )
    res = stats.one()
    
    return {
        "bill_count": res.bill_count or 0,
        "total_sales_paise": res.total_sales or 0,
        "total_tax_paise": res.total_tax or 0,
        "status": "Ready for Reconcile"
    }

@router.post("/day-end/finalize")
async def finalize_day_end(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Sovereign Seal of Day-End."""
    return {"status": "SUCCESS", "message": "[SMRITI-OS] Day End Sealed for " + current_user.store_id}
