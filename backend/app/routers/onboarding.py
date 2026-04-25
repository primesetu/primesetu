# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import IntegrityError
from app.core.database import get_db
from app.core.config import settings
from app.models import Store, User
from app.schemas import StoreRegistrationRequest
from app.core.security import require_admin
import httpx

router = APIRouter(prefix="/api/v1/onboarding", tags=["onboarding"])

@router.post("/store", status_code=status.HTTP_201_CREATED)
async def onboard_store(
    payload: StoreRegistrationRequest,
    db: AsyncSession = Depends(get_db),
    # Optional: require super admin, for now let's leave it open or require specific token
    # to allow initial bootstrapping
):
    """
    Atomically creates a Store and an Admin user with the correct user_metadata.
    """
    
    # 1. Create the store record in Postgres
    new_store = Store(
        name=payload.store_name,
        code=payload.store_code,
        address=payload.address,
        gstin=payload.gstin,
        phone=payload.phone,
        state_code=payload.state_code
    )
    db.add(new_store)
    
    try:
        await db.flush() # Get store ID
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=400, detail="Store code already exists.")
        
    store_id = new_store.id
    
    # 2. Create the user in Supabase Auth via Admin API
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{settings.supabase_url}/auth/v1/admin/users",
            headers={
                "apikey": settings.supabase_service_role_key,
                "Authorization": f"Bearer {settings.supabase_service_role_key}",
                "Content-Type": "application/json"
            },
            json={
                "email": payload.admin_email,
                "password": payload.admin_password,
                "email_confirm": True,
                "user_metadata": {
                    "store_id": store_id,
                    "role": "admin",
                    "full_name": payload.admin_full_name
                }
            }
        )
        
        if response.status_code != 200:
            await db.rollback()
            err_msg = response.json().get("msg", "Failed to create user in Supabase")
            raise HTTPException(status_code=400, detail=f"Auth error: {err_msg}")
            
        user_data = response.json()
        auth_user_id = user_data["id"]
        
    # 3. Create the user record in Postgres
    new_user = User(
        id=auth_user_id,
        store_id=store_id,
        email=payload.admin_email,
        full_name=payload.admin_full_name,
        role="admin"
    )
    db.add(new_user)
    
    await db.commit()
    await db.refresh(new_store)
    
    return {
        "status": "success",
        "message": f"Store '{payload.store_name}' and admin user created successfully.",
        "store_id": store_id,
        "admin_user_id": auth_user_id
    }
