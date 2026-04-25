# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================

"""
tests/test_auth.py — Security middleware tests

Run with:  pytest tests/test_auth.py -v

Uses FastAPI TestClient with mocked Supabase JWT.
"""

import os
import jwt
import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, AsyncMock

# Set a test secret before importing the app
os.environ.setdefault("SUPABASE_JWT_SECRET", "test-secret-do-not-use-in-production")

from app.core.security import _decode_token, _build_user, require_auth, CurrentUser


TEST_SECRET = "test-secret-do-not-use-in-production"


def make_token(
    user_id="user-123",
    store_id="store-abc",
    role="cashier",
    email="test@store.com",
    expired=False,
):
    """Generate a test JWT matching Supabase's structure."""
    import time
    now = int(time.time())
    payload = {
        "sub": user_id,
        "email": email,
        "aud": "authenticated",
        "iat": now,
        "exp": (now - 3600) if expired else (now + 3600),
        "user_metadata": {
            "store_id": store_id,
            "role": role,
            "full_name": "Test User",
        },
    }
    return jwt.encode(payload, TEST_SECRET, algorithm="HS256")


# ── _decode_token ─────────────────────────────────────────────────────────────
class TestDecodeToken:
    def test_valid_token_decoded(self):
        token = make_token()
        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": TEST_SECRET}):
            payload = _decode_token(token)
        assert payload["sub"] == "user-123"
        assert payload["user_metadata"]["store_id"] == "store-abc"

    def test_expired_token_raises_401(self):
        from fastapi import HTTPException
        token = make_token(expired=True)
        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": TEST_SECRET}):
            with pytest.raises(HTTPException) as exc:
                _decode_token(token)
        assert exc.value.status_code == 401
        assert "expired" in exc.value.detail.lower()

    def test_tampered_token_raises_401(self):
        from fastapi import HTTPException
        token = make_token() + "tampered"
        with patch.dict(os.environ, {"SUPABASE_JWT_SECRET": TEST_SECRET}):
            with pytest.raises(HTTPException) as exc:
                _decode_token(token)
        assert exc.value.status_code == 401

    def test_missing_secret_raises_runtime_error(self):
        token = make_token()
        with patch.dict(os.environ, {}, clear=True):
            os.environ.pop("SUPABASE_JWT_SECRET", None)
            with pytest.raises(RuntimeError, match="SUPABASE_JWT_SECRET"):
                _decode_token(token)


# ── _build_user ───────────────────────────────────────────────────────────────
class TestBuildUser:
    def test_valid_payload_builds_user(self):
        payload = {
            "sub": "user-abc",
            "email": "cashier@store.com",
            "user_metadata": {"store_id": "store-xyz", "role": "cashier", "full_name": "John"},
        }
        user = _build_user(payload)
        assert user.user_id  == "user-abc"
        assert user.store_id == "store-xyz"
        assert user.role     == "cashier"

    def test_missing_sub_raises_401(self):
        from fastapi import HTTPException
        payload = {"user_metadata": {"store_id": "store-xyz", "role": "cashier"}}
        with pytest.raises(HTTPException) as exc:
            _build_user(payload)
        assert exc.value.status_code == 401

    def test_missing_store_id_raises_403(self):
        from fastapi import HTTPException
        payload = {
            "sub": "user-abc",
            "email": "cashier@store.com",
            "user_metadata": {"role": "cashier"},
        }
        with pytest.raises(HTTPException) as exc:
            _build_user(payload)
        assert exc.value.status_code == 403
        assert "store_id" in exc.value.detail

    def test_default_role_is_cashier(self):
        payload = {
            "sub": "user-abc",
            "email": "cashier@store.com",
            "user_metadata": {"store_id": "store-xyz"},
        }
        user = _build_user(payload)
        assert user.role == "cashier"


# ── require_role ──────────────────────────────────────────────────────────────
class TestRequireRole:
    def _make_user(self, role):
        return CurrentUser(
            user_id="u1", store_id="s1", email="x@y.com", role=role
        )

    @pytest.mark.asyncio
    async def test_manager_can_access_manager_route(self):
        from app.core.security import require_manager
        user = self._make_user("manager")
        # require_manager calls require_auth internally; we test the role check only
        with patch("app.core.security.require_auth", return_value=user):
            # Should not raise
            result = await require_manager(current_user=user)
        assert result.role == "manager"

    @pytest.mark.asyncio
    async def test_cashier_blocked_from_manager_route(self):
        from fastapi import HTTPException
        from app.core.security import require_role
        check = require_role("manager", "admin")
        user = self._make_user("cashier")
        with pytest.raises(HTTPException) as exc:
            await check(current_user=user)
        assert exc.value.status_code == 403
        assert "cashier" in exc.value.detail

    @pytest.mark.asyncio
    async def test_admin_can_access_admin_route(self):
        from app.core.security import require_role
        check = require_role("admin")
        user = self._make_user("admin")
        result = await check(current_user=user)
        assert result.role == "admin"
