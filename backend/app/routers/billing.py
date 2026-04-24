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
from sqlalchemy import select, func
from backend.app.core.database import get_db
from backend.app.models.base import Transaction, TransactionItem, Product, Inventory, SalesSlip, SalesSlipItem
from backend.app.schemas.billing import BillCreate, BillResponse, SlipCreate, SlipResponse
from typing import List, Optional
import random
import string
import uuid
from datetime import datetime
from backend.app.services.messenger import SovereignMessenger

from backend.app.core.security import get_current_user, UserContext

router = APIRouter()

async def adjust_inventory(db: AsyncSession, store_id: str, product_id: uuid.UUID, qty: float, tx_type: str):
    """
    Atomic stock adjustment helper. 
    Sales decrease stock; Returns/AuditAdjustments increase stock.
    """
    stmt = select(Inventory).where(Inventory.product_id == product_id, Inventory.store_id == store_id)
    inv = (await db.execute(stmt)).scalar_one_or_none()
    
    if not inv:
        inv = Inventory(id=uuid.uuid4(), product_id=product_id, store_id=store_id, quantity=0)
        db.add(inv)
    
    from decimal import Decimal
    qty_dec = Decimal(str(qty))
    if tx_type == "Sales":
        inv.quantity -= qty_dec
    else:
        inv.quantity += qty_dec

