"""
returns.py — SMRITI-OS Sales Returns & Exchange Router

Handles the Returns Desk workflow:
  - Lookup original sale by bill_no
  - Validate items and quantities against original sale
  - Issue credit note / cash refund
  - Write negative-quantity Transaction records for audit
  - Reverse stock deduction in Stockmaster
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload
from datetime import datetime
from decimal import Decimal

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.base import Transaction, TransactionItem, Partner, CreditNote, LoyaltyLedger
from app.models.legacy_s9 import Stockmaster, Stktrnhdr, Stktrndtls
from app.domains.billing.services.sequencing_service import SequencingService

router = APIRouter(prefix="/api/v1/returns", tags=["Returns & Exchange"])


@router.get("/lookup/{bill_no}")
async def lookup_original_sale(
    bill_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Lookup an original sale by bill number for the Returns Desk.
    Returns bill header + line items for the operator to select what's being returned.
    """
    stmt = (
        select(Transaction)
        .where(and_(
            Transaction.bill_no == bill_no,
            Transaction.store_id == current_user.store_id,
            Transaction.status == "Finalized",
            Transaction.type == "Sales",
        ))
        .options(selectinload(Transaction.items))
    )
    result = await db.execute(stmt)
    txn = result.scalar_one_or_none()

    if not txn:
        raise HTTPException(
            status_code=404,
            detail=f"Bill '{bill_no}' not found or is not eligible for return."
        )

    return {
        "bill_no": txn.bill_no,
        "bill_date": txn.created_at.isoformat(),
        "customer_id": str(txn.customer_id) if txn.customer_id else None,
        "net_payable": float(txn.net_payable or 0) / 100,
        "items": [
            {
                "line_no": i + 1,
                "stock_no": item.stock_no,
                "item_name": item.item_name,
                "qty_sold": float(item.qty),
                "mrp": float(item.mrp or 0) / 100,
                "discount_per": float(item.discount_per or 0),
                "net_amount": float(item.net_amount or 0) / 100,
                "tax_amount": float(item.tax_amount or 0) / 100,
            }
            for i, item in enumerate(txn.items)
        ],
    }


