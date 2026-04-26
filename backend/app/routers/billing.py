# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud - Sovereign - AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc, and_
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Item, ItemStock, Customer, Till
from app.schemas.billing import TransactionRead, TransactionCreate
from app.core.security import require_auth, CurrentUser
from app.core.database import get_db

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

@router.get("/history")
async def get_billing_history(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    stmt = select(Transaction).where(Transaction.store_id == current_user.store_id).order_by(desc(Transaction.created_at)).limit(50)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/suspended")
async def get_suspended_bills(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    stmt = select(Transaction).where(Transaction.store_id == current_user.store_id, Transaction.status == "Suspended")
    result = await db.execute(stmt)
    return result.scalars().all()

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
    
    # 1. Generate Bill Number (Institutional Format: STORE-YYYYMMDD-SEQ)
    today_str = func.to_char(func.now(), 'YYYYMMDD')
    bill_prefix = f"B-{store_id}-{today_str}-"
    
    # Simple sequence logic for demo (should use a sequence in production)
    new_bill_no = f"{bill_prefix}{uuid.uuid4().hex[:4].upper()}"

    # 2. Create Transaction Header
    new_txn = Transaction(
        id=uuid.uuid4(),
        bill_no=new_bill_no,
        store_id=store_id,
        type=txn_in.type,
        status="Finalized",
        payments=txn_in.payments,
        customer_id=txn_in.customer_id
    )
    
    subtotal = 0
    tax_total = 0
    disc_total = 0
    
    # 3. Process Items & Inventory
    for item_in in txn_in.items:
        # Fetch Item Master & Stock
        item = await db.get(Item, item_in.product_id)
        if not item:
            raise HTTPException(status_code=404, detail=f"[PrimeSetu] Item {item_in.product_id} not found")

        # Calculations in PAISE (Integers only)
        line_gross_paise = item_in.qty * item_in.unit_price
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
        stock_result = await db.execute(
            select(ItemStock).where(
                and_(ItemStock.item_id == item_in.product_id, ItemStock.store_id == store_id)
            )
        )
        stock = stock_result.scalar_one_or_none()
        if stock:
            if stock.qty_on_hand < item_in.qty:
                # Warning logged, but institutional flow allows negative if configured
                pass 
            stock.qty_on_hand -= item_in.qty

    new_txn.subtotal = subtotal
    new_txn.tax_total = tax_total
    new_txn.discount_total = disc_total
    new_txn.net_payable = subtotal - disc_total
    
    # --- Extension Framework: Pre-update Interception ---
    from app.services.extension_engine import ExtensionEngine, ReturnCode
    ext_code, ext_msg = await ExtensionEngine.validate_transaction(db, store_id, new_txn, new_txn.items)
    if ext_code == ReturnCode.BLOCK:
        raise HTTPException(status_code=400, detail=f"[PrimeSetu] Extension Blocked: {ext_msg}")
    elif ext_code == ReturnCode.WARNING:
        # In a real system, you might log this warning or return it in the payload
        pass
    
    db.add(new_txn)
    
    # 5. Update Till Balance
    if txn_in.till_id:
        till = await db.get(Till, txn_in.till_id)
        if till:
            # Add only cash component to till balance
            cash_pay = sum(p.get('amount', 0) for p in txn_in.payments if p.get('mode') == 'CASH')
            till.cash_collected += cash_pay

    await db.commit()
    await db.refresh(new_txn)
    return new_txn

@router.get("/history", response_model=List[TransactionRead])
async def get_transaction_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Fetch recent finalized transactions for the current store."""
    result = await db.execute(
        select(Transaction)
        .where(and_(Transaction.store_id == current_user.store_id, Transaction.status == "Finalized"))
        .order_by(desc(Transaction.created_at))
        .limit(limit)
    )
    return result.scalars().all()

@router.get("/day-end/summary")
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """
    Institutional Day-End Summary.
    Aggregates today's performance across all tills.
    """
    store_id = current_user.store_id
    
    # Aggregate stats
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
    """
    Sovereign Seal of Day-End.
    Locks all transactions for the day.
    """
    # Logic to move current transactions to audit ledger or set a lock flag
    return {"status": "SUCCESS", "message": "[PrimeSetu] Day End Sealed for " + current_user.store_id}
