# ============================================================
# SMRITI-OS — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import StockTransaction, StockTransactionItem, ItemStock
from app.schemas.stock_ledger import StockTransactionCreate, StockTransactionRead

router = APIRouter(prefix="/stock-ledger", tags=["stock-ledger"])

@router.post("/", response_model=StockTransactionRead, status_code=status.HTTP_201_CREATED)
async def create_stock_transaction(
    payload: StockTransactionCreate,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a unified stock transaction (GRN, Transfer, Adjustment).
    Automatically updates ItemStock levels.
    """
    # 1. Create Header
    header = StockTransaction(
        store_id=current_user.store_id,
        doc_no=payload.doc_no,
        txn_type=payload.txn_type,
        from_store=payload.from_store,
        to_store=payload.to_store,
        shoper_recid=payload.shoper_recid
    )
    db.add(header)
    await db.flush()

    # 2. Create Items and Update Stock
    for item_data in payload.items:
        # Create transaction item
        item = StockTransactionItem(
            header_id=header.id,
            item_id=item_data.item_id,
            size=item_data.size,
            colour=item_data.colour,
            qty=item_data.qty,
            unit_cost_paise=item_data.unit_cost_paise
        )
        db.add(item)

        # Update ItemStock (StockMaster parity)
        # Find existing stock entry
        stock_stmt = select(ItemStock).where(
            ItemStock.item_id == item_data.item_id,
            ItemStock.store_id == current_user.store_id,
            ItemStock.size == item_data.size,
            ItemStock.colour == item_data.colour
        )
        stock_result = await db.execute(stock_stmt)
        stock_entry = stock_result.scalar_one_or_none()

        if stock_entry:
            # Update existing
            stock_entry.qty_on_hand += item_data.qty
        else:
            # Create new entry if not exists
            new_stock = ItemStock(
                item_id=item_data.item_id,
                store_id=current_user.store_id,
                size=item_data.size,
                colour=item_data.colour,
                qty_on_hand=item_data.qty
            )
            db.add(new_stock)

    try:
        await db.commit()
        await db.refresh(header)
        return header
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"[SMRITI-OS] Stock transaction failed: {str(e)}"
        )

@router.get("/", response_model=List[StockTransactionRead])
async def list_stock_transactions(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    List all stock transactions for the current store.
    """
    stmt = (
        select(StockTransaction)
        .where(StockTransaction.store_id == current_user.store_id)
        .order_by(StockTransaction.doc_date.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()
