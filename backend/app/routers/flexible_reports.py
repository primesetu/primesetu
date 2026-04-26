# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import Transaction, TransactionItem, Item, Department
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/api/v1/reports/flexible", tags=["flexible-reports"])

class FlexibleReportRequest(BaseModel):
    rows: List[str]
    columns: List[str] = []
    values: List[str] = ["qty", "net_amount"]
    filters: Dict[str, Any] = {}

@router.post("/")
async def generate_flexible_report(
    req: FlexibleReportRequest,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Flexible Report Designer Engine: Dynamic Pivot Aggregation.
    Mimics Shoper 9 HO Web 'Flexible Reports' capability.
    """
    store_id = current_user.store_id
    
    # Map dimension names to model attributes
    DIMENSION_MAP = {
        "brand": Item.brand,
        "department": Department.name,
        "hsn": Item.hsn_code,
        "store": Transaction.store_id,
        "month": extract("month", Transaction.created_at),
        "year": extract("year", Transaction.created_at),
    }

    # Map value names to aggregate functions
    VALUE_MAP = {
        "qty": func.sum(TransactionItem.qty),
        "net_amount": func.sum(TransactionItem.net_amount),
        "tax_amount": func.sum(TransactionItem.tax_amount),
        "bills": func.count(Transaction.id.distinct()),
    }

    # Validate inputs
    group_fields = []
    for d in (req.rows + req.columns):
        if d not in DIMENSION_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid dimension: {d}")
        group_fields.append(DIMENSION_MAP[d].label(d))

    agg_fields = []
    for v in req.values:
        if v not in VALUE_MAP:
            raise HTTPException(status_code=400, detail=f"Invalid value metric: {v}")
        agg_fields.append(VALUE_MAP[v].label(v))

    if not group_fields or not agg_fields:
        raise HTTPException(status_code=400, detail="Must provide at least one dimension and one metric.")

    # Construct Dynamic Query
    stmt = (
        select(*(group_fields + agg_fields))
        .join(TransactionItem, TransactionItem.product_id == Item.id)
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .join(Department, Department.id == Item.department_id)
        .where(Transaction.store_id == store_id)
        .where(Transaction.status == "Finalized")
    )

    # Apply Filters
    if req.filters.get("month"):
        stmt = stmt.where(extract("month", Transaction.created_at) == req.filters["month"])
    if req.filters.get("year"):
        stmt = stmt.where(extract("year", Transaction.created_at) == req.filters["year"])

    stmt = stmt.group_by(*(DIMENSION_MAP[d] for d in (req.rows + req.columns)))

    result = await db.execute(stmt)
    data = [dict(row._mapping) for row in result]

    return {
        "metadata": {
            "rows": req.rows,
            "columns": req.columns,
            "values": req.values,
            "count": len(data)
        },
        "data": data
    }
