# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
security.py — Supabase JWT verification & RBAC dependency

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

# ── Bearer token extractor ────────────────────────────────────────────────────
_bearer = HTTPBearer(auto_error=True)

# ── Typed user context ────────────────────────────────────────────────────────
@dataclass
class CurrentUser:
    user_id: str        # Supabase auth.users.id (UUID)
    store_id: str       # From user_metadata
    email: str
    role: str           # cashier | manager | admin
    full_name: Optional[str] = None


# ── Core JWT verifier ─────────────────────────────────────────────────────────
def _decode_token(token: str) -> dict:
    """
    Decode and verify a Supabase-issued JWT.

    Supabase signs JWTs with SUPABASE_JWT_SECRET (HS256).
    The token payload contains:
        sub          → user UUID
        email        → user email
        user_metadata → { store_id, role, full_name }
        exp          → expiry (verified automatically)
    """
    # Prefer settings (loaded from .env via pydantic), fallback to raw env
    secret = settings.supabase_jwt_secret or os.environ.get("SUPABASE_JWT_SECRET") or settings.jwt_secret
    if not secret:
        raise RuntimeError("[PrimeSetu] SUPABASE_JWT_SECRET is not set in environment.")

    try:
        payload = jwt.decode(
            token,
            secret,
            algorithms=["HS256"],
            audience="authenticated",   # Supabase default audience
            options={"verify_exp": True},
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="[PrimeSetu] Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"[PrimeSetu] Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def _build_user(payload: dict) -> CurrentUser:
    """Extract a typed CurrentUser from the decoded JWT payload."""
    meta = payload.get("user_metadata") or {}

    user_id  = payload.get("sub")
    store_id = meta.get("store_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="[PrimeSetu] Token missing 'sub'.")
    if not store_id:
        raise HTTPException(
            status_code=403,
            detail="[PrimeSetu] User has no store_id in metadata. Contact your administrator.",
        )

    return CurrentUser(
        user_id=user_id,
        store_id=store_id,
        email=payload.get("email", ""),
        role=meta.get("role", "cashier"),
        full_name=meta.get("full_name"),
    )


# ── FastAPI dependencies ──────────────────────────────────────────────────────
async def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
) -> CurrentUser:
    """Dependency: any authenticated user. Raises 401 if token is missing/invalid."""
    payload = _decode_token(credentials.credentials)
    return _build_user(payload)


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
                    f"[PrimeSetu] Access denied. "
                    f"Required: {allowed_roles}, you have: '{current_user.role}'."
                ),
            )
        return current_user
    return _check


# ── Role aliases (convenience) ────────────────────────────────────────────────
require_cashier = require_auth                           # any logged-in user
require_manager = require_role("manager", "admin")
require_admin   = require_role("admin")

# ── Phase 2 Legacy Aliases ───────────────────────────────────────────────────
UserContext = CurrentUser
get_current_user = require_auth
verify_role = require_role
