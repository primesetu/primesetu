# ============================================================
# PrimeSetu — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from typing import List, Optional, Dict, Any
import logging
from uuid import UUID

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models import UIFieldConfig, PrintTemplate, AttributeAlias, CategoryPolicy, Acceptdisplaydtls
from app.schemas.configuration import (
    UIFieldConfigRead, UIFieldConfigBase,
    PrintTemplateRead, PrintTemplateBase,
    AttributeAliasRead, AttributeAliasBase,
    CategoryPolicyRead, CategoryPolicyBase
)

from app.models.sovereign import SmritiAD, SmritiParam, SmritiDocNo

router = APIRouter(prefix="/config", tags=["configuration"])

@router.post("/test-db")
async def test_database_connection(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Test the database connection by executing a simple query.
    This validates that the current credentials and host are reachable.
    """
    from sqlalchemy import text
    try:
        # Check if we can reach the DB and run a simple SELECT
        await db.execute(text("SELECT 1"))
        return {"status": "success", "message": "Database connection verified."}
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Connection failed: {str(e)}"
        )

# --- Sovereign Configuration APIs ---

@router.get("/sovereign-mask/{trn_type}")
async def get_sovereign_mask(
    trn_type: int,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the sovereign display mask (from SmritiAD) for a transaction type.
    Replaces legacy-mask endpoint.
    """
    stmt = select(SmritiAD).where(
        SmritiAD.trntype == trn_type,
        SmritiAD.tenant_id == current_user.tenant_id
    ).order_by(SmritiAD.position)
    
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    mask = []
    for row in rows:
        mask.append({
            "field": row.column_name,
            "headerName": row.dispcap or row.acptcap or row.column_name,
            "visible": row.visible,
            "editable": not row.is_mandatory, # Placeholder logic
            "width": row.width * 10 if row.width else 150,
            "pos": row.position
        })
    
    return mask

@router.get("/sysparam/categories")
async def get_sysparam_categories(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Return distinct categories with param count for UI sidebar."""
    from sqlalchemy import func
    stmt = (
        select(SmritiParam.category, SmritiParam.cat_descr, func.count().label("count"))
        .where(SmritiParam.tenant_id == current_user.tenant_id)
        .group_by(SmritiParam.category, SmritiParam.cat_descr)
        .order_by(SmritiParam.category)
    )
    result = await db.execute(stmt)
    rows = result.all()
    return [{"category": r.category, "cat_descr": r.cat_descr, "count": r.count} for r in rows]


@router.post("/sysparam/import-legacy")
async def import_legacy_sysparams(
    profile: str = "retail",
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Seed all 828 Shoper9 system parameters into SmritiParam.
    Uses bulk INSERT ON CONFLICT DO NOTHING for instant seeding.
    profile: 'retail' (default) or 'distributor'
    """
    import csv, os
    from sqlalchemy import text

    profile_map = {
        "retail": "Retail_tmp.txt",
        "distributor": "Distributor_tmp.txt"
    }
    if profile not in profile_map:
        raise HTTPException(status_code=400, detail="profile must be 'retail' or 'distributor'")

    template_path = os.path.abspath(os.path.join(
        os.path.dirname(__file__),
        "../../../MySkillSet/Templates",
        profile_map[profile]
    ))

    if not os.path.exists(template_path):
        raise HTTPException(status_code=404, detail=f"Template file not found: {template_path}")

    # ── Parse CSV into row dicts ──────────────────────────────
    rows_to_insert = []
    with open(template_path, newline='', encoding='cp1252', errors='replace') as f:
        reader = csv.DictReader(f)
        for row in reader:
            param_code = (row.get("ParamCode") or "").strip()
            if not param_code:
                continue

            opt = (row.get("Opt") or "T").strip().upper()

            value_bool = False
            value_int = 0
            value_txt = None
            value_float = None

            if opt == "B":
                value_bool = (row.get("Boolean", "0").strip() == "1")
            elif opt == "I":
                try: value_int = int(row.get("Intg", "0").strip() or "0")
                except: value_int = 0
            elif opt in ("S", "C"):
                try: value_float = float(row.get("Sng", "0").strip() or "0")
                except: value_float = None
            else:
                value_txt = (row.get("Txt") or "").strip() or None

            try: disp_order = int(row.get("DispOrder", "0") or "0")
            except: disp_order = 0

            rows_to_insert.append({
                "tenant_id": current_user.tenant_id,
                "param_code": param_code,
                "origin_id": (row.get("Id") or "").strip()[:30] or None,
                "descr": (row.get("Descr") or "").strip()[:500] or None,
                "opt_type": opt[:1],
                "value_bool": value_bool,
                "value_int": value_int,
                "value_txt": value_txt,
                "value_float": value_float,
                "category": (row.get("Category") or "").strip()[:100] or None,
                "cat_descr": (row.get("CatDescr") or "").strip()[:255] or None,
                "disp_order": disp_order,
                "fixed_type": (row.get("Fixed") or "Variable").strip()[:20],
            })

    if not rows_to_insert:
        return {"status": "success", "profile": profile, "inserted": 0, "skipped": 0, "total": 0}

    # ── Single bulk INSERT ON CONFLICT DO NOTHING ─────────────
    bulk_sql = text("""
        INSERT INTO smriti_param
            (tenant_id, param_code, origin_id, descr, opt_type,
             value_bool, value_int, value_txt, value_float,
             category, cat_descr, disp_order, fixed_type)
        VALUES
            (:tenant_id, :param_code, :origin_id, :descr, :opt_type,
             :value_bool, :value_int, :value_txt, :value_float,
             :category, :cat_descr, :disp_order, :fixed_type)
        ON CONFLICT (param_code) DO NOTHING
    """)

    result = await db.execute(bulk_sql, rows_to_insert)
    await db.commit()

    inserted = result.rowcount if result.rowcount >= 0 else len(rows_to_insert)
    skipped = len(rows_to_insert) - inserted

    return {
        "status": "success",
        "profile": profile,
        "inserted": inserted,
        "skipped": skipped,
        "total": len(rows_to_insert)
    }


@router.get("/sysparam")
async def get_sovereign_sysparams(
    category: Optional[str] = None,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Fetch sovereign system parameters (SmritiParam)."""
    stmt = select(SmritiParam).where(SmritiParam.tenant_id == current_user.tenant_id)
    if category:
        stmt = stmt.where(SmritiParam.category == category)
    
    result = await db.execute(stmt)
    rows = list(result.scalars().all())

    # Fallback for CompanyName/Code from legacy if missing
    codes = [p.param_code for p in rows]
    if 'CompanyName' not in codes or 'CompanyCode' not in codes:
        try:
            # Query legacy mirror if storage mode allows
            from app.models.legacy_s9 import Sysparam
            legacy_stmt = select(Sysparam).where(
                Sysparam.paramcode.in_(['CompanyName', 'CompanyCode']),
                Sysparam.tenant_id == current_user.tenant_id
            )
            legacy_result = await db.execute(legacy_stmt)
            legacy_rows = legacy_result.scalars().all()
            
            for lr in legacy_rows:
                if lr.paramcode not in codes:
                    rows.append(SmritiParam(
                        param_code=lr.paramcode,
                        descr=lr.descr,
                        value_txt=lr.txt,
                        category='FIRM'
                    ))
        except Exception:
            pass # Avoid crashing if legacy schema is missing or column not found

    return rows

@router.patch("/sysparam/{param_code}")
async def update_sovereign_sysparam(
    param_code: str,
    payload: Dict[str, Any],
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update a specific sovereign system parameter — type-aware."""
    from sqlalchemy import and_
    stmt = select(SmritiParam).where(
        and_(
            SmritiParam.param_code == param_code,
            SmritiParam.tenant_id == current_user.tenant_id
        )
    )
    result = await db.execute(stmt)
    param = result.scalar_one_or_none()
    
    if not param:
        raise HTTPException(status_code=404, detail="Parameter not found.")

    if "value" in payload:
        raw = str(payload["value"])
        opt = (param.opt_type or "T").upper()
        if opt == "B":
            param.value_bool = str(raw).lower() in ("true", "1", "yes", "t")
        elif opt == "I":
            try: param.value_int = int(float(raw))
            except (ValueError, TypeError): 
                logging.error(f"Sysparam {param_code}: Invalid integer '{raw}'")
                param.value_int = 0
        elif opt == "C":
            try: 
                # [MANDATORY] Monetary values MUST be stored as integer paise.
                # value_float is deprecated for currency operations.
                param.value_int = int(round(float(raw) * 100))
                param.value_float = float(raw)
            except (ValueError, TypeError): 
                logging.error(f"Sysparam {param_code}: Invalid currency '{raw}'")
                param.value_int = 0
        elif opt == "S":
            try: param.value_float = float(raw)
            except (ValueError, TypeError): 
                logging.error(f"Sysparam {param_code}: Invalid float '{raw}'")
                param.value_float = None
        else:
            param.value_txt = str(raw)
    
    await db.commit()
    return {
        "status": "success",
        "param": param_code,
        "opt_type": param.opt_type,
        "new_value": {
            "value_bool": param.value_bool,
            "value_int": param.value_int,
            "value_float": param.value_float,
            "value_txt": param.value_txt,
        }
    }


@router.get("/docno/{trn_type}")
async def get_sovereign_docno(
    trn_type: int,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Fetch sovereign document prefix configuration (SmritiDocNo)."""
    stmt = select(SmritiDocNo).where(
        SmritiDocNo.trn_type == trn_type,
        SmritiDocNo.tenant_id == current_user.tenant_id
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/ui-fields/{screen_name}", response_model=List[UIFieldConfigRead])
async def get_ui_field_configs(
    screen_name: str,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Fetch POS field mask/configuration for a specific screen."""
    stmt = select(UIFieldConfig).where(
        UIFieldConfig.store_id == current_user.store_id,
        UIFieldConfig.screen_name == screen_name
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/ui-fields", response_model=UIFieldConfigRead)
async def upsert_ui_field_config(
    payload: UIFieldConfigBase,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update or Create UI field behavior (is_visible, is_mandatory, etc)."""
    stmt = select(UIFieldConfig).where(
        UIFieldConfig.store_id == current_user.store_id,
        UIFieldConfig.screen_name == payload.screen_name,
        UIFieldConfig.field_name == payload.field_name
    )
    result = await db.execute(stmt)
    config = result.scalar_one_or_none()

    if config:
        for key, value in payload.model_dump().items():
            setattr(config, key, value)
    else:
        config = UIFieldConfig(
            store_id=current_user.store_id,
            **payload.model_dump()
        )
        db.add(config)

    await db.commit()
    await db.refresh(config)
    return config
# --- Print Templates (BaseCompTemplate Parity) ---

@router.get("/print-templates", response_model=List[PrintTemplateRead])
async def list_print_templates(
    template_type: Optional[str] = None,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """List available print component templates for the store."""
    stmt = select(PrintTemplate).where(PrintTemplate.store_id == current_user.store_id)
    if template_type:
        stmt = stmt.where(PrintTemplate.template_type == template_type)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/print-templates", response_model=PrintTemplateRead)
async def create_print_template(
    payload: PrintTemplateBase,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Define a new receipt layout component template."""
    if payload.is_default:
# Reset other defaults of same type
        await db.execute(
            update(PrintTemplate)
            .where(
                PrintTemplate.store_id == current_user.store_id,
                PrintTemplate.template_type == payload.template_type
            )
            .values(is_default=False)
        )

    new_template = PrintTemplate(
        store_id=current_user.store_id,
        **payload.model_dump()
    )
    db.add(new_template)
    await db.commit()
    await db.refresh(new_template)
    return new_template
# --- Attribute Aliases (CatalogSettings Parity) ---

@router.get("/attribute-aliases", response_model=List[AttributeAliasRead])
async def list_attribute_aliases(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """List all attribute aliases (Catalogue DNA) for the store."""
    stmt = select(AttributeAlias).where(AttributeAlias.store_id == current_user.store_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/attribute-aliases", response_model=AttributeAliasRead)
async def upsert_attribute_alias(
    payload: AttributeAliasBase,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update or Create an attribute alias (Mapping AnalCode to Real Name)."""
    stmt = select(AttributeAlias).where(
        AttributeAlias.store_id == current_user.store_id,
        AttributeAlias.code_type == payload.code_type,
        AttributeAlias.code_index == payload.code_index
    )
    result = await db.execute(stmt)
    alias = result.scalar_one_or_none()

    if alias:
        for key, value in payload.model_dump().items():
            setattr(alias, key, value)
    else:
        alias = AttributeAlias(
            store_id=current_user.store_id,
            **payload.model_dump()
        )
        db.add(alias)

    await db.commit()
    await db.refresh(alias)
    return alias
# --- Category Policies (Class12Combo & Class12LocWise Parity) ---

@router.get("/category-policies", response_model=List[CategoryPolicyRead])
async def list_category_policies(
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """List all category policies (Pricing/Batch rules) for the store."""
    stmt = select(CategoryPolicy).where(CategoryPolicy.store_id == current_user.store_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/category-policies", response_model=CategoryPolicyRead)
async def upsert_category_policy(
    payload: CategoryPolicyBase,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """Update or Create a category policy (Markup/Batch/Regional rules)."""
    stmt = select(CategoryPolicy).where(
        CategoryPolicy.store_id == current_user.store_id,
        CategoryPolicy.department_id == payload.department_id
    )
    result = await db.execute(stmt)
    policy = result.scalar_one_or_none()

    if policy:
        for key, value in payload.model_dump().items():
            setattr(policy, key, value)
    else:
        policy = CategoryPolicy(
            store_id=current_user.store_id,
            **payload.model_dump()
        )
        db.add(policy)

    await db.commit()
    await db.refresh(policy)
    return policy
