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

from fastapi import APIRouter, HTTPException, status, Depends, Request
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
    request: Request,
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
    # Usernames that map to LOCAL roles (matched case-insensitively)
    LOCAL_ROLE_MAP = {
        "admin":   "admin",
        "owner":   "admin",
        "manager": "manager",
        "warehouse": "warehouse_manager",
        "wh":      "warehouse_manager",
    }
    mapped_role = LOCAL_ROLE_MAP.get(payload.username.lower())

    ip_address = request.client.host if request.client else "unknown"
    from app.models.sovereign import SmritiAuthAttempt
    import logging
    logger = logging.getLogger("smriti.auth")

    # 1. Check if locked out
    attempt_record = await db.scalar(
        select(SmritiAuthAttempt).where(
            SmritiAuthAttempt.username == payload.username.lower(),
            SmritiAuthAttempt.ip_address == ip_address
        )
    )
    if attempt_record and attempt_record.locked_until and attempt_record.locked_until > datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"[SMRITI-OS] Account locked until {attempt_record.locked_until.isoformat()} UTC due to too many failed attempts."
        )

    async def _handle_failure():
        nonlocal attempt_record
        if not attempt_record:
            attempt_record = SmritiAuthAttempt(
                username=payload.username.lower(),
                ip_address=ip_address,
                failed_count=1
            )
            db.add(attempt_record)
        else:
            attempt_record.failed_count += 1
            attempt_record.last_attempt_at = datetime.utcnow()
            
            # Apply lockout curve: 3=1m, 5=15m, 10=1h
            if attempt_record.failed_count >= 10:
                attempt_record.locked_until = datetime.utcnow() + timedelta(hours=1)
            elif attempt_record.failed_count >= 5:
                attempt_record.locked_until = datetime.utcnow() + timedelta(minutes=15)
            elif attempt_record.failed_count >= 3:
                attempt_record.locked_until = datetime.utcnow() + timedelta(minutes=1)
                
        await db.commit()
        
        node_id_str = getattr(settings, "node_id", store_id)
        logger.warning(
            f"security_lockout: node_id={node_id_str} username={payload.username.lower()} "
            f"ip={ip_address} failed_count={attempt_record.failed_count}"
        )
        
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="[SMRITI-OS] Invalid PIN. Access denied.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    async def _handle_success():
        if attempt_record:
            attempt_record.failed_count = 0
            attempt_record.locked_until = None
            await db.commit()

    if mapped_role:
        if not secrets.compare_digest(payload.pin.strip(), admin_pin.strip()):
            await _handle_failure()
        
        await _handle_success()
        # Use a stable UUID per role so audit logs are consistent
        import uuid
        node_id_str = getattr(settings, "node_id", store_id)
        user_uuid = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{node_id_str}-{mapped_role}"))

        ROLE_NAME_MAP = {
            "admin":             "Store Administrator",
            "manager":           "Store Manager",
            "warehouse_manager": "Warehouse Manager",
        }
        token = _issue_local_jwt(
            user_id=user_uuid,
            email=f"{payload.username.lower()}@smriti.local",
            role=mapped_role,
            store_id=store_id,
            full_name=ROLE_NAME_MAP[mapped_role],
        )
        return LocalLoginResponse(
            access_token=token,
            expires_in=_TOKEN_EXPIRY_HOURS * 3600,
            role=mapped_role,
            store_id=store_id,
            user_id=user_uuid,
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
        await _handle_failure()
        
    await _handle_success()

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
