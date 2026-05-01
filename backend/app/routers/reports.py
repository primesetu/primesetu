# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Item, ItemStock
from app.core.security import get_current_user, UserContext
from typing import List, Dict, Any, Optional
from app.services.compliance import ComplianceEngine
from fastapi.responses import JSONResponse
import json
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/sales-summary")
async def get_sales_summary(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign Intelligence: Fetches high-level sales KPI data including 
    total revenue, bill count, and a 7-day trailing trend.
    """
    # 1. Get totals
    stmt_totals = (
        select(
            func.count(Transaction.id).label("bills"),
            func.sum(Transaction.net_payable).label("revenue")
        )
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Finalized")
    )
    totals_res = (await db.execute(stmt_totals)).fetchone()
    revenue = float(totals_res.revenue or 0.0)
    bills = int(totals_res.bills or 0)

    # 2. Get 7-day trend (daily amounts)
    seven_days_ago = datetime.now() - timedelta(days=7)
    stmt_trend = (
        select(
            func.date(Transaction.created_at).label("date"),
            func.sum(Transaction.net_payable).label("amount")
        )
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Finalized")
        .where(Transaction.created_at >= seven_days_ago)
        .group_by(func.date(Transaction.created_at))
        .order_by(func.date(Transaction.created_at))
    )
    trend_res = await db.execute(stmt_trend)
    daily = [{"date": row.date.strftime("%Y-%m-%d"), "amount": float(row.amount)} for row in trend_res]

    return {
        "revenue": revenue,
        "bills": bills,
        "daily": daily
    }


@router.get("/sales-by-attribute")
async def get_sales_by_attribute(
    attribute: str = "category", # size, color, brand, category
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign Intelligence: Aggregate sales data by specific product attributes.
    Essential for institutional-grade inventory performance analysis (Shoper9 Parity).
    """
    valid_attributes = ["size", "color", "brand", "category"]
    if attribute not in valid_attributes:
        raise HTTPException(status_code=400, detail=f"Invalid attribute. Use one of: {valid_attributes}")

    # Mapping attribute to model field
    attr_field = getattr(Item, attribute)

    stmt = (
        select(
            attr_field.label("label"),
            func.sum(TransactionItem.qty).label("total_qty"),
            func.sum(TransactionItem.net_amount).label("total_revenue")
        )
        .join(TransactionItem, TransactionItem.product_id == Item.id)
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Finalized")
        .group_by(attr_field)
        .order_by(func.sum(TransactionItem.net_amount).desc())
    )

    result = await db.execute(stmt)
    data = [dict(row._mapping) for row in result]
    
    return {
        "attribute": attribute,
        "data": data,
        "timestamp": datetime.now().isoformat()
    }

@router.get("/compliance/einvoice/{bill_no}")
async def generate_einvoice(
    bill_no: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign Compliance: Generates Government-standard E-Invoice JSON packet.
    Implements the IRP/GSP data schema for institutional retail.
    """
    stmt = (
        select(Transaction)
        .where(Transaction.bill_number == bill_no)
        .where(Transaction.store_id == current_user.store_id)
    )
    result = await db.execute(stmt)
    tx = result.scalar_one_or_none()
    
    if not tx:
        raise HTTPException(status_code=404, detail="Bill signature not found in sovereign ledger.")

    # Store configuration (In Phase 3, this is fetched from 'StoreParams')
    store_config = {
        "gstin": "27AAAAA0000A1Z5",
        "legal_name": "SMRITI-OS Retail Node X01",
        "address": "Digital Sovereign Hub, Mumbai",
        "city": "Mumbai",
        "pincode": "400001",
        "state_code": "27"
    }

    # Data transformation for the Compliance Engine
    bill_data = {
        "bill_no": tx.bill_number,
        "date": tx.created_at,
        "taxable_amount": float(tx.total * 0.8), # Mock calculation
        "cgst": float(tx.total * 0.09),
        "sgst": float(tx.total * 0.09),
        "igst": 0.0,
        "net_amount": float(tx.total),
        "items": []
    }
    
    # Map items for the government payload
    # In Phase 4, we'll iterate through tx.items
    bill_data["items"].append({
        "name": "Sovereign Retail Item",
        "hsn_code": "6403", # Default footwear HSN
        "qty": 1,
        "unit_price": float(tx.total),
        "total_amount": float(tx.total),
        "taxable_amount": float(tx.total * 0.8),
        "tax_rate": 18,
        "cgst": float(tx.total * 0.09),
        "sgst": float(tx.total * 0.09),
        "igst": 0.0,
        "net_amount": float(tx.total)
    })

    packet_json = ComplianceEngine.generate_einvoice_json(bill_data, store_config)
    return JSONResponse(content=json.loads(packet_json))

@router.get("/inventory-valuation")
async def get_inventory_valuation(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Calculates current inventory valuation at Cost and MRP.
    Crucial for institutional audit and insurance.
    """
    # In Item model, we use mrp_paise. We'll use it for valuation.
    stmt_total = (
        select(
            func.sum(Item.mrp_paise * ItemStock.qty_on_hand).label("total_valuation"),
            func.count(Item.id).label("total_skus")
        )
        .join(ItemStock, ItemStock.item_id == Item.id)
        .where(ItemStock.store_id == current_user.store_id)
    )
    result = await db.execute(stmt_total)
    row = result.fetchone()
    total_valuation = float(row.total_valuation or 0.0) / 100.0 if row else 0.0
    total_skus = int(row.total_skus or 0) if row else 0
    
    # Get by category breakdown
    stmt_cat = (
        select(
            Item.category,
            func.sum(Item.mrp_paise * ItemStock.qty_on_hand).label("value")
        )
        .join(ItemStock, ItemStock.item_id == Item.id)
        .where(ItemStock.store_id == current_user.store_id)
        .group_by(Item.category)
        .order_by(func.sum(Item.mrp_paise * ItemStock.qty_on_hand).desc())
    )
    cat_result = await db.execute(stmt_cat)
    by_category = [{"category": row.category or "Uncategorized", "value": float(row.value or 0) / 100.0} for row in cat_result]

    return {
        "total_valuation": total_valuation,
        "total_skus": total_skus,
        "by_category": by_category
    }
