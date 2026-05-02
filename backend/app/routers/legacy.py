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
from app.core.security import require_auth, optional_auth, CurrentUser

router = APIRouter(prefix="/api/v1/legacy", tags=["legacy-bridge"])

# Mapping of Shoper 9 Template Operators (from Retail.Gl) to SQL
OPERATOR_MAP = {
    "S01": "=",           # Equal To
    "S02": "!=",          # Not Equal To
    "S03": ">",           # Greater Than
    "S04": ">=",          # Greater than and Equal To
    "S05": "<",           # Less than
    "S06": "<=",          # Less than and Equal to
    "S10": "contains",    # Contains
    "S11": "starts",      # Starts with
    "S12": "ends",        # Ends with
}

@router.get("/tables")
async def list_legacy_tables():
    """Returns a list of all 265+ Shoper 9 tables in the shoper9 schema."""
    tables = []
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
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
    operator_code: str = "S10", # Default to 'Contains'
    db: AsyncSession = Depends(get_db)
):
    """
    Universal Shoper 9 Data Reader with Template-Based Search.
    Uses VACompCode for multi-tenant isolation if present.
    """
    # 1. Resolve Model
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
            
    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    # 2. Build Query
    query = select(target_model)

    # 3. Apply Search Filter based on Shoper 9 Codes (Retail.Gl)
    if search_col and search_val:
        if hasattr(target_model, search_col):
            col_attr = getattr(target_model, search_col)
            op = OPERATOR_MAP.get(operator_code, "contains")
            
            if op == "=": query = query.where(col_attr == search_val)
            elif op == "!=": query = query.where(col_attr != search_val)
            elif op == ">": query = query.where(col_attr > search_val)
            elif op == ">=": query = query.where(col_attr >= search_val)
            elif op == "<": query = query.where(col_attr < search_val)
            elif op == "<=": query = query.where(col_attr <= search_val)
            elif op == "starts": query = query.where(col_attr.ilike(f"{search_val}%"))
            elif op == "ends": query = query.where(col_attr.ilike(f"%{search_val}"))
            else: query = query.where(col_attr.ilike(f"%{search_val}%")) # Contains

    # 4. Total Count
    count_query = select(func.count()).select_from(target_model)
    total_count = await db.scalar(count_query)

    # 5. Fetch Data
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    rows = result.scalars().all()

    # 6. Serialise
    data = []
    for row in rows:
        row_dict = {}
        for column in target_model.__table__.columns:
            row_dict[column.name] = getattr(row, column.name)
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
    """Universal Schema Inspector."""
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
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

@router.patch("/{table_name}/{row_id}")
async def update_legacy_table_data(
    table_name: str,
    row_id: str,
    payload: Dict[str, Any],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Universal Dynamic Writer for all Shoper 9 Legacy Tables.
    Enforces Store Isolation (RLS).
    """
    # 1. Resolve Model
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
    if not target_model:
        for attr_name in dir(sys_models):
            attr = getattr(sys_models, attr_name)
            if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
                target_model = attr
                break

    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    # 2. Fetch Row (with store isolation)
    stmt = select(target_model).where(
        target_model.id == row_id,
        target_model.store_id == current_user.store_id
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(status_code=404, detail="Record not found or access denied.")

    # 3. Update Columns
    for key, value in payload.items():
        if hasattr(row, key) and key not in ['id', 'store_id']:
            setattr(row, key, value)

    await db.commit()
    await db.refresh(row)
    
    return {"status": "success", "data": {"id": row_id}}
