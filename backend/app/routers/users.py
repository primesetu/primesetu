# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import uuid
import httpx

from app.core.database import get_db
from app.core.config import settings
from app.core.security import require_auth, CurrentUser, require_manager
from app.models import User
from app.schemas.users import UserCreate, UserUpdate, UserResponse

router = APIRouter(prefix="/api/v1/users", tags=["users"])

@router.get("/", response_model=List[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    List all users belonging to the current user's store.
    Managers/Admins can see all store staff.
    """
    query = select(User).where(User.store_id == current_user.store_id)
    result = await db.execute(query)
    users = result.scalars().all()
    return users

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    payload: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    Creates a new personnel/staff user.
    1. Creates user in Supabase Auth (Admin API).
    2. Creates User record in Postgres, bound to the caller's store_id.
    """
    if payload.role == "admin" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create other admins")

    # 1. Create user in Supabase
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.supabase_url}/auth/v1/admin/users",
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json"
            },
            json={
                "email": payload.email,
                "password": payload.password,
                "email_confirm": True,
                "user_metadata": {
                    "store_id": str(current_user.store_id),
                    "role": payload.role,
                    "full_name": payload.full_name
                }
            }
        )
        
        if response.status_code != 200:
            err_msg = response.json().get("msg", "Failed to create user in Supabase")
            raise HTTPException(status_code=400, detail=f"Auth error: {err_msg}")
            
        auth_user_id = response.json()["id"]

    # 2. Save to Postgres
    new_user = User(
        id=auth_user_id,
        store_id=current_user.store_id,
        email=payload.email,
        full_name=payload.full_name,
        role=payload.role,
        active=True
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    return new_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: uuid.UUID,
    payload: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager)
):
    """
    Update personnel details. Can activate/deactivate or change roles.
    """
    result = await db.execute(select(User).where(User.id == user_id, User.store_id == current_user.store_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if payload.role == "admin" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can grant admin roles")
        
    if user.id == current_user.id and payload.active is False:
        raise HTTPException(status_code=400, detail="Cannot deactivate yourself")

    update_meta = False
    new_meta = {}

    if payload.full_name is not None:
        user.full_name = payload.full_name
        new_meta["full_name"] = payload.full_name
        update_meta = True
        
    if payload.role is not None:
        user.role = payload.role
        new_meta["role"] = payload.role
        update_meta = True
        
    if payload.active is not None:
        user.active = payload.active

    # Update metadata in Supabase if role/name changed
    async with httpx.AsyncClient() as client:
        sb_payload = {}
        if update_meta:
            sb_payload["user_metadata"] = new_meta
            
        if sb_payload:
            response = await client.put(
                f"{settings.supabase_url}/auth/v1/admin/users/{user_id}",
                headers={
                    "apikey": settings.supabase_service_role_key,
                    "Authorization": f"Bearer {settings.supabase_service_role_key}",
                    "Content-Type": "application/json"
                },
                json=sb_payload
            )
            if response.status_code != 200:
                raise HTTPException(status_code=400, detail="Failed to sync user metadata to auth provider")

    await db.commit()
    await db.refresh(user)
    return user
