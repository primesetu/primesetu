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

    TRANSACTION ARCHITECTURE (R2):
      Single db.begin() scope covers:
        counter resolution, Transaction header, TransactionItem rows,
        Stktrndtls rows (S9 ledger), Stktrnaddldtls rows (payment settlement),
        DraftBillItem clear, SmritiIdempotency record.
      Post-commit (asyncio.create_task):
        LoyaltyEngine.accrue(), WhatsApp receipt.

    TRANSITIONAL NOTE: asyncio.create_task post-commit tasks are NOT guaranteed
    to complete if the server exits mid-task. Migration to persistent Celery queue
    is planned for Phase R4. This risk is acceptable for loyalty and WhatsApp
    (non-financial eventual consistency).

    Shoper9 operational sequencing preserved exactly.
    Stktrndtls and Stktrnaddldtls field mappings unchanged.
    """
    import asyncio
    from sqlalchemy import delete, text
    from app.models.idempotency import SmritiIdempotency

    store_id = current_user.store_id

    # ── [R2] SINGLE ATOMIC TRANSACTION ─────────────────────────────────────
    # Pre-flight idempotency check is inside the block.
    # Replay path exits cleanly (empty commit = no-op in PostgreSQL).
    async with db.begin():

        # STEP 0: Idempotency pre-flight
        if txn_in.idempotency_key:
            idem_res = await db.execute(
                select(SmritiIdempotency).where(
                    and_(
                        SmritiIdempotency.key == txn_in.idempotency_key,
                        SmritiIdempotency.store_id == store_id,
                    )
                )
            )
            existing_key = idem_res.scalar_one_or_none()
            if existing_key:
                # Replay: return committed transaction without any new writes.
                replay_stmt = (
                    select(Transaction)
                    .where(Transaction.id == existing_key.transaction_id)
                    .options(selectinload(Transaction.items))
                )
                replay_txn = (await db.execute(replay_stmt)).scalar_one_or_none()
                if replay_txn:
                    return replay_txn
                # Data anomaly: key recorded but transaction missing, fall through.

        # STEP 1: Config (read-only inside transaction)
        stock_action = await ConfigService.get_stock_out_action(db, store_id)

        # STEP 2: Counter resolution (Shoper9 institutional sequencing — unchanged)
        # SELECT FOR UPDATE ensures atomic counter resolution across concurrent tills
        try:
            res = await db.execute(
                text("SELECT number FROM shoper9.genlookup WHERE recid = 101 AND code = '2100' FOR UPDATE")
            )
            current_num = res.scalar()
            if current_num is None:
                raise Exception("Counter missing")
            trn_ctrl_no = current_num + 1
            await db.execute(
                text("UPDATE shoper9.genlookup SET number = :n WHERE recid = 101 AND code = '2100'"),
                {"n": trn_ctrl_no}
            )
        except Exception:
            res = await db.execute(
                text("SELECT COALESCE(MAX(trnctrlno), 0) + 1 FROM shoper9.stktrnhdr WHERE trntype = 2100")
            )
            trn_ctrl_no = res.scalar()
            await db.execute(
                text("UPDATE shoper9.genlookup SET number = :n WHERE recid = 101 AND code = '2100'"),
                {"n": trn_ctrl_no}
            )

        new_bill_no = txn_in.bill_no
        if not new_bill_no:
            new_bill_no = f"B-{store_id}-{trn_ctrl_no}"

        # STEP 3: Transaction header
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

        # STEP 4-5: Items + Stktrndtls rows
        for item_in in txn_in.items:
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
                    if stock_action in ["Block", "Warn"]:
                        stock_qty = await db.scalar(
                            select(func.sum(Stockmaster.curbalqty)).where(
                                Stockmaster.stockno == item_in.stock_no
                            )
                        )
                        if (stock_qty or 0) < item_in.qty:
                            if stock_action == "Block":
                                raise HTTPException(
                                    status_code=400,
                                    detail=f"Stock for '{item_in.stock_no}' is insufficient "
                                           f"(Available: {stock_qty or 0}). Blocked by policy."
                                )
                            print(f"WARNING: Out of stock for {item_in.stock_no} (Store: {store_id})")

            tax_info = await TaxService.get_item_tax_info(db, item_in.stock_no, txn_in.customer_id)

            line_gross_paise = int(item_in.qty * item_in.unit_price)
            line_disc_paise  = int(
                Decimal(str(line_gross_paise * (item_in.discount_per / 100)))
                .quantize(Decimal('1'), rounding=ROUND_HALF_UP)
            )
            line_base_for_tax = line_gross_paise - line_disc_paise
            line_tax_paise    = 0
            line_tax_details  = {}

            if "error" not in tax_info:
                is_inc = tax_info.get("is_inclusive", False)
                for component in tax_info.get("tax_rates", []):
                    rate = component["rate"]
                    name = component["name"]
                    comp_tax = TaxService.calculate_tax(Decimal(line_base_for_tax), rate, is_inc)
                    comp_tax_paise = int(comp_tax.quantize(Decimal('1'), rounding=ROUND_HALF_UP))
                    line_tax_paise += comp_tax_paise
                    line_tax_details[name] = comp_tax_paise

            line_net_paise = line_base_for_tax
            if not tax_info.get("is_inclusive", False):
                line_net_paise += line_tax_paise

            subtotal   += line_gross_paise
            tax_total  += line_tax_paise
            disc_total += line_disc_paise

            new_txn.items.append(TransactionItem(
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
                tax_details=line_tax_details,
            ))

            # Stktrndtls row (S9 sales ledger — field mapping UNCHANGED from pre-R2)
            db.add(Stktrndtls(
                trntype       = 2100,
                trnctrlno     = trn_ctrl_no,
                docnoprefix   = new_bill_no.split("/")[0] if "/" in new_bill_no else new_bill_no,
                docno         = trn_ctrl_no,
                entsrlno      = (txn_in.items.index(item_in) + 1),
                stockno       = item_in.stock_no,
                docqty        = item_in.qty,
                docentrate    = float(item_in.unit_price) / 100,
                docentvalue   = float(line_gross_paise) / 100,
                docenttotdisc = float(line_disc_paise) / 100,
                docenttax     = float(line_tax_paise) / 100,
                docentnetvalue= float(line_net_paise) / 100,
                itemmrpbilltm = float(item_in.unit_price) / 100,
                taxcomp1      = float(line_tax_details.get("CGST", 0)) / 100,
                taxcomp2      = float(line_tax_details.get("SGST", 0)) / 100,
                taxcomp3      = float(line_tax_details.get("IGST", 0)) / 100,
                salespersoncd = txn_in.salesman_id or None,
                vauid         = str(current_user.id),
                vacompcode    = store_id,
                docentvoidind = False,
                tenant_id     = store_id,
            ))

        new_txn.subtotal       = subtotal
        new_txn.tax_total      = tax_total
        new_txn.discount_total = disc_total
        new_txn.net_payable    = subtotal - disc_total
        db.add(new_txn)

        # STEP 6: Payment settlement rows
        # [R2] MOVED INSIDE TRANSACTION (was Commit #2 — now atomic with bill)
        # Stktrnaddldtls field mapping UNCHANGED from pre-R2.
        if txn_in.payments:
            ent_srl = 1
            for payment in txn_in.payments:
                mode_str = str(payment.mode).upper()
                paymode_type = 1
                if any(x in mode_str for x in ["CARD", "DEBIT", "CREDIT"]):
                    paymode_type = 2
                elif any(x in mode_str for x in ["CHEQUE", "CHQ"]):
                    paymode_type = 3
                elif any(x in mode_str for x in ["UPI", "QR", "WALLET"]):
                    paymode_type = 4
                elif "GIFT" in mode_str or "GV" in mode_str:
                    paymode_type = 5

                db.add(Stktrnaddldtls(
                    trntype        = 2100,
                    trnctrlno      = trn_ctrl_no,
                    trndocnoprefix = new_bill_no.split("/")[0] if "/" in new_bill_no else new_bill_no,
                    trndocno       = trn_ctrl_no,
                    entsrlno       = ent_srl,
                    type           = paymode_type,
                    code           = paymode_type,
                    descr          = payment.mode,
                    amount         = payment.amount / 100,
                    netvalue       = payment.amount / 100,
                    othertext      = payment.ref_no or None,
                    vauid          = str(current_user.id),
                    vacompcode     = store_id,
                ))
                ent_srl += 1

        # STEP 7: Draft clear (atomic with bill — no orphan risk)
        # [R2] MOVED INSIDE TRANSACTION (was between Commit #1 and Commit #2)
        await db.execute(
            delete(DraftBillItem).where(DraftBillItem.user_id == current_user.id)
        )

        # STEP 8: Idempotency record (inside transaction — rolls back if bill fails)
        if txn_in.idempotency_key:
            db.add(SmritiIdempotency(
                key=txn_in.idempotency_key,
                store_id=store_id,
                transaction_id=new_txn.id,
                bill_no=new_bill_no,
            ))

    # ── SINGLE COMMIT (auto via async with db.begin()) ──────────────────────
    # All above writes are now committed atomically.

    # ── POST-COMMIT: Queue Dispatching (Phase R4) ───────────────────────────
    # [R4] Critical financial tasks are written to q_billing_critical with Outbox Fallback.
    # [R4] Notifications are written to q_notifications without fallback.

    _txn_id         = new_txn.id
    _net_payable    = new_txn.net_payable
    _bill_no        = new_txn.bill_no
    _customer_id    = txn_in.customer_id
    _salesman_id    = txn_in.salesman_id
    _idempotency_key= str(uuid.uuid4()) # Ideally generated client-side, but this is post-commit UUID

    if _customer_id and _net_payable > 0:
        from app.core.queue_dispatcher import dispatch_task
        
        # 1. Dispatch Loyalty Accrual (Critical - uses SQLite Outbox Fallback)
        dispatch_task(
            task_name="app.tasks.billing_tasks.accrue_loyalty",
            queue_name="q_billing_critical",
            routing_key="billing.loyalty.accrue",
            payload={
                "store_id": store_id,
                "partner_id": _customer_id,
                "sale_id": _txn_id,
                "net_amount_paise": _net_payable,
                "idempotency_key": _idempotency_key,
                "task_version": "1.0"
            },
            use_outbox=True # Critical task
        )
        
        # Note: WhatsApp receipts and tier upgrades are chained and emitted automatically 
        # by the worker upon successful loyalty accrual to preserve exact R2 behavior.

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
