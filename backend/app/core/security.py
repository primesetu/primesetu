# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
security.py - Supabase JWT verification & RBAC dependency

Usage in any route:
    from app.core.security import require_auth, require_role

    @app.get("/api/v1/products")
    async def list_products(current_user: CurrentUser = Depends(require_auth)):
        ...

    @app.delete("/api/v1/products/{id}")
    async def delete_product(product_id: int, current_user: CurrentUser = Depends(require_role("manager"))):
        ...
"""

import os
import jwt
from dataclasses import dataclass
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

# .. Bearer token extractor ....................................................
_bearer = HTTPBearer(auto_error=True)
_bearer_optional = HTTPBearer(auto_error=False)  # returns None instead of 401

# .. Typed user context ........................................................
@dataclass
class CurrentUser:
    user_id: str        # Supabase auth.users.id (UUID)
    store_id: str       # From user_metadata
    email: str
    role: str           # cashier | manager | admin
    full_name: Optional[str] = None


# .. Core JWT verifier .........................................................
def _decode_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT.

    Supabase signs JWTs with SUPABASE_JWT_SECRET (HS256).
    The token payload contains:
        sub          . user UUID
        email        . user email
        user_metadata . { store_id, role, full_name }
        exp          . expiry (verified automatically)
    """
    # Prefer settings (loaded from .env via pydantic), fallback to raw env
    secret = settings.supabase_jwt_secret or os.environ.get("SUPABASE_JWT_SECRET") or settings.jwt_secret
    if not secret:
        raise RuntimeError("[SMRITI-OS] SUPABASE_JWT_SECRET is not set in environment.")

    # Determine which key to use based on algorithm
    try:
        header = jwt.get_unverified_header(token)
        alg = header.get("alg", "HS256")
        kid = header.get("kid")
        print(f"[SMRITI-OS] Auth Pulse - Algorithm: {alg}, KID: {kid}")
        
        if alg == "ES256":
            # Use the project-specific JWK for ES256
            # In a production environment, this should be fetched from Supabase JWKS endpoint
            from jwt.algorithms import ECAlgorithm
            import json
            
            jwk_data = {
                "x": "qzk0p6I1ms-E5BIoJjtm0qe3BdBvDFLh40Q3yAxI6_E",
                "y": "sxRlE-dD7jGBztVOePkk1K6QQGEO6fc-IOUqn_deWiA",
                "alg": "ES256",
                "crv": "P-256",
                "ext": True,
                "kid": "aca8886e-6f54-499f-b417-56fac00fc28d",
                "kty": "EC"
            }
            try:
                verification_key = ECAlgorithm.from_jwk(json.dumps(jwk_data))
            except ValueError as ve:
                print(f"[SMRITI-OS] Security Alert: Invalid ES256 key - {ve}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="[SMRITI-OS] Invalid security token configuration (ES256)."
                )
            except Exception as e:
                print(f"[SMRITI-OS] Security Alert: {str(e)}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="[SMRITI-OS] Could not validate credentials."
                )
        else:
            verification_key = secret

        payload = jwt.decode(
            token,
            verification_key,
            algorithms=["HS256", "ES256"],
            audience="authenticated",
            options={
                "verify_exp": True,
                "verify_aud": True,
                "verify_iss": False # Supabase issuers vary by project ref
            },
        )
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="[SMRITI-OS] Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"[SMRITI-OS] Invalid token ({alg}): {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _build_user(payload: dict) -> CurrentUser:
    """Extract a typed CurrentUser from the decoded JWT payload."""
    meta = payload.get("user_metadata") or {}

    user_id  = payload.get("sub")
    store_id = meta.get("store_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="[SMRITI-OS] Token missing 'sub'.")
    if not store_id:
        # Fallback to "11" for development when store_id is missing from token metadata
        store_id = "11"

    return CurrentUser(
        user_id=user_id,
        store_id=store_id,
        email=payload.get("email", ""),
        role=meta.get("role", "cashier"),
        full_name=meta.get("full_name"),
    )


# .. FastAPI dependencies ......................................................
async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: AsyncSession = Depends(get_db)
) -> CurrentUser:
    """Dependency: any authenticated user. Raises 401 if token is missing/invalid."""
    token = credentials.credentials
    payload = _decode_token(token)
    
    # Try to build user from payload metadata first
    try:
        return _build_user(payload)
    except HTTPException as e:
        if e.status_code == 403:
            # Metadata missing store_id? Try the Sovereign DB lookup
            user_id_str = payload.get("sub")
            if not user_id_str:
                raise e
            
            from app.models import User
            from sqlalchemy import select
            import uuid
            
            try:
                user_uuid = uuid.UUID(user_id_str)
                stmt = select(User).where(User.id == user_uuid)
                result = await db.execute(stmt)
                user_obj = result.scalar_one_or_none()
                
                if user_obj:
                    print(f"[SMRITI-OS] Security: Resolved store_id '{user_obj.store_id}' from DB for user {user_id_str}")
                    return CurrentUser(
                        user_id=user_id_str,
                        store_id=user_obj.store_id,
                        email=user_obj.email,
                        role=user_obj.role,
                        full_name=user_obj.full_name
                    )
            except Exception as db_err:
                print(f"[SMRITI-OS] Security: DB lookup failed for {user_id_str}: {db_err}")
                
        raise e


def require_role(*allowed_roles: str):
    """
    Dependency factory: only users whose role is in allowed_roles may proceed.

    Example:
        Depends(require_role("manager", "admin"))
    """
    async def _check(current_user: CurrentUser = Depends(require_auth)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"[SMRITI-OS] Access denied. "
                    f"Required: {allowed_roles}, you have: '{current_user.role}'."
                ),
            )
        return current_user
    return _check


# .. Role aliases (convenience) ................................................
require_cashier = require_auth                           # any logged-in user
require_manager = require_role("manager", "admin")
require_admin   = require_role("admin")

# .. Optional auth (returns None when no token — for public endpoints) ........
async def optional_auth(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_optional),
    db: AsyncSession = Depends(get_db)
) -> Optional[CurrentUser]:
    """Returns CurrentUser if a valid Bearer token is present, else None."""
    if not credentials:
        return None
    try:
        # Re-use the robust require_auth logic for optional too
        return await require_auth(credentials, db)
    except HTTPException:
        return None

# .. Phase 2 Legacy Aliases ...................................................
UserContext = CurrentUser
get_current_user = optional_auth   # menu.py uses this — optional by default
verify_role = require_role