@router.post("/finalize", response_model=BillResponse)
async def finalize_bill(
    bill_data: BillCreate, 
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Commit a transaction to the Sovereign Ledger.
    Handles inventory adjustment and multi-mode payment staging.
    """
    try:
        prefix = "B-" if bill_data.type == "Sales" else "SR-"
        bill_no = f"{prefix}{datetime.now().strftime('%y%m%d')}-{''.join(random.choices(string.ascii_uppercase + string.digits, k=4))}"
        
        transaction = Transaction(
            id=uuid.uuid4(),
            bill_no=bill_no,
            store_id=current_user.store_id,
            type=bill_data.type,
            payments=[p.dict() for p in bill_data.payments] if bill_data.payments else None,
            status="Finalized",
            subtotal=0.0,
            net_payable=0.0,
            tax_total=0.0
        )
        db.add(transaction)
        await db.flush()

        total_net = 0.0
        for item_in in bill_data.items:
            product = await db.get(Product, item_in.product_id)
            if not product:
                raise HTTPException(status_code=404, detail=f"Item {item_in.product_id} not found")
            
            # 1. Update Stock levels
            await adjust_inventory(db, current_user.store_id, product.id, item_in.qty, bill_data.type)
            
            # 2. Record Line Item
            item_net = item_in.qty * item_in.unit_price
            db.add(TransactionItem(
                id=uuid.uuid4(),
                transaction_id=transaction.id,
                product_id=product.id,
                qty=item_in.qty,
                mrp=product.mrp,
                net_amount=item_net
            ))
            total_net += item_net

        transaction.net_payable = total_net
        transaction.subtotal = total_net / 1.18 # Assume 18% inclusive for demo
        transaction.tax_total = total_net - transaction.subtotal
        
        await db.commit()
        
        response_data = BillResponse(status="success", bill_number=bill_no, transaction_id=transaction.id, total=total_net)
        
        # Dispatch digital receipt if mobile provided
        if bill_data.customer_mobile:
            background_tasks.add_task(
                SovereignMessenger.send_digital_receipt, 
                bill_data.customer_mobile, 
                {"bill_number": bill_no, "total": total_net}
            )
            
        return response_data
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Billing Failure: {str(e)}")

@router.post("/suspend", response_model=BillResponse)
async def suspend_bill(
    bill_data: BillCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Stage a transaction for later finalization."""
    try:
        transaction = Transaction(
            id=uuid.uuid4(),
            store_id=current_user.store_id,
            type="Sales",
            status="Suspended",
            suspended_reason=bill_data.suspended_reason or "Terminal Switch",
            subtotal=sum(i.qty * i.unit_price for i in bill_data.items),
            net_payable=sum(i.qty * i.unit_price for i in bill_data.items)
        )
        db.add(transaction)
        await db.flush()

        for item in bill_data.items:
            db.add(TransactionItem(
                id=uuid.uuid4(),
                transaction_id=transaction.id,
                product_id=item.product_id,
                qty=item.qty,
                mrp=item.unit_price, 
                net_amount=item.qty * item.unit_price
            ))

        await db.commit()
        return BillResponse(status="suspended", transaction_id=transaction.id, total=transaction.net_payable)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search/{bill_no}")
async def get_bill_by_no(
    bill_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Fetch an original finalized transaction by its bill number (used for returns)."""
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Transaction)
        .options(selectinload(Transaction.items).selectinload(TransactionItem.product))
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.bill_no == bill_no)
        .where(Transaction.status == "Finalized")
    )
    tx = (await db.execute(stmt)).scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Bill not found or does not belong to this store.")
        
    return {
        "id": str(tx.id),
        "bill_number": tx.bill_no,
        "customer_mobile": None, # Stubbed
        "created_at": tx.created_at.isoformat(),
        "total": float(tx.net_payable),
        "items": [
            {
                "id": str(item.product.id),
                "qty": float(item.qty),
                "unit_price": float(item.mrp),
                "discount_per": float(item.discount_per),
                "product": {
                    "name": item.product.name,
                    "code": item.product.code,
                    "brand": item.product.brand
                }
            } for item in tx.items if item.product
        ]
    }


@router.get("/suspended")
async def get_suspended_bills(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Retrieve all suspended bills for the active store terminal."""
    from sqlalchemy.orm import selectinload
    stmt = (
        select(Transaction)
        .options(selectinload(Transaction.items).selectinload(TransactionItem.product))
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Suspended")
        .order_by(Transaction.created_at.desc())
    )
    result = await db.execute(stmt)
    transactions = result.scalars().all()
    
    return [
        {
            "id": str(tx.id),
            "suspended_reason": tx.suspended_reason,
            "net_payable": float(tx.net_payable),
            "created_at": tx.created_at.isoformat(),
            "customer_mobile": None, # Stubbed
            "items": [
                {
                    "id": str(item.product.id),
                    "code": item.product.code,
                    "name": item.product.name,
                    "brand": item.product.brand,
                    "category": item.product.category,
                    "qty": float(item.qty),
                    "mrp": float(item.mrp),
                    "discount_per": float(item.discount_per),
                    "tax_rate": float(item.product.tax_rate)
                } for item in tx.items if item.product
            ]
        }
        for tx in transactions
    ]

@router.delete("/suspended/{tx_id}")
async def delete_suspended_bill(
    tx_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Discard a suspended bill from the queue."""
    stmt = select(Transaction).where(Transaction.id == tx_id, Transaction.store_id == current_user.store_id, Transaction.status == "Suspended")
    tx = (await db.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Suspended bill not found")
    
    await db.delete(tx)
    await db.commit()
    return {"status": "success", "message": "Suspended bill discarded"}

@router.post("/suspended/{tx_id}/recall")
async def recall_suspended_bill(
    tx_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """Recall a suspended bill into active cart and remove it from the queue."""
    # For now, it simply deletes it from the queue since the frontend already has the items payload.
    stmt = select(Transaction).where(Transaction.id == tx_id, Transaction.store_id == current_user.store_id, Transaction.status == "Suspended")
    tx = (await db.execute(stmt)).scalar_one_or_none()
    if not tx:
        raise HTTPException(status_code=404, detail="Suspended bill not found")
    
    await db.delete(tx)
    await db.commit()
    return {"status": "success", "message": "Suspended bill recalled"}


@router.get("/day-end-summary")
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign Reconciliation: Fetch today's summary for closure.
    Aggregates data from the active store node only.
    """
    stmt = (
        select(
            func.count(Transaction.id).label("bill_count"),
            func.sum(Transaction.net_payable).label("total_revenue")
        )
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Finalized")
        .where(func.date(Transaction.created_at) == func.current_date())
    )
    res = (await db.execute(stmt)).one()
    
    return {
        "bill_count": res.bill_count or 0,
        "total_revenue": float(res.total_revenue or 0),
        "store_id": current_user.store_id,
        "date": datetime.now().strftime("%Y-%m-%d")
    }
