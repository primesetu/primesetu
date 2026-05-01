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
from sqlalchemy import select, update
from typing import List, Optional, Dict, Any
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

router = APIRouter(prefix="/config", tags=["configuration"])

# --- UI Field Configuration (AcceptDisplayDtls Parity) ---

@router.get("/legacy-mask/{trn_type}")
async def get_legacy_mask(
    trn_type: int,
    current_user: CurrentUser = Depends(require_auth),
    db: AsyncSession = Depends(get_db)
):
    """
    Fetch the legacy Shoper 9 display mask for a transaction type.
    This bridge allows SMRITI-OS to honor institutional field captions and visibility.
    """
    stmt = select(Acceptdisplaydtls).where(
        Acceptdisplaydtls.store_id == current_user.store_id,
        Acceptdisplaydtls.trntype == trn_type
    ).order_by(Acceptdisplaydtls.disppos)
    
    result = await db.execute(stmt)
    rows = result.scalars().all()
    
    # Map to a standardized format for the frontend SovereignUI
    mask = []
    for row in rows:
        mask.append({
            "field": row.columnname,
            "headerName": row.dispcap or row.acptcap or row.columnname,
            "visible": row.dispvisible,
            "editable": row.acptvisible, # If you can accept it, it's editable
            "width": row.dispwidth * 10 if row.dispwidth else 150, # Scale factor for modern UI
            "align": "left" if row.dispalign == 1 else "right" if row.dispalign == 2 else "center",
            "pos": row.disppos
        })
    
    return mask

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
