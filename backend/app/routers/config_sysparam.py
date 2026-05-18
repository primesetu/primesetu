# ============================================================
# SMRITI-OS — /config/sysparam Router
# Serves System Parameter Hub (SystemSettings.tsx)
# Full Shoper9 SysParam parity — 828 configuration points
# ============================================================
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Any, Dict, Optional
import logging

from app.core.database import get_db

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/config/sysparam", tags=["config-sysparam"])

# ── Tenant Resolution ─────────────────────────────────────────────────────────

# Module-level engine cache — created once, reused forever (fixes memory leak)
_registry_engine_cache = None

async def _get_tenant_id(db_name: str) -> str:
    """
    Looks up the UUID tenant_id for a given smriti_* db_name from company_registry.
    Falls back to 'SYSTEM' for smriti_local or unregistered dev nodes.
    Uses a module-level cached engine to avoid creating a new pool per request.
    """
    global _registry_engine_cache
    if not db_name or db_name in ("smriti_local", "smriti_registry"):
        return "SYSTEM"

    from app.core.config import settings
    from sqlalchemy.ext.asyncio import create_async_engine

    if _registry_engine_cache is None:
        base_url = settings.local_database_url.rsplit("/", 1)[0]
        _registry_engine_cache = create_async_engine(
            f"{base_url}/smriti_registry",
            pool_size=2, max_overflow=2
        )
    try:
        async with _registry_engine_cache.connect() as conn:
            res = await conn.execute(text(
                "SELECT tenant_id::text FROM company_registry WHERE db_name = :db"
            ), {"db": db_name})
            row = res.scalar()
            return str(row) if row else "SYSTEM"
    except Exception:
        return "SYSTEM"


# ── GET /config/sysparam/categories ──────────────────────────────────────────

@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db),
    x_company_db: Optional[str] = Header(default=None, alias="X-Company-Db"),
):
    """
    Returns all distinct categories from s9.sysparam with counts.
    Used by SystemSettings sidebar navigation.
    """
    tenant_id = await _get_tenant_id(x_company_db or "smriti_local")
    result = await db.execute(text("""
        SELECT
            category,
            catdescr                AS cat_descr,
            COUNT(*)::int           AS count
        FROM s9.sysparam
        WHERE tenant_id = :tid
          AND category  IS NOT NULL
          AND category  != ''
        GROUP BY category, catdescr
        ORDER BY category
    """), {"tid": tenant_id})

    rows = result.mappings().all()
    return [
        {
            "category":  r["category"],
            "cat_descr": r["cat_descr"],
            "count":     r["count"],
        }
        for r in rows
    ]


# ── GET /config/sysparam ─────────────────────────────────────────────────────

@router.get("")
async def get_params(
    category: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    x_company_db: Optional[str] = Header(default=None, alias="X-Company-Db"),
):
    """
    Returns all sysparam rows for a given category (or all if none specified).
    Maps legacy s9.sysparam columns to the SysParam TypeScript interface shape.
    """
    tenant_id = await _get_tenant_id(x_company_db or "smriti_local")

    where_cat = "AND category = :cat" if category else ""
    result = await db.execute(text(f"""
        SELECT
            id              AS origin_id,
            paramcode       AS param_code,
            descr,
            opt             AS opt_type,
            boolean         AS value_bool,
            intg            AS value_int,
            txt             AS value_txt,
            sng             AS value_float,
            cur             AS value_cur,
            category,
            catdescr        AS cat_descr,
            disporder       AS disp_order,
            vauid,
            vactr,
            vatermid,
            vacompcode
        FROM s9.sysparam
        WHERE tenant_id = :tid
          {where_cat}
        ORDER BY disporder NULLS LAST, paramcode
    """), {"tid": tenant_id, "cat": category})

    rows = result.mappings().all()
    params = []
    for r in rows:
        # Determine fixed_type from Fixed column we stored via loader
        opt = (r["opt_type"] or "T").upper()
        b_val = r["value_bool"]
        params.append({
            "origin_id":   r["origin_id"],
            "param_code":  r["param_code"],
            "descr":       r["descr"],
            "opt_type":    opt,
            "value_bool":  bool(b_val) if b_val is not None else False,
            "value_int":   r["value_int"],
            "value_txt":   r["value_txt"],
            "value_float": float(r["value_float"]) if r["value_float"] is not None else None,
            "category":    r["category"],
            "cat_descr":   r["cat_descr"],
            "disp_order":  r["disp_order"],
            "fixed_type":  "Variable",   # legacy CSV Fixed col — default Variable
        })
    return params


