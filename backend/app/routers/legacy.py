# ============================================================
# SMRITI-OS - Universal Legacy Bridge
# "Bridging 30 Years of Retail History to the Modern Web."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, or_, String
from typing import List, Optional, Any, Dict
import app.models.legacy_s9 as legacy_models
import app.models.legacy_sys as sys_models
import app.models.sovereign as sovereign_models
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
    
    for attr_name in dir(sovereign_models):
        attr = getattr(sovereign_models, attr_name)
        if hasattr(attr, "__tablename__"):
            tables.append(attr.__tablename__)
            
    return sorted(list(set(tables)))

@router.post("/{table_name}/bulk")
async def bulk_update_legacy_data(
    table_name: str,
    payload: List[Dict[str, Any]],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Bulk Insert/Update with MailingList awareness."""
    import json
    from datetime import datetime
    
    # 1. Resolve Model
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
            
    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    mailing_list_fields = ["streetaddr", "town", "postalcd", "state", "country", "locality", "mobilephone", "email"]
    
    results = []
    for item in payload:
        # Check if record exists
        pk_val = item.get("code") or item.get("id") or item.get("stockno")
        if not pk_val: continue
        
        # Primary key mapping hack for legacy schemas
        pk_field = "stockno" if hasattr(target_model, "stockno") else ("code" if hasattr(target_model, "code") else "id")
        stmt = select(target_model).where(getattr(target_model, pk_field) == pk_val)
        res = await db.execute(stmt)
        row = res.scalar_one_or_none()
        
        is_new = False
        if not row:
            is_new = True
            row = target_model()
            setattr(row, pk_field, pk_val)
            db.add(row)
            
        old_values = {}
        new_values = {}
            
        # Update main fields
        for k, v in item.items():
            if hasattr(row, k.lower()) and k.lower() not in ["code", "id", "stockno", "maillistsrlno", "maillstsrlno"]:
                old_val = getattr(row, k.lower())
                if old_val != v:
                    old_values[k.lower()] = str(old_val) if old_val is not None else None
                    new_values[k.lower()] = str(v) if v is not None else None
                    setattr(row, k.lower(), v)
        
        # Handle MailingList if needed
        mail_col = "maillistsrlno" if hasattr(row, "maillistsrlno") else ("maillstsrlno" if hasattr(row, "maillstsrlno") else None)
        if mail_col:
            m_data = {k.lower(): v for k, v in item.items() if k.lower() in mailing_list_fields}
            if m_data:
                m_row = None
                srl_no = getattr(row, mail_col)
                if srl_no:
                    m_res = await db.execute(select(legacy_models.Mailinglist).where(legacy_models.Mailinglist.recno == srl_no))
                    m_row = m_res.scalar_one_or_none()
                
                if not m_row:
                    # Get next recno
                    max_rec = await db.scalar(select(func.max(legacy_models.Mailinglist.recno))) or 0
                    m_row = legacy_models.Mailinglist(recno=max_rec + 1)
                    db.add(m_row)
                    setattr(row, mail_col, m_row.recno)
                
                for mk, mv in m_data.items():
                    if hasattr(m_row, mk):
                        old_m_val = getattr(m_row, mk)
                        if old_m_val != mv:
                            old_values[f"mail_{mk}"] = str(old_m_val) if old_m_val is not None else None
                            new_values[f"mail_{mk}"] = str(mv) if mv is not None else None
                            setattr(m_row, mk, mv)
                            
        # Write Audit Log
        if new_values:
            from app.models.sovereign import SmritiAuditLog
            audit = SmritiAuditLog(
                entity_type=table_name.upper(),
                entity_id=str(pk_val),
                action="CREATE" if is_new else "UPDATE",
                user_id=current_user.id if current_user else "SYSTEM",
                old_value=json.dumps(old_values) if not is_new else None,
                new_value=json.dumps(new_values)
            )
            db.add(audit)
                    
        results.append(pk_val)
        
    await db.commit()
    return {"status": "success", "count": len(results)}

@router.get("/{table_name}")
async def get_legacy_table_data(
    table_name: str,
    limit: int = Query(50, le=500),
    offset: int = 0,
    search: Optional[str] = Query(None, alias="search"),
    filters: Optional[str] = Query(None), # JSON-encoded dict of field:value
    db: AsyncSession = Depends(get_db)
):
    """Unified Reader with MailingList integration and Dynamic Filtering."""
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
            
    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    # Build Base Query
    query = select(target_model)
    
    # Auto-join MailingList if applicable
    mail_col_name = "maillistsrlno" if hasattr(target_model, "maillistsrlno") else ("maillstsrlno" if hasattr(target_model, "maillstsrlno") else None)
    has_mail = mail_col_name is not None
    if has_mail:
        mail_attr = getattr(target_model, mail_col_name)
        query = select(target_model, legacy_models.Mailinglist).select_from(target_model).outerjoin(legacy_models.Mailinglist, mail_attr == legacy_models.Mailinglist.recno)

    # 1. Apply Dynamic Filters (Exact Matches)
    if filters:
        try:
            import json
            filter_dict = json.loads(filters)
            for k, v in filter_dict.items():
                if hasattr(target_model, k):
                    query = query.where(getattr(target_model, k) == v)
        except: pass

    # 2. Apply Search Logic (ILike)
    if search and search != "*":
        filters = []
        for column in target_model.__table__.columns:
            if isinstance(column.type, (String, legacy_models.String)) or "CHAR" in str(column.type).upper():
                filters.append(getattr(target_model, column.name).ilike(f"%{search}%"))
        
        if has_mail:
            for column in legacy_models.Mailinglist.__table__.columns:
                if isinstance(column.type, (String, legacy_models.String)) or "CHAR" in str(column.type).upper():
                    filters.append(getattr(legacy_models.Mailinglist, column.name).ilike(f"%{search}%"))
        
        if filters:
            query = query.where(or_(*filters))

    # Fetch
    query = query.offset(offset).limit(limit)
    result = await db.execute(query)
    
    data = []
    if has_mail:
        for row, m_row in result.all():
            d = {c.name: getattr(row, c.name) for c in target_model.__table__.columns}
            if m_row:
                for mc in legacy_models.Mailinglist.__table__.columns:
                    if mc.name not in ["recno", "nm"]: # don't overwrite name if already in main table
                        d[mc.name] = getattr(m_row, mc.name)
            data.append(d)
    else:
        for row in result.scalars().all():
            data.append({c.name: getattr(row, c.name) for c in target_model.__table__.columns})

    return {
        "table": table_name,
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
        for attr_name in dir(sovereign_models):
            attr = getattr(sovereign_models, attr_name)
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
