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
from sqlalchemy import select, func, desc, and_, or_
from sqlalchemy.orm import selectinload, joinedload
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Customer, Till, Partner, LoyaltyLedger, CreditNote
from app.schemas.billing import TransactionRead, TransactionCreate
from typing import List, Optional, Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from app.core.security import require_auth, CurrentUser
from app.core.counters import CounterManager
from app.services.config import ConfigService
from app.services.tax_service import TaxService
from app.services.promo_service import PromoService
from app.models.legacy_s9 import Itemmaster, Stockmaster, Personnel, Pospaymodes

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
        .options(selectinload(Transaction.items))
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
            stock_no=item_in.stock_no,
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
    
    # Reload with items for the response
    stmt = select(Transaction).where(Transaction.id == new_txn.id).options(selectinload(Transaction.items))
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
        .options(selectinload(Transaction.items))
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
    - Looks up items from Shoper9 Itemmaster (source of truth).
    - Stores denormalized item data for historical record.
    - Sovereign Store Isolation via current_user.store_id.
    """
    store_id = current_user.store_id
    
    # Check StockOutActionInBill policy
    stock_action = await ConfigService.get_stock_out_action(db, store_id)
    
    # 1. Resolve Institutional Control Number & Bill Number
    try:
        trn_ctrl_no = await CounterManager.get_next_ctrl_no(db, "2100")
    except Exception as e:
        # Fallback logic requested by user: Sync with max(trnctrlno)
        res = await db.execute(text("SELECT COALESCE(MAX(trnctrlno), 0) + 1 FROM shoper9.stktrnhdr WHERE trntype = 2100"))
        trn_ctrl_no = res.scalar()
        # Update genlookup to this new number to prevent future conflicts
        await db.execute(text("UPDATE shoper9.genlookup SET number = :n WHERE recid = 101 AND code = '2100'"), {"n": trn_ctrl_no})

    new_bill_no = txn_in.bill_no
    if not new_bill_no:
        bill_prefix = f"B-{store_id}-"
        new_bill_no = f"{bill_prefix}{trn_ctrl_no}"
 
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
        external_id=str(trn_ctrl_no),
        notes=f"Salesman: {txn_in.salesman_id}" if txn_in.salesman_id else None
    )
    
    subtotal = 0
    tax_total = 0
    disc_total = 0
    
    # 3. Process Items
    for item_in in txn_in.items:
        # Resolve item details from Shoper9 Itemmaster by stock_no
        item_name = item_in.descr or "Unknown Item"
        item_brand = "SMRITI"
        
        if item_in.stock_no:
            legacy_res = await db.execute(
                select(Itemmaster).where(Itemmaster.stockno == item_in.stock_no)
            )
            legacy_item = legacy_res.scalar_one_or_none()
            if legacy_item:
                item_name = legacy_item.itemdesc or item_name
                item_brand = legacy_item.class1cd or item_brand
                
                # STOCK CHECKING LOGIC
                if stock_action in ["Block", "Warn"]:
                    stock_qty = await db.scalar(
                        select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == item_in.stock_no)
                    )
                    if (stock_qty or 0) < item_in.qty:
                        if stock_action == "Block":
                            raise HTTPException(
                                status_code=400, 
                                detail=f"Stock for '{item_in.stock_no}' is insufficient (Available: {stock_qty or 0}). Blocked by policy."
                            )
                        # "Warn" can be handled by adding a flag to the response or logging it
                        # Here we just log it for the sovereign audit trail
                        print(f"WARNING: Out of stock for {item_in.stock_no} (Store: {store_id})")
        
        # ── GST COMPLIANCE INTEGRATION ──
        # Formula parity with Shoper9 logic (Inclusive vs Exclusive)
        tax_info = await TaxService.get_item_tax_info(db, item_in.stock_no, txn_in.customer_id)
        
        line_gross_paise = int(item_in.qty * item_in.unit_price)
        line_disc_paise = int(Decimal(str(line_gross_paise * (item_in.discount_per / 100))).quantize(Decimal('1'), rounding=ROUND_HALF_UP))
        line_base_for_tax = line_gross_paise - line_disc_paise
        
        line_tax_paise = 0
        line_tax_details = {}
        
        if "error" not in tax_info:
            is_inc = tax_info.get("is_inclusive", False)
            hsn_code = tax_info.get("hsn_code")
            
            for component in tax_info.get("tax_rates", []):
                rate = component["rate"]
                name = component["name"]
                
                # Calculate tax for this component
                comp_tax = TaxService.calculate_tax(Decimal(line_base_for_tax), rate, is_inc)
                comp_tax_paise = int(comp_tax.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
                
                line_tax_paise += comp_tax_paise
                line_tax_details[name] = comp_tax_paise

        line_net_paise = line_base_for_tax
        if not tax_info.get("is_inclusive", False):
            line_net_paise += line_tax_paise
        
        subtotal += line_gross_paise
        tax_total += line_tax_paise
        disc_total += line_disc_paise
        
        # Create Line Item (Shoper9 parity — no FK dependency)
        new_item = TransactionItem(
            transaction_id=new_txn.id,
            stock_no=item_in.stock_no,
            item_name=item_name,
            item_brand=item_brand,
            qty=item_in.qty,
            mrp=item_in.unit_price,
            discount_per=item_in.discount_per,
            tax_amount=line_tax_paise,
            net_amount=line_net_paise,
            hsn_code=tax_info.get("hsn_code"),
            tax_details=line_tax_details
        )
        new_txn.items.append(new_item)

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
    
    # Return enriched transaction (no joinedload on item — uses denormalized fields)
    stmt = select(Transaction).where(Transaction.id == new_txn.id).options(selectinload(Transaction.items))
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

@router.get("/search")
async def search_bills(
    q: str = Query(..., min_length=2),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Search for historical bills by Bill No or Customer ID."""
    search_term = f"%{q}%"
    stmt = (
        select(Transaction)
        .where(and_(
            Transaction.store_id == current_user.store_id,
            or_(
                Transaction.bill_no.ilike(search_term),
                Transaction.customer_id.ilike(search_term)
            )
        ))
        .options(selectinload(Transaction.items))
        .limit(20)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/day-end/finalize")
async def finalize_day_end(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Sovereign Seal of Day-End."""
    return {"status": "SUCCESS", "message": "[SMRITI-OS] Day End Sealed for " + current_user.store_id}

@router.get("/personnel")
async def get_personnel(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Fetch Active Sales Personnel for the current store from Shoper9."""
    store_id = current_user.store_id
    
    # Shoper9 Logic: activeflag=1 and allowinbilling=1
    # Filtering by vacompcode (Store ID) to fix "Not Matching" issues
    stmt = (
        select(Personnel)
        .where(
            and_(
                Personnel.activeflag == 1, 
                Personnel.allowinbilling == 1,
                Personnel.vacompcode == store_id
            )
        )
        .order_by(Personnel.nm)
    )
    
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    # If no store-specific personnel, fallback to all active personnel (common in some setups)
    if not rows:
        result = await db.execute(
            select(Personnel)
            .where(and_(Personnel.activeflag == 1, Personnel.allowinbilling == 1))
            .limit(50)
        )
        rows = result.scalars().all()

    return [{"id": r.code.strip(), "name": (r.nm or "").strip().upper(), "code": r.code.strip()} for r in rows]

@router.get("/paymodes")
async def get_paymodes(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Fetch Active Payment Modes from Shoper9."""
    result = await db.execute(select(Pospaymodes).order_by(Pospaymodes.pospaymodenm))
    rows = result.scalars().all()
    return [{"id": r.pospaymodecd, "name": r.pospaymodenm, "type": r.paymodetype} for r in rows]

@router.post("/calculate-promos")
async def calculate_promos(
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Evaluate potential discounts for the current cart."""
    items = [i.model_dump() for i in txn_in.items]
    gross_total = sum(i['qty'] * i['unit_price'] for i in items)
    
    result = await PromoService.evaluate_promotions(db, items, Decimal(gross_total) / 100)
    
    # Convert Decimals to Float/Int for JSON
    return {
        "applied_promos": result["applied_promos"],
        "item_discounts": {k: float(v["amount"]) for k, v in result["item_discounts"].items()},
        "bill_discount": float(result["bill_discount"])
    }
