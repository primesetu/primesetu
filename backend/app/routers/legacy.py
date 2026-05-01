# ============================================================
# SMRITI-OS - Universal Legacy Bridge
# "Bridging 30 Years of Retail History to the Modern Web."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from typing import List, Optional, Any, Dict
import app.models.legacy_s9 as legacy_models
import app.models.legacy_sys as sys_models
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser

router = APIRouter(prefix="/api/v1/legacy", tags=["legacy-bridge"])

@router.get("/tables")
async def list_legacy_tables():
    """
    Returns a list of all 294+ Shoper 9 tables available for exploration.
    """
    tables = []
    # Retail tables
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__"):
            tables.append(attr.__tablename__)
    # System tables
    for attr_name in dir(sys_models):
        attr = getattr(sys_models, attr_name)
        if hasattr(attr, "__tablename__"):
            tables.append(attr.__tablename__)
    return sorted(list(set(tables)))

@router.get("/{table_name}")
async def get_legacy_table_data(
    table_name: str,
    limit: int = Query(50, le=500),
    offset: int = 0,
    search_col: Optional[str] = None,
    search_val: Optional[str] = None,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Universal Dynamic Reader for all 294 Shoper 9 Legacy Tables.
    Enforces Store Isolation (RLS) at the API level.
    """
    # 1. Resolve Model from registries
    target_model = None
    # Search Retail
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
    # Search System
    if not target_model:
        for attr_name in dir(sys_models):
            attr = getattr(sys_models, attr_name)
            if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
                target_model = attr
                break
            
    if not target_model:
        raise HTTPException(
            status_code=404,
            detail=f"Legacy table '{table_name}' not found in SMRITI-OS registry."
        )

    # 2. Build Query with Store Isolation
    query = select(target_model).where(target_model.store_id == current_user.store_id)

    # 3. Apply Search Filter if provided
    if search_col and search_val:
        if hasattr(target_model, search_col):
            col_attr = getattr(target_model, search_col)
            query = query.where(col_attr.ilike(f"%{search_val}%"))

    # 4. Total Count
    count_query = select(func.count()).select_from(target_model).where(target_model.store_id == current_user.store_id)
    total_count = await db.scalar(count_query)

    # 5. Fetch Data
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.scalars().all()

    # 6. Serialise (Handling SQLAlchemy objects to Dict)
    data = []
    for row in rows:
        # Convert row to dict, handling UUIDs and Datetimes
        row_dict = {}
        for column in target_model.__table__.columns:
            val = getattr(row, column.name)
            if hasattr(val, 'hex'): # UUID
                val = str(val)
            row_dict[column.name] = val
        data.append(row_dict)

    return {
        "table": table_name,
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "data": data
    }

@router.get("/{table_name}/schema")
async def get_legacy_schema(table_name: str):
    """
    Returns the column structure of a legacy table for dynamic UI generation.
    """
    target_model = None
    # Search Retail
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
    # Search System
    if not target_model:
        for attr_name in dir(sys_models):
            attr = getattr(sys_models, attr_name)
            if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
                target_model = attr
                break
            
    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    columns = []
    for column in target_model.__table__.columns:
        columns.append({
            "name": column.name,
            "type": str(column.type),
            "nullable": column.nullable,
            "primary_key": column.primary_key
        })
        
    return {"table": table_name, "columns": columns}
