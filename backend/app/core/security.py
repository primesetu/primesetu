# ============================================================
# * PrimeSetu â€” Shoper9-Based Retail OS
# * Zero Cloud Â. Sovereign Â. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * Â(c) 2026 â€” All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

import base64
from backend.app.core.config import settings

# Configuration
# Supabase JWT secrets are often Base64 encoded binary keys.
_raw_secret = settings.jwt_secret
try:
    # If it's a valid 64-byte Base64 string, decode it.
    if len(_raw_secret) >= 88 and _raw_secret.endswith('='):
        JWT_SECRET = base64.b64decode(_raw_secret)
    else:
        JWT_SECRET = _raw_secret
except Exception:
    JWT_SECRET = _raw_secret

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class UserContext(BaseModel):
    user_id: str
    email: Optional[str] = None
    role: str = "CASHIER"
    store_id: str = "X01"

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserContext:
    """
    Decodes the Supabase JWT and returns the user context.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        if not JWT_SECRET:
            raise HTTPException(status_code=500, detail="JWT_SECRET not configured on server")
            
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM], options={"verify_aud": False})
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Supabase stores metadata in 'user_metadata' or 'app_metadata'
        user_metadata = payload.get("user_metadata", {})
        role = user_metadata.get("role", "CASHIER")
        store_id = user_metadata.get("store_id", "X01") # Default to X01 for Phase 2
        
        return UserContext(
            user_id=user_id,
            email=payload.get("email"),
            role=role,
            store_id=store_id
        )
    except JWTError:
        raise credentials_exception
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Auth Error: {str(e)}")

def verify_role(required_roles: list[str]):
    """
    Dependency factory to verify user roles.
    """
    async def role_checker(current_user: UserContext = Depends(get_current_user)):
        if current_user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions for this operation"
            )
        return current_user
    return role_checker
