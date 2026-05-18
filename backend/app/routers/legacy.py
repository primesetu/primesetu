# ============================================================
# SMRITI-OS - Universal Legacy Bridge
# "Bridging 30 Years of Retail History to the Modern Web."
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text, or_, and_, String, cast, DateTime, Date
from datetime import datetime
from typing import List, Optional, Any, Dict
import app.models.legacy_s9 as legacy_models
import app.models.legacy_sys as sys_models
import app.models.sovereign as sovereign_models
from app.core.database import get_db
from app.core.security import require_auth, optional_auth, CurrentUser
import os
import sys
import asyncio

router = APIRouter(prefix="/legacy", tags=["legacy-bridge"])

# Mapping of Shoper 9 Template Operators (from Retail.Gl) to SQL
OPERATOR_MAP = {
    "S01": "=",  # Equal To
    "S02": "!=",  # Not Equal To
    "S03": ">",  # Greater Than
    "S04": ">=",  # Greater than and Equal To
    "S05": "<",  # Less than
    "S06": "<=",  # Less than and Equal to
    "S10": "contains",  # Contains
    "S11": "starts",  # Starts with
    "S12": "ends",  # Ends with
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


@router.post("/migrate/wave1")
async def run_wave1_migration():
    """Trigger the real Wave 1 migration script."""
    script_path = os.path.abspath(
        os.path.join(
            os.path.dirname(__file__), "../../scripts/migrate_wave1_masters.py"
        )
    )

    process = await asyncio.create_subprocess_exec(
        sys.executable,
        script_path,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        raise HTTPException(
            status_code=500, detail=f"Migration failed: {stderr.decode()}"
        )

    return {"status": "success", "output": stdout.decode()}


@router.post("/{table_name}/bulk")
async def bulk_update_legacy_data(
    table_name: str,
    payload: List[Dict[str, Any]],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
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

    mailing_list_fields = [
        "streetaddr",
        "town",
        "postalcd",
        "state",
        "country",
        "locality",
        "mobilephone",
        "email",
    ]

    # 0. Fetch Master Controls
    from app.models.sovereign import SmritiParam
    strict_mode = await db.scalar(select(SmritiParam.value_txt).where(and_(SmritiParam.param_code == 'STRICT_MASTER_MODE', SmritiParam.tenant_id == current_user.tenant_id))) == 'true'
    auto_stock = await db.scalar(select(SmritiParam.value_txt).where(and_(SmritiParam.param_code == 'AUTO_CREATE_STOCK', SmritiParam.tenant_id == current_user.tenant_id))) == 'true'
    
    results = []
    for item in payload:
        # 1. Identify Primary Keys
        pks = [c.name for c in target_model.__table__.primary_key.columns]
        
        # 2. Strict Validation (Optional)
        if table_name.lower() == 'itemmaster' and strict_mode:
            c1 = item.get('class1cd') or item.get('class1')
            c2 = item.get('class2cd') or item.get('class2')
            if c1 and c2:
                # Check GenLookup for Product (RecId 1) and Brand (RecId 2)
                check_c1 = await db.scalar(select(func.count()).select_from(legacy_models.Genlookup).where(legacy_models.Genlookup.recid == 1, legacy_models.Genlookup.code == c1))
                check_c2 = await db.scalar(select(func.count()).select_from(legacy_models.Genlookup).where(legacy_models.Genlookup.recid == 2, legacy_models.Genlookup.code == c2))
                if not check_c1 or not check_c2:
                    raise HTTPException(status_code=400, detail=f"Master Error: Product '{c1}' or Brand '{c2}' is not defined in GenLookup. Define them first or disable STRICT_MASTER_MODE.")

        # 3. Build Filter for finding existing record
        query = select(target_model)
        for pk in pks:
            val = item.get(pk) or item.get(pk.lower()) or item.get(pk.upper())
            if val is None and pk.lower() == 'batchsrlno':
                val = '0' # Assume base batch if missing
                
            if val is not None:
                query = query.where(and_(getattr(target_model, pk) == val, target_model.tenant_id == current_user.tenant_id))
            else:
                # If a PK is missing in payload, we might not be able to find the record
                pass
        
        res = await db.execute(query)
        row = res.scalar_one_or_none()
        
        is_new = False
        if not row:
            is_new = True
            row = target_model()
            # Set all PKs for new record
            for pk in pks:
                val = item.get(pk) or item.get(pk.lower()) or item.get(pk.upper())
                if val is None and pk.lower() == 'batchsrlno':
                    val = '0' # Default for Shoper9
                
                if val is not None:
                    setattr(row, pk, val)
            if hasattr(target_model, 'tenant_id'):
                setattr(row, 'tenant_id', current_user.tenant_id)
            db.add(row)
            
        old_values = {}
        new_values = {}
            
        # 4. Update main fields (Case Insensitive Mapping)
        model_cols = {c.name.lower(): c.name for c in target_model.__table__.columns}
        for k, v in item.items():
            k_lower = k.lower()
            if k_lower in model_cols:
                real_col = model_cols[k_lower]
                if real_col not in pks: # Don't update PKs
                    old_val = getattr(row, real_col)
                    # Simple comparison (convert to string for logging)
                    if str(old_val) != str(v):
                        old_values[real_col] = str(old_val) if old_val is not None else None
                        new_values[real_col] = str(v) if v is not None else None
                        setattr(row, real_col, v)
        
        # 5. Auto-Create StockMaster (Optional)
        if is_new and table_name.lower() == 'itemmaster' and auto_stock:
            stock_row = await db.scalar(select(legacy_models.Stockmaster).where(and_(legacy_models.Stockmaster.stockno == row.stockno, legacy_models.Stockmaster.tenant_id == current_user.tenant_id)))
            if not stock_row:
                new_stock = legacy_models.Stockmaster(stockno=row.stockno, total_stock=0, tenant_id=current_user.tenant_id)
                db.add(new_stock)

        # Handle MailingList if needed
        mail_col = (
            "maillistsrlno"
            if hasattr(row, "maillistsrlno")
            else ("maillstsrlno" if hasattr(row, "maillstsrlno") else None)
        )
        if mail_col:
            m_data = {
                k.lower(): v
                for k, v in item.items()
                if k.lower() in mailing_list_fields
            }
            if m_data:
                m_row = None
                srl_no = getattr(row, mail_col)
                if srl_no:
                    m_res = await db.execute(
                        select(legacy_models.Mailinglist).where(
                            legacy_models.Mailinglist.recno == srl_no
                        )
                    )
                    m_row = m_res.scalar_one_or_none()

                if not m_row:
                    # Get next recno
                    max_rec = (
                        await db.scalar(
                            select(func.max(legacy_models.Mailinglist.recno))
                        )
                        or 0
                    )
                    m_row = legacy_models.Mailinglist(recno=max_rec + 1)
                    db.add(m_row)
                    setattr(row, mail_col, m_row.recno)

                for mk, mv in m_data.items():
                    if hasattr(m_row, mk):
                        old_m_val = getattr(m_row, mk)
                        if old_m_val != mv:
                            old_values[f"mail_{mk}"] = (
                                str(old_m_val) if old_m_val is not None else None
                            )
                            new_values[f"mail_{mk}"] = (
                                str(mv) if mv is not None else None
                            )
                            setattr(m_row, mk, mv)

        # Write Audit Log
        if new_values:
            from app.models.sovereign import SmritiAuditLog

            # Create a string representation of the PK for logging
            row_pk_str = "|".join([str(getattr(row, pk)) for pk in pks])
            audit = SmritiAuditLog(
                entity_type=table_name.upper(),
                entity_id=row_pk_str,
                action="CREATE" if is_new else "UPDATE",
                user_id=current_user.user_id if current_user else "SYSTEM",
                tenant_id=current_user.tenant_id if current_user else "SYSTEM",
                old_value=json.dumps(old_values) if not is_new else None,
                new_value=json.dumps(new_values),
            )
            db.add(audit)
        results.append(True)

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        import traceback

        error_detail = traceback.format_exc()
        print(f"\n[CRITICAL ERROR] Legacy Bulk Update Failed!")
        print(f"Error: {str(e)}")
        print(f"Traceback: {error_detail}")
        raise HTTPException(status_code=500, detail=f"Database Error: {str(e)}")

    return {"status": "success", "count": len(results)}


@router.get("/{table_name}")
async def get_legacy_table_data(
    table_name: str,
    limit: int = Query(100, le=10000),
    offset: int = 0,
    search: Optional[str] = Query(None, alias="search"),
    filters: Optional[str] = Query(None),  # JSON-encoded dict of field:value
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
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
    # 1. Build Filter Clauses
    filter_clauses = []
    
    # Tenant Isolation
    if hasattr(target_model, "tenant_id"):
        filter_clauses.append(
            or_(
                target_model.tenant_id == current_user.tenant_id,
                target_model.tenant_id == 'SYSTEM'
            )
        )

    # JSON Filters
    if filters:
        try:
            import json
            filter_dict = json.loads(filters)
            for k, v in filter_dict.items():
                if hasattr(target_model, k):
                    column_attr = getattr(target_model, k)
                    if isinstance(v, str):
                        is_date_col = "DATE" in str(column_attr.type).upper() or "TIMESTAMP" in str(column_attr.type).upper()
                        clean_v = v
                        op = '=='
                        if v.startswith(('>=', '<=', '>', '<')):
                            op_len = 2 if v.startswith(('>=', '<=')) else 1
                            op = v[:op_len]
                            clean_v = v[op_len:].strip()
                        
                        target_val = clean_v
                        if is_date_col:
                            try:
                                if ' ' in clean_v:
                                    target_val = datetime.strptime(clean_v, "%Y-%m-%d %H:%M:%S")
                                else:
                                    target_val = datetime.fromisoformat(clean_v)
                            except: pass

                        if op == '>=':   filter_clauses.append(column_attr >= target_val)
                        elif op == '<=': filter_clauses.append(column_attr <= target_val)
                        elif op == '>':  filter_clauses.append(column_attr > target_val)
                        elif op == '<':  filter_clauses.append(column_attr < target_val)
                        elif v.startswith('%') or v.endswith('%'):
                            filter_clauses.append(column_attr.ilike(v))
                        else:
                            filter_clauses.append(column_attr == target_val)
                    else:
                        filter_clauses.append(column_attr == v)
        except Exception as e:
            print(f"Filter error: {e}")

    # 2. Apply Search Logic
    search_filters = []
    mail_col_name = (
        "maillistsrlno"
        if hasattr(target_model, "maillistsrlno")
        else ("maillstsrlno" if hasattr(target_model, "maillstsrlno") else None)
    )
    has_mail = mail_col_name is not None
    if search and search != "*":
        target_cols = ["stockno", "itemdesc", "class1cd", "class2cd", "subclass1cd"]
        for col_name in target_cols:
            if hasattr(target_model, col_name):
                column_attr = getattr(target_model, col_name)
                search_filters.append(column_attr.ilike(f"%{search}%"))

        if has_mail:
            for col_name in ["nm", "add1", "city"]:
                if hasattr(legacy_models.Mailinglist, col_name):
                    search_filters.append(getattr(legacy_models.Mailinglist, col_name).ilike(f"%{search}%"))

    # 3. Finalize Base Queries
    if has_mail:
        query = (
            select(target_model, legacy_models.Mailinglist)
            .select_from(target_model)
            .outerjoin(
                legacy_models.Mailinglist, 
                and_(
                    getattr(target_model, mail_col_name) == legacy_models.Mailinglist.recno,
                    or_(
                        legacy_models.Mailinglist.tenant_id == current_user.tenant_id,
                        legacy_models.Mailinglist.tenant_id == 'SYSTEM'
                    )
                )
            )
        )
    else:
        query = select(target_model)

    # Apply Filters to main query
    for clause in filter_clauses:
        query = query.where(clause)
    if search_filters:
        query = query.where(or_(*search_filters))

    # 4. Count Query (Mirroring Filters)
    import time
    from sqlalchemy import func
    start_time = time.time()
    
    count_query = select(func.count()).select_from(target_model)
    for clause in filter_clauses:
        count_query = count_query.where(clause)
    if search_filters:
        count_query = count_query.where(or_(*search_filters))
    
    print(f"[DEBUG] Executing Count Query for {table_name}...")
    total_res = await db.execute(count_query)
    total_count = total_res.scalar()
    print(f"[DEBUG] Count Query Finished: {total_count} rows (Took {time.time() - start_time:.2f}s)")

    # 5. Fetch Data
    fetch_start = time.time()
    query = query.offset(offset).limit(limit)
    print(f"[DEBUG] Executing Data Query: offset={offset}, limit={limit}")
    
    try:
        result = await db.execute(query)
        all_rows = result.all()
        print(f"[DEBUG] Data Query Finished: Found {len(all_rows)} (Took {time.time() - fetch_start:.2f}s)")
    except Exception as e:
        print(f"[DEBUG] EXECUTION ERROR: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

    data = []
    if has_mail:
        for row, m_row in all_rows:
            d = {c.name: getattr(row, c.name) for c in target_model.__table__.columns}
            if m_row:
                for mc in legacy_models.Mailinglist.__table__.columns:
                    if mc.name not in ["recno", "nm"]:
                        d[mc.name] = getattr(m_row, mc.name)
            data.append(d)
    else:
        for row_tuple in all_rows:
            row = row_tuple[0]
            data.append(
                {c.name: getattr(row, c.name) for c in target_model.__table__.columns}
            )

    return {"table": table_name, "total": total_count, "data": data}


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
            if (
                hasattr(attr, "__tablename__")
                and attr.__tablename__ == table_name.lower()
            ):
                target_model = attr
                break

    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    columns = []
    for column in target_model.__table__.columns:
        columns.append(
            {
                "name": column.name,
                "type": str(column.type),
                "nullable": column.nullable,
                "primary_key": column.primary_key,
            }
        )
    return {"table": table_name, "columns": columns}


@router.patch("/{table_name}/{row_id}")
async def update_legacy_table_data(
    table_name: str,
    row_id: str,
    payload: Dict[str, Any],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db),
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
            if (
                hasattr(attr, "__tablename__")
                and attr.__tablename__ == table_name.lower()
            ):
                target_model = attr
                break

    if not target_model:
        raise HTTPException(status_code=404, detail="Table not found.")

    # 2. Fetch Row (with store isolation and tenant isolation)
    stmt = select(target_model).where(
        and_(
            target_model.id == row_id, 
            target_model.store_id == current_user.store_id,
            target_model.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(stmt)
    row = result.scalar_one_or_none()

    if not row:
        raise HTTPException(
            status_code=404, detail="Record not found or access denied."
        )

    # 3. Update Columns
    for key, value in payload.items():
        if hasattr(row, key) and key not in ["id", "store_id"]:
            setattr(row, key, value)

    await db.commit()
    await db.refresh(row)

    return {"status": "success", "data": {"id": row_id}}


@router.post("/master/{table_name}")
async def upsert_master(
    table_name: str, 
    payload: Dict[str, Any], 
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Generic endpoint to save or update master records in the s9 schema."""
    allowed_tables = ["vendors", "class12combo", "genlookup", "subclass1cat", "subclass2cat"]
    if table_name not in allowed_tables:
        raise HTTPException(status_code=403, detail="Table access restricted")
    
    full_table_name = f"s9.{table_name}"
    
    # Inject Sovereign Identity
    payload["tenant_id"] = current_user.tenant_id
    
    columns = list(payload.keys())
    placeholders = [f":{col}" for col in columns]
    
    # Primary Key Mapping for Conflict Resolution
    pk_map = {
        "vendors": ["code", "tenant_id"],
        "class12combo": ["class1cd", "class2cd", "tenant_id"],
        "genlookup": ["recid", "code", "tenant_id"],
        "subclass1cat": ["class1cd", "class2cd", "subclass1cd", "tenant_id"],
        "subclass2cat": ["class1cd", "class2cd", "subclass2cd", "tenant_id"]
    }
    
    pks = pk_map.get(table_name, ["id"])
    conflict_targets = ", ".join(pks)
    
    update_cols = [col for col in columns if col not in pks]
    update_stmt = ", ".join([f"{col} = EXCLUDED.{col}" for col in update_cols])
    
    # If there's nothing to update (all cols are PKs), just do nothing on conflict
    do_update = f"DO UPDATE SET {update_stmt}" if update_cols else "DO NOTHING"
    
    query = text(f"""
        INSERT INTO {full_table_name} ({', '.join(columns)})
        VALUES ({', '.join(placeholders)})
        ON CONFLICT ({conflict_targets}) 
        {do_update}
    """)
    
    try:
        await db.execute(query, payload)
        await db.commit()
        return {"ok": True, "message": f"Record saved in {table_name}"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{table_name}")
async def delete_legacy_record(
    table_name: str,
    filters: str = Query(...), # JSON encoded PKs
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Safe deletion of master records with referential integrity checks."""
    import json
    filter_dict = json.loads(filters)
    
    # 1. Dependency Checks for Genlookup
    if table_name.lower() == "genlookup":
        recid = filter_dict.get("recid")
        code = filter_dict.get("code")
        
        if recid == 1: # Product
            in_use = await db.scalar(select(func.count()).select_from(legacy_models.Itemmaster).where(legacy_models.Itemmaster.class1cd == code, legacy_models.Itemmaster.tenant_id == current_user.tenant_id))
            if in_use: raise HTTPException(status_code=400, detail=f"Cannot delete Product '{code}': It is linked to {in_use} items.")
            
            in_combo = await db.scalar(select(func.count()).select_from(legacy_models.Class12combo).where(legacy_models.Class12combo.class1cd == code, legacy_models.Class12combo.tenant_id == current_user.tenant_id))
            if in_combo: raise HTTPException(status_code=400, detail=f"Cannot delete Product '{code}': It is used in Class-Brand combinations.")

        elif recid == 2: # Brand
            in_use = await db.scalar(select(func.count()).select_from(legacy_models.Itemmaster).where(legacy_models.Itemmaster.class2cd == code, legacy_models.Itemmaster.tenant_id == current_user.tenant_id))
            if in_use: raise HTTPException(status_code=400, detail=f"Cannot delete Brand '{code}': It is linked to {in_use} items.")

    # 2. Build and Execute Delete
    target_model = None
    for attr_name in dir(legacy_models):
        attr = getattr(legacy_models, attr_name)
        if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
            target_model = attr
            break
            
    if not target_model: raise HTTPException(status_code=404, detail="Table not found.")
    
    from sqlalchemy import delete
    stmt = delete(target_model).where(target_model.tenant_id == current_user.tenant_id)
    for k, v in filter_dict.items():
        if hasattr(target_model, k):
            stmt = stmt.where(getattr(target_model, k) == v)
            
    try:
        await db.execute(stmt)
        await db.commit()
        return {"status": "success", "message": "Record deleted successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")