# ── PATCH /config/sysparam/{param_code} ──────────────────────────────────────

@router.patch("/{param_code}")
async def update_param(
    param_code: str,
    payload: Dict[str, Any],
    db: AsyncSession = Depends(get_db),
    x_company_db: Optional[str] = Header(default=None, alias="X-Company-Db"),
):
    """
    Update a single sysparam value.
    Writes to the correct column (boolean/intg/txt/sng/cur) based on opt type.
    """
    tenant_id = await _get_tenant_id(x_company_db or "smriti_local")

    # Fetch current row
    res = await db.execute(text("""
        SELECT id, opt FROM s9.sysparam
        WHERE tenant_id = :tid AND paramcode = :pcode
        LIMIT 1
    """), {"tid": tenant_id, "pcode": param_code})
    row = res.mappings().first()

    if not row:
        raise HTTPException(status_code=404, detail=f"Parameter '{param_code}' not found.")

    if "value" not in payload:
        raise HTTPException(status_code=400, detail="Payload must include 'value'.")

    raw = payload["value"]
    opt = (row["opt"] or "T").upper()

    try:
        if opt == "B":
            v = raw if isinstance(raw, bool) else str(raw).lower() in ("true", "1", "yes")
            await db.execute(text("""
                UPDATE s9.sysparam SET boolean = :v
                WHERE tenant_id = :tid AND id = :id
            """), {"v": v, "tid": tenant_id, "id": row["id"]})

        elif opt == "I":
            await db.execute(text("""
                UPDATE s9.sysparam SET intg = :v
                WHERE tenant_id = :tid AND id = :id
            """), {"v": int(raw), "tid": tenant_id, "id": row["id"]})

        elif opt in ("S", "C"):
            val_float = float(raw)
            await db.execute(text("""
                UPDATE s9.sysparam SET sng = :v_float, cur = :v_cur
                WHERE tenant_id = :tid AND id = :id
            """), {"v_float": val_float, "v_cur": val_float, "tid": tenant_id, "id": row["id"]})

        else:   # T / default text
            await db.execute(text("""
                UPDATE s9.sysparam SET txt = :v
                WHERE tenant_id = :tid AND id = :id
            """), {"v": str(raw), "tid": tenant_id, "id": row["id"]})

    except (ValueError, TypeError) as e:
        raise HTTPException(status_code=422, detail=f"Invalid value for opt={opt}: {e}")

    await db.commit()
    return {"status": "saved", "param_code": param_code, "opt": opt, "value": raw}


# ── POST /config/sysparam/import-legacy ──────────────────────────────────────

@router.post("/import-legacy")
async def import_legacy(
    profile: str = Query(default="retail", description="retail | distributor"),
    db: AsyncSession = Depends(get_db),
    x_company_db: Optional[str] = Header(default=None, alias="X-Company-Db"),
):
    """
    Seeds 828 Shoper9 golden defaults from sysparam_golden.csv into s9.sysparam.
    Uses ON CONFLICT DO NOTHING — safe to call multiple times.
    Returns count of inserted vs already-existing rows.
    """
    tenant_id = await _get_tenant_id(x_company_db or "smriti_local")

    # Count before seed
    res_before = await db.execute(text(
        "SELECT COUNT(*) FROM s9.sysparam WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    count_before = res_before.scalar() or 0

    # Run seeder
    from seeds import sysparam_loader
    raw_conn = await db.connection()
    await sysparam_loader.seed_sysparam(raw_conn, tenant_id)
    await db.commit()

    # Count after seed
    res_after = await db.execute(text(
        "SELECT COUNT(*) FROM s9.sysparam WHERE tenant_id = :tid"
    ), {"tid": tenant_id})
    count_after = res_after.scalar() or 0

    inserted  = count_after - count_before
    total     = count_after
    skipped   = total - inserted

    logger.info(f"import-legacy [{profile}] tenant={tenant_id}: inserted={inserted} skipped={skipped} total={total}")

    return {
        "profile":  profile,
        "tenant_id": tenant_id,
        "inserted": inserted,
        "skipped":  skipped,
        "total":    total,
    }
