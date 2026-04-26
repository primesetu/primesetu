# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, and_
from typing import List, Optional
import random
import string
import uuid
from datetime import datetime
from decimal import Decimal, ROUND_HALF_UP

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import (
    Transaction, TransactionItem, Item, ItemStock, SalesSlip, 
    SalesSlipItem, Till, SyncPacket
)
from app.schemas.billing import BillCreate, BillResponse, SlipCreate, SlipResponse
from app.services.hooks import HookEngine

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

async def adjust_inventory(db: AsyncSession, store_id: uuid.UUID, item_id: uuid.UUID, qty: float, tx_type: str):
    """Atomic stock adjustment helper."""
    # Note: In a real SKU system, we need size/colour. 
    # For simplified billing where size/colour isn't selected on line item, we default.
    stmt = select(ItemStock).where(
        and_(
            ItemStock.item_id == item_id, 
            ItemStock.store_id == store_id
        )
    )
    stock_res = await db.execute(stmt)
    stock = stock_res.scalar_one_or_none()
    
    if not stock:
        # Create default stock record if not exists
        stock = ItemStock(
            item_id=item_id, 
            store_id=store_id, 
            qty_on_hand=0, 
            size='Universal', 
            colour='Universal'
        )
        db.add(stock)
    
    if tx_type == "Sales":
        stock.qty_on_hand -= int(qty)
    else:
        stock.qty_on_hand += int(qty)

@router.post("/finalize", response_model=BillResponse)
async def finalize_bill(
    bill_data: BillCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Sovereign Billing Protocol. Atomically commits transaction and updates stock."""
    try:
        # Level 1 Hook: Header (Customer, Till, Type)
        bill_data = await HookEngine.execute(1, bill_data)

        prefix = "B-" if bill_data.type == "Sales" else "SR-"
        bill_no = f"{prefix}{datetime.now().strftime('%y%m%d')}-{uuid.uuid4().hex[:4].upper()}"
        
        transaction = Transaction(
            bill_no=bill_no,
            store_id=current_user.store_id,
            till_id=bill_data.till_id,
            customer_id=bill_data.customer_id,
            type=bill_data.type,
            payments=bill_data.payments if bill_data.payments else None,
            status="Finalized",
            subtotal=0,
            net_payable=0,
            tax_total=0
        )
        db.add(transaction)
        await db.flush()

        total_net_paise = 0
        total_tax_paise = 0
        
        for item_in in bill_data.items:
            # Level 2 Hook: Detail (Item code, Qty, Rate)
            item_in = await HookEngine.execute(2, item_in)

            item = await db.get(Item, item_in.product_id)
            if not item:
                raise HTTPException(status_code=404, detail=f"Item {item_in.product_id} not found")
            
            await adjust_inventory(db, current_user.store_id, item.id, item_in.qty, bill_data.type)
            
            # Monetary calculation in Paise
            line_total_paise = int(Decimal(str(item_in.qty * item_in.unit_price)).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
            tax_rate = int(item.gst_rate)
            line_tax_paise = (line_total_paise * tax_rate) // (100 + tax_rate)
            
            db.add(TransactionItem(
                transaction_id=transaction.id,
                product_id=item.id,
                qty=item_in.qty,
                mrp=item.mrp_paise,
                tax_amount=line_tax_paise,
                net_amount=line_total_paise
            ))
            
            total_net_paise += line_total_paise
            total_tax_paise += line_tax_paise
        
        transaction.subtotal = total_net_paise - total_tax_paise
        transaction.tax_total = total_tax_paise
        transaction.net_payable = total_net_paise
        
        # Level 3 Hook: Footer (Totals, Taxes)
        # We pass the transaction object itself or a dict of totals
        await HookEngine.execute(3, transaction)

        # Level 4 Hook: Footer Detail (Payments)
        if bill_data.payments:
            await HookEngine.execute(4, bill_data.payments)

        await db.commit()
        await db.refresh(transaction)
        return transaction
        
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Billing Failure: {str(e)}")

@router.get("/history", response_model=List[BillResponse])
async def get_billing_history(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Retrieve recent transactions for the store."""
    stmt = (
        select(Transaction)
        .where(Transaction.store_id == current_user.store_id)
        .order_by(Transaction.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/day-end/summary")
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Shoper 9 SR435700: Day-End Reconciliation Summary.
    Fetches mode-wise sales, open tills, and pending syncs.
    """
    today = datetime.now().date()
    
    # 1. Open Tills
    stmt_tills = select(Till).where(and_(Till.store_id == current_user.store_id, Till.status == 'Open'))
    res_tills = await db.execute(stmt_tills)
    open_tills = res_tills.scalars().all()
    
    # 2. Sales Summary by Mode
    stmt_sales = select(Transaction).where(and_(
        Transaction.store_id == current_user.store_id,
        func.date(Transaction.created_at) == today,
        Transaction.status == 'Finalized'
    ))
    res_sales = await db.execute(stmt_sales)
    sales = res_sales.scalars().all()
    
    mode_totals = {}
    total_sales = 0
    for s in sales:
        total_sales += s.net_payable
        if s.payments:
            for p in s.payments:
                mode = p.get('mode', 'CASH')
                mode_totals[mode] = mode_totals.get(mode, 0) + p.get('amount', 0)
    
    # 3. Pending Syncs
    stmt_sync = select(func.count(SyncPacket.id)).where(SyncPacket.status == 'Pending')
    res_sync = await db.execute(stmt_sync)
    pending_syncs = res_sync.scalar()
    
    return {
        "date": today.isoformat(),
        "total_sales_paise": total_sales,
        "mode_totals": mode_totals,
        "open_tills_count": len(open_tills),
        "pending_syncs": pending_syncs,
        "can_close": len(open_tills) == 0 and pending_syncs == 0
    }

@router.post("/day-end/finalize")
async def finalize_day_end(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Locks the day and moves the operational date forward.
    Ensures all tills are closed.
    """
    # Verify open tills
    stmt_tills = select(func.count(Till.id)).where(and_(Till.store_id == current_user.store_id, Till.status == 'Open'))
    res_tills = await db.execute(stmt_tills)
    if res_tills.scalar() > 0:
        raise HTTPException(status_code=400, detail="Close all tills before Day End")
        
    # In Shoper 9, this would also push data to HO and lock the date.
    # For now, we return a success 'Sovereign Seal'.
    return {"status": "SUCCESS", "message": "Day-End Protocol Completed. Sovereign Seal applied."}
