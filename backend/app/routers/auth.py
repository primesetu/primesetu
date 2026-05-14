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
auth.py — Local Authentication Router

Provides token issuance for LOCAL_POSTGRES (offline/LAN node) deployments.

Since LOCAL_POSTGRES mode does not have access to Supabase Auth, this endpoint
issues locally-signed JWTs using LOCAL_JWT_SECRET (the node's own secret).

[R1-B] This router replaces the unconditional admin bypass that existed in
       require_auth for LOCAL_POSTGRES mode. Cashiers must now authenticate
       explicitly, receiving a scoped JWT with their actual role.

Endpoints:
  POST /api/v1/auth/local-login   → Authenticates and returns a JWT
  GET  /api/v1/auth/local-status  → Returns current auth mode (public)

Security notes:
  - PIN is compared using secrets.compare_digest to prevent timing attacks.
  - Tokens expire after 8 hours (configurable via LOCAL_TOKEN_EXPIRY_HOURS).
  - The admin PIN must be set via LOCAL_ADMIN_PIN in .env.
    If not set, login is disabled with a clear error — never a silent bypass.
"""

import jwt
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.config import settings
from app.core.database import get_db
from app.core.security import _LOCAL_JWT_SECRET

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# ── Token expiry ─────────────────────────────────────────────────────────────
_TOKEN_EXPIRY_HOURS = 8


# ── Request/Response schemas ─────────────────────────────────────────────────
class LocalLoginRequest(BaseModel):
    """
    Local node login credentials.

    For a single-store offline node:
      - username: cashier ID or 'admin' (matched against local user records if available)
      - pin: the user's PIN (admin PIN from LOCAL_ADMIN_PIN env var for admin account)
      - store_id: optional override (defaults to settings or '11')
    """
    username: str           # 'admin' or cashier email/id
    pin: str                # PIN configured in .env
    store_id: Optional[str] = None


class LocalLoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int         # seconds
    role: str
    store_id: str
    user_id: str


class AuthStatusResponse(BaseModel):
    mode: str               # LOCAL_POSTGRES | CLOUD | SOVEREIGN
    local_auth_enabled: bool
    admin_pin_configured: bool


# ── Helpers ───────────────────────────────────────────────────────────────────
def _issue_local_jwt(
    user_id: str,
    email: str,
    role: str,
    store_id: str,
    full_name: Optional[str] = None,
    tenant_id: str = "SYSTEM",
) -> str:
    """Issue a HS256 JWT signed with LOCAL_JWT_SECRET."""
    now = datetime.now(timezone.utc)
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "store_id": store_id,
        "full_name": full_name or "",
        "tenant_id": tenant_id,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(hours=_TOKEN_EXPIRY_HOURS)).timestamp()),
    }
    return jwt.encode(payload, _LOCAL_JWT_SECRET, algorithm="HS256")


# ── Endpoints ─────────────────────────────────────────────────────────────────
@router.get("/local-status", response_model=AuthStatusResponse)
async def get_auth_status():
    """
    Public endpoint — returns the current authentication mode.
    The frontend uses this to decide whether to show Supabase login or local PIN entry.
    """
    return AuthStatusResponse(
        mode=settings.storage_mode,
        local_auth_enabled=(settings.storage_mode == "LOCAL_POSTGRES"),
        admin_pin_configured=bool(settings.local_admin_pin),
    )


@router.post("/local-login", response_model=LocalLoginResponse)
async def local_login(
    payload: LocalLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Authenticate a user on a LOCAL_POSTGRES node.

    Only available when storage_mode == LOCAL_POSTGRES.
    Uses PIN-based authentication:
      - 'admin' username: validated against LOCAL_ADMIN_PIN env var.
      - Other usernames: validated against the local User table password_hash
        (if the User model gains a password_hash field in future).
        Currently falls through to admin PIN check for all users.

    Issues an 8-hour HS256 JWT signed with LOCAL_JWT_SECRET.

    [MANDATORY HUMAN REVIEW] Any change to this authentication logic
    requires explicit architect sign-off before merge.
    """
    if settings.storage_mode != "LOCAL_POSTGRES":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "[SMRITI-OS] Local login is only available in LOCAL_POSTGRES mode. "
                f"Current mode: {settings.storage_mode}. "
                "Use your Supabase credentials to log in."
            ),
        )

    admin_pin = settings.local_admin_pin
    if not admin_pin:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "[SMRITI-OS] LOCAL_ADMIN_PIN is not configured. "
                "Set LOCAL_ADMIN_PIN in .env (generated by setup wizard) to enable local login. "
                "Do not set a blank PIN in production."
            ),
        )

    # Determine store_id: payload override → settings → default
    store_id = payload.store_id or "11"

    # ── Admin / single-PIN path ───────────────────────────────────────────────
    if payload.username.lower() in ("admin", "owner"):
        # Timing-safe PIN comparison
        if not secrets.compare_digest(payload.pin.strip(), admin_pin.strip()):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="[SMRITI-OS] Invalid PIN. Access denied.",
                headers={"WWW-Authenticate": "Bearer"},
            )
        token = _issue_local_jwt(
            user_id="00000000-0000-0000-0000-000000000001",
            email="admin@smriti.local",
            role="admin",
            store_id=store_id,
            full_name="Store Administrator",
        )
        return LocalLoginResponse(
            access_token=token,
            expires_in=_TOKEN_EXPIRY_HOURS * 3600,
            role="admin",
            store_id=store_id,
            user_id="00000000-0000-0000-0000-000000000001",
        )

    # ── Per-user path: look up User record in local DB ────────────────────────
    # If the User model gains a hashed_pin field in future, validate here.
    # For now: all non-admin users use the admin PIN (single-store offline mode).
    # TODO (R2+): Add hashed_pin to User model and validate per-user PIN here.
    from app.models import User
    import uuid

    user_obj = None
    try:
        # Try to find by email
        result = await db.execute(select(User).where(User.email == payload.username))
        user_obj = result.scalar_one_or_none()
    except Exception:
        pass

    if not user_obj:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"[SMRITI-OS] User '{payload.username}' not found in local records.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate PIN against admin PIN (until per-user PINs are implemented)
    if not secrets.compare_digest(payload.pin.strip(), admin_pin.strip()):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="[SMRITI-OS] Invalid PIN. Access denied.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = _issue_local_jwt(
        user_id=str(user_obj.id),
        email=user_obj.email,
        role=user_obj.role,
        store_id=user_obj.store_id or store_id,
        full_name=user_obj.full_name,
        tenant_id=user_obj.tenant_id,
    )
    return LocalLoginResponse(
        access_token=token,
        expires_in=_TOKEN_EXPIRY_HOURS * 3600,
        role=user_obj.role,
        store_id=user_obj.store_id or store_id,
        user_id=str(user_obj.id),
    )