@router.post("/process")
async def process_return(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Process a return / exchange.

    Payload:
    {
        "original_bill_no": "B-001",
        "return_type": "REFUND" | "EXCHANGE" | "CREDIT_NOTE",
        "reason": "Size issue",
        "items": [
            {"stock_no": "SKU001", "qty": 1, "mrp": 1000}
        ]
    }
    """
    original_bill_no = payload.get("original_bill_no")
    return_type = payload.get("return_type", "CREDIT_NOTE")
    reason = payload.get("reason", "Customer Return")
    return_items = payload.get("items", [])

    if not original_bill_no or not return_items:
        raise HTTPException(status_code=400, detail="original_bill_no and items are required.")

    # Fetch original sale
    stmt = (
        select(Transaction)
        .where(and_(
            Transaction.bill_no == original_bill_no,
            Transaction.store_id == current_user.store_id,
            Transaction.status == "Finalized",
        ))
        .options(selectinload(Transaction.items))
    )
    result = await db.execute(stmt)
    original_txn = result.scalar_one_or_none()

    if not original_txn:
        raise HTTPException(status_code=404, detail=f"Original sale '{original_bill_no}' not found.")

    original_stock_map = {item.stock_no: item for item in original_txn.items}

    # Validate return quantities
    for ri in return_items:
        sku = ri.get("stock_no")
        qty = Decimal(str(ri.get("qty", 0)))
        if sku not in original_stock_map:
            raise HTTPException(status_code=400, detail=f"Item '{sku}' not in original sale.")
        orig = original_stock_map[sku]
        if qty > Decimal(str(orig.qty)):
            raise HTTPException(
                status_code=400,
                detail=f"Return qty {qty} for '{sku}' exceeds sold qty {orig.qty}."
            )

    # Create Return Transaction (negative quantities = Shoper9 convention for UI)
    return_bill_no = f"RET-{original_bill_no}-{uuid.uuid4().hex[:6].upper()}"
    return_total = 0

    # [R1] Fetch new TrnCtrlNo for the legacy tables
    trn_ctrl_no = await SequencingService.get_next_trn_ctrl_no(db)

    return_txn = Transaction(
        id=uuid.uuid4(),
        bill_no=return_bill_no,
        store_id=current_user.store_id,
        type="Return",
        status="Finalized",
        customer_id=original_txn.customer_id,
        cashier_id=current_user.id,
        notes=f"Return of {original_bill_no} | Reason: {reason}",
        payments={"REFUND": {"amount": 0}},
    )

    for ri in return_items:
        sku = ri.get("stock_no")
        qty = Decimal(str(ri.get("qty", 0)))
        orig = original_stock_map[sku]
        line_amount = int(qty * Decimal(str(orig.mrp or 0)))
        return_total += line_amount

        return_item = TransactionItem(
            transaction_id=return_txn.id,
            stock_no=sku,
            item_name=orig.item_name,
            item_brand=orig.item_brand,
            qty=-qty,  # Negative — Shoper9 return convention
            mrp=orig.mrp,
            discount_per=orig.discount_per,
            tax_amount=-int(Decimal(str(orig.tax_amount or 0)) * qty / Decimal(str(orig.qty))),
            net_amount=-line_amount,
        )
        return_txn.items.append(return_item)

        # [R1] Write to legacy Stktrndtls (TrnType = 1300 Sales Return)
        db.add(Stktrndtls(
            trntype       = 1300,
            trnctrlno     = trn_ctrl_no,
            docnoprefix   = return_bill_no.split("-")[0],
            docno         = trn_ctrl_no,
            entsrlno      = len(return_txn.items),
            stockno       = sku,
            docqty        = float(qty),  # In legacy, docqty is positive for returns, trntype dictates direction
            docentrate    = float(orig.mrp or 0) / 100,
            docentvalue   = float(line_amount) / 100,
            docentnetvalue= float(line_amount) / 100,
            vauid         = str(current_user.id),
            vacompcode    = current_user.store_id,
            tenant_id     = current_user.store_id,
        ))

        # Reverse stock deduction
        stock_res = await db.execute(
            select(Stockmaster).where(and_(
                Stockmaster.stockno == sku,
                Stockmaster.vacompcode == current_user.store_id,
            ))
        )
        stock = stock_res.scalar_one_or_none()
        if stock:
            stock.curbalqty = (stock.curbalqty or 0) + float(qty)

    return_txn.subtotal = -return_total
    return_txn.net_payable = -return_total
    return_txn.payments = {"REFUND": {"amount": return_total}}
    db.add(return_txn)

    # [R1] Write to legacy Stktrnhdr (TrnType = 1300 Sales Return)
    db.add(Stktrnhdr(
        trntype       = 1300,
        trnctrlno     = trn_ctrl_no,
        docnoprefix   = return_bill_no.split("-")[0],
        docno         = trn_ctrl_no,
        docdt         = datetime.utcnow().date(),
        doctime       = datetime.utcnow(),
        totdocvalue   = float(return_total) / 100,
        netdocvalue   = float(return_total) / 100,
        vauid         = str(current_user.id),
        vacompcode    = current_user.store_id,
        docvoidind    = False,
        tenant_id     = current_user.store_id,
    ))

    # Issue Credit Note
    import time
    cn = CreditNote(
        store_id=current_user.store_id,
        partner_id=original_txn.customer_id,
        note_no=f"CN-{return_bill_no}",
        original_sale_id=original_txn.id,
        amount_paise=return_total,
        balance_paise=return_total,
        status="Active",
    )
    db.add(cn)

    # Reverse loyalty points if earned on original sale
    if original_txn.customer_id:
        customer = await db.get(Partner, original_txn.customer_id)
        if customer:
            reverse_points = int((return_total / 10000))
            if reverse_points > 0 and customer.loyalty_points >= reverse_points:
                customer.loyalty_points -= reverse_points
                db.add(LoyaltyLedger(
                    store_id=current_user.store_id,
                    partner_id=customer.id,
                    txn_type="reverse",
                    points=-reverse_points,
                    balance=customer.loyalty_points,
                    sale_id=return_txn.id,
                    txn_date=datetime.utcnow().date(),
                ))

    await db.commit()

    return {
        "status": "SUCCESS",
        "return_bill_no": return_bill_no,
        "return_type": return_type,
        "refund_amount": float(return_total / 100),
        "credit_note_id": str(cn.id) if cn else None,
        "message": f"Return processed. Credit Note issued for Rs.{return_total/100:,.2f}",
    }
