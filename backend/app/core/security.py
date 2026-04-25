# ============================================================
# PrimeSetu — Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

import os
import base64
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from dotenv import load_dotenv
from app.core.config import settings

load_dotenv()

ALGORITHM = "HS256"

# CRITICAL FIX: Set auto_error=False to allow custom bypass logic 
# and avoid automatic 401s when the Authorization header is missing.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token", auto_error=False)

class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "CASHIER"
    store_id: str = "X01"

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> UserContext:
    """
    Decodes the Supabase JWT and returns the user context.
    IN DEVELOPMENT: Bypasses strict verification to unblock UI/UX testing.
    """
    # ------------------------------------------------------------
    # SOVEREIGN BYPASS (Local Development Only)
    # ------------------------------------------------------------
    if settings.environment == "development":
        return UserContext(
            user_id="local-sovereign-admin",
            email="admin@primesetu.io",
            role="OWNER",
            store_id="X01"
        )
    # ------------------------------------------------------------

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sovereign Auth Failed: Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        # If no token and not in dev mode, it's a 401
        raise credentials_exception

    try:
        if not settings.jwt_secret:
            raise HTTPException(status_code=500, detail="JWT_SECRET not configured on server")
            
        payload = None
        
        # Try Method A: Plain String
        try:
            payload = jwt.decode(token, settings.jwt_secret, algorithms=[ALGORITHM], options={"verify_aud": False})
        except JWTError:
            # Try Method B: Base64 Decoded
            try:
                decoded_secret = base64.b64decode(settings.jwt_secret)
                payload = jwt.decode(token, decoded_secret, algorithms=[ALGORITHM], options={"verify_aud": False})
            except Exception:
                pass

        if not payload:
            raise credentials_exception

        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role", "CASHIER")
        store_id = user_metadata.get("store_id", "X01") 
        
        return UserContext(
            user_id=user_id,
            email=payload.get("email"),
            role=role,
            store_id=store_id
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail=f"Sovereign Auth Error: {str(e)}"
        )

def verify_role(required_roles: list[str]):
    async def role_checker(current_user: UserContext = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this operation"
            )
        return current_user
    return role_checker
