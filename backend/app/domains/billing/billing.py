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
from app.models.base import Transaction, TransactionItem, Customer, Till, Partner, LoyaltyLedger, CreditNote, DraftBillItem
from app.schemas.billing import TransactionRead, TransactionCreate, DraftItemCreate
from typing import List, Optional, Dict, Any
from decimal import Decimal, ROUND_HALF_UP
from app.core.security import require_auth, CurrentUser
from app.core.counters import CounterManager
from app.services.config import ConfigService
from app.services.tax_service import TaxService
from app.services.promo_service import PromoService
from app.models.legacy_s9 import Itemmaster, Stockmaster, Personnel, Pospaymodes, Stktrnaddldtls, Stktrnaddlhdr

router = APIRouter(prefix="/api/v1/billing", tags=["billing"])

# ── DRAFTING (xtemp) LOGIC ──

@router.get("/draft", response_model=List[Dict[str, Any]])
async def get_draft_items(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Fetch current session's draft items (Institutional Parity with xtempGrid)."""
    stmt = select(DraftBillItem).where(DraftBillItem.user_id == current_user.id).order_by(DraftBillItem.created_at)
    result = await db.execute(stmt)
    items = result.scalars().all()
    return [{
        "id": str(i.id),
        "StockNo": i.stock_no,
        "ItemDesc": i.item_desc,
        "Qty": float(i.qty),
        "Retail_Price": float(i.retail_price or 0),
        "disc_per": float(i.disc_per),
        "salesman": i.salesman_id
    } for i in items]

@router.post("/draft")
async def add_to_draft(
    item_in: DraftItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Saves an item to the draft table (Immediate Persistence like Shoper9)."""
    new_draft = DraftBillItem(
        user_id=current_user.id,
        stock_no=item_in.StockNo,
        item_desc=item_in.ItemDesc,
        qty=Decimal(str(item_in.Qty)),
        retail_price=Decimal(str(item_in.Retail_Price or 0)),
        disc_per=Decimal(str(item_in.disc_per or 0)),
        salesman_id=item_in.salesman
    )
    db.add(new_draft)
    await db.commit()
    return {"status": "SUCCESS", "id": str(new_draft.id)}

@router.delete("/draft/{item_id}")
async def remove_from_draft(
    item_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Removes a single item from the draft."""
    stmt = select(DraftBillItem).where(and_(DraftBillItem.id == item_id, DraftBillItem.user_id == current_user.id))
    res = await db.execute(stmt)
    item = res.scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()
    return {"status": "SUCCESS"}

@router.delete("/draft/clear")
async def clear_draft(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Clears the entire draft session."""
    from sqlalchemy import delete
    stmt = delete(DraftBillItem).where(DraftBillItem.user_id == current_user.id)
    await db.execute(stmt)
    await db.commit()
    return {"status": "SUCCESS"}

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
    [R2] Finalize a sales transaction.
    Delegates atomic orchestration to BillingService.
    """
    from app.domains.billing.services.billing_service import BillingService
    from app.core.queue_dispatcher import dispatch_task

    store_id = current_user.store_id

    # ── [R2] ATOMIC SERVICE EXECUTION ─────────────────────────────────────
    async with db.begin():
        new_txn = await BillingService.finalize_transaction(
            db=db,
            txn_in=txn_in,
            current_user_id=current_user.id,
            store_id=store_id
        )

    # ── POST-COMMIT: Queue Dispatching ───────────────────────────────────
    if new_txn.customer_id and new_txn.net_payable > 0:
        dispatch_task(
            task_name="app.tasks.billing_tasks.accrue_loyalty",
            queue_name="q_billing_critical",
            routing_key="billing.loyalty.accrue",
            payload={
                "store_id": store_id,
                "partner_id": new_txn.customer_id,
                "sale_id": str(new_txn.id),
                "net_amount_paise": new_txn.net_payable,
                "idempotency_key": str(uuid.uuid4()),
                "task_version": "1.0"
            },
            use_outbox=True
        )

    # Return enriched transaction
    stmt = (
        select(Transaction)
        .where(Transaction.id == new_txn.id)
        .options(selectinload(Transaction.items))
    )
    res = await db.execute(stmt)
    return res.scalar_one()



@router.get("/day-end/summary")
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Institutional Z-Report Data Engine — full payment-mode breakdown."""
    store_id = current_user.store_id

    stats = await db.execute(
        select(
            func.count(Transaction.id).label("bill_count"),
            func.coalesce(func.sum(Transaction.net_payable), 0).label("total_sales"),
            func.coalesce(func.sum(Transaction.tax_total), 0).label("total_tax"),
            func.coalesce(func.sum(Transaction.discount_total), 0).label("total_discounts"),
        ).where(and_(
            Transaction.store_id == store_id,
            Transaction.status == "Finalized",
            func.date(Transaction.created_at) == func.current_date()
        ))
    )
    res = stats.one()

    txn_res = await db.execute(
        select(Transaction.payments).where(and_(
            Transaction.store_id == store_id,
            Transaction.status == "Finalized",
            func.date(Transaction.created_at) == func.current_date()
        ))
    )
    payment_rows = txn_res.scalars().all()

    breakdown: dict = {"CASH": 0, "CARD": 0, "UPI": 0, "CREDIT": 0, "OTHER": 0}
    for pmt in payment_rows:
        if not pmt or not isinstance(pmt, dict):
            continue
        for mode, detail in pmt.items():
            amt = detail.get("amount", 0) if isinstance(detail, dict) else 0
            m = str(mode).upper()
            if "CASH" in m:
                breakdown["CASH"] += amt
            elif any(x in m for x in ["CARD", "DEBIT"]):
                breakdown["CARD"] += amt
            elif any(x in m for x in ["UPI", "WALLET", "QR"]):
                breakdown["UPI"] += amt
            else:
                breakdown["OTHER"] += amt

    returns_res = await db.execute(
        select(func.coalesce(func.sum(Transaction.net_payable), 0)).where(and_(
            Transaction.store_id == store_id,
            Transaction.type == "Return",
            func.date(Transaction.created_at) == func.current_date()
        ))
    )
    total_returns = returns_res.scalar() or 0

    return {
        "bill_count": res.bill_count or 0,
        "total_revenue": float((res.total_sales or 0) / 100),
        "total_tax": float((res.total_tax or 0) / 100),
        "total_discounts": float((res.total_discounts or 0) / 100),
        "total_returns": float(total_returns / 100),
        "cash": float(breakdown["CASH"] / 100),
        "card": float(breakdown["CARD"] / 100),
        "upi": float(breakdown["UPI"] / 100),
        "credit": float(breakdown["CREDIT"] / 100),
        "other": float(breakdown["OTHER"] / 100),
        "status": "Ready for Z-Seal",
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
    declared_cash: float = 0.0,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """
    Sovereign Z-Seal: records declared cash, computes variance,
    writes a permanent audit record to SmritiParam.
    """
    from datetime import date
    today = date.today()
    store_id = current_user.store_id

    summary = await get_day_end_summary(db=db, current_user=current_user)
    system_cash = summary["cash"]
    variance = round(declared_cash - system_cash, 2)

    z_record = {
        "store_id": store_id,
        "z_date": today.isoformat(),
        "sealed_by": str(current_user.id),
        "sealed_at": datetime.utcnow().isoformat(),
        "bill_count": summary["bill_count"],
        "total_revenue": summary["total_revenue"],
        "total_tax": summary["total_tax"],
        "total_returns": summary["total_returns"],
        "cash_system": system_cash,
        "cash_declared": declared_cash,
        "cash_variance": variance,
        "card": summary["card"],
        "upi": summary["upi"],
    }

    from app.models.sovereign import SmritiParam
    db.add(SmritiParam(
        param_code=f"Z_SEAL_{store_id}_{today.isoformat()}",
        descr=f"Day-End Z-Seal for {today.isoformat()}",
        value_txt=str(z_record),
        category="DAY_END"
    ))
    await db.commit()

    return {
        "status": "SEALED",
        "z_number": f"Z-{store_id}-{today.strftime('%Y%m%d')}",
        "variance": variance,
        "message": f"Day sealed for {today.isoformat()}. Cash variance: Rs.{abs(variance):,.2f} {'(Short)' if variance < 0 else '(Excess)' if variance > 0 else '(Balanced)'}",
        "record": z_record,
    }

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
            .limit(50)
        )
        rows = result.scalars().all()

    return [{"id": r.code.strip(), "name": (r.nm or "").strip().upper(), "code": r.code.strip()} for r in rows]

@router.get("/paymodes")
async def get_paymodes(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Fetch Active Payment Modes from Shoper9 (sovereign PosPaymodes table, 4 rows)."""
    result = await db.execute(
        select(Pospaymodes)
        .where(Pospaymodes.isenabled.in_([True, 1]))
        .order_by(Pospaymodes.paymodetype)
    )
    rows = result.scalars().all()
    if not rows:
        # Standard 3-mode fallback when PosPaymodes not yet configured
        return [
            {"id": "CASH", "name": "Cash",       "type": 1},
            {"id": "CARD", "name": "Card/Debit", "type": 2},
            {"id": "UPI",  "name": "UPI",        "type": 4},
        ]
    return [{"id": r.paymodecode, "name": r.paymodecode, "type": r.paymodetype} for r in rows]

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
    return {
        "applied_promos": result["applied_promos"],
        "item_discounts": {k: float(v["amount"]) for k, v in result["item_discounts"].items()},
        "bill_discount": float(result["bill_discount"])
    }


@router.get("/settlement/{ctrl_no}")
async def get_bill_settlement(
    ctrl_no: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth),
):
    """
    Sovereign Settlement Audit: returns StkTrnAddlDtls rows for a given bill.
    Shows exactly how a bill was paid (cash, card, UPI, split) with auth codes.
    """
    stmt = (
        select(Stktrnaddldtls)
        .where(
            and_(
                Stktrnaddldtls.trntype == 2100,
                Stktrnaddldtls.trnctrlno == ctrl_no,
            )
        )
        .order_by(Stktrnaddldtls.entsrlno)
    )
    rows = (await db.execute(stmt)).scalars().all()

    PAYMODE_NAMES = {1: "CASH", 2: "CARD", 3: "CHEQUE", 4: "UPI", 5: "GIFT_VOUCHER"}
    return [{
        "seq":       r.entsrlno,
        "paymode":   PAYMODE_NAMES.get(r.type or 1, "OTHER"),
        "code":      r.code,
        "descr":     r.descr,
        "amount":    float(r.amount or 0),
        "ref":       r.othertext,     # AuthCode / UTR No
        "coupon":    r.gvcouponno,    # Gift voucher / loyalty coupon
    } for r in rows]


@router.get("/s9lines/{ctrl_no}")
async def get_s9_bill_lines(
    ctrl_no: int,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth),
):
    """
    Returns Stktrndtls lines for a finalized bill — the sovereign S9 audit ledger.
    Includes MRP snapshot, stock levels at time of sale, GST components.
    """
    stmt = (
        select(Stktrndtls)
        .where(
            and_(
                Stktrndtls.trntype == 2100,
                Stktrndtls.trnctrlno == ctrl_no,
            )
        )
        .order_by(Stktrndtls.entsrlno)
    )
    rows = (await db.execute(stmt)).scalars().all()
    return [{
        "srl":           r.entsrlno,
        "stockno":       r.stockno,
        "qty":           float(r.docqty or 0),
        "rate":          float(r.docentrate or 0),
        "value":         float(r.docentvalue or 0),
        "disc":          float(r.docenttotdisc or 0),
        "tax":           float(r.docenttax or 0),
        "netvalue":      float(r.docentnetvalue or 0),
        "mrp_at_sale":   float(r.itemmrpbilltm or 0),
        "cgst":          float(r.taxcomp1 or 0),
        "sgst":          float(r.taxcomp2 or 0),
        "igst":          float(r.taxcomp3 or 0),
        "salesperson":   r.salespersoncd,
        "cashier":       r.vauid,
        "store":         r.vacompcode,
        "void":          bool(r.docentvoidind),
    } for r in rows]
