from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from uuid import UUID

from app.core.database import get_db
from app.core.security import CurrentUser, require_auth
from app.models.security import VaGroup, VaGroupPermission, VaGroupMenu, VaUserGroup
from app.schemas.security import VaGroupCreate, VaGroupResponse, VaUserGroupAssign

router = APIRouter(prefix="/api/v1/security", tags=["Dynamic Security Matrix"])

@router.get("/groups", response_model=list[VaGroupResponse])
async def list_groups(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    result = await db.execute(
        select(VaGroup)
        .where(VaGroup.store_id == current_user.store_id)
        .options(selectinload(VaGroup.permissions), selectinload(VaGroup.menus))
    )
    return result.scalars().all()

@router.post("/groups", response_model=VaGroupResponse)
async def create_group(
    payload: VaGroupCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    new_group = VaGroup(
        store_id=current_user.store_id,
        name=payload.name,
        description=payload.description,
        is_active=payload.is_active
    )
    db.add(new_group)
    await db.flush()

    if payload.permissions:
        for p in payload.permissions:
            new_p = VaGroupPermission(
                group_id=new_group.id,
                permission=p.permission,
                is_allowed=p.is_allowed
            )
            db.add(new_p)

    if payload.menus:
        for m in payload.menus:
            new_m = VaGroupMenu(
                group_id=new_group.id,
                menu_id=m.menu_id,
                is_visible=m.is_visible
            )
            db.add(new_m)

    await db.commit()
    
    result = await db.execute(
        select(VaGroup)
        .where(VaGroup.id == new_group.id)
        .options(selectinload(VaGroup.permissions), selectinload(VaGroup.menus))
    )
    return result.scalar_one()

@router.post("/assign", status_code=200)
async def assign_user_to_group(
    payload: VaUserGroupAssign,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    # Verify group belongs to store
    grp = await db.execute(select(VaGroup).where(VaGroup.id == payload.group_id, VaGroup.store_id == current_user.store_id))
    if not grp.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Security Group not found")

    new_assignment = VaUserGroup(
        user_id=payload.user_id,
        group_id=payload.group_id,
        store_id=current_user.store_id
    )
    db.add(new_assignment)
    await db.commit()
    return {"status": "success", "message": "User assigned to security group successfully."}
