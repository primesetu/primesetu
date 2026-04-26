from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime

class VaGroupPermissionCreate(BaseModel):
    permission: str
    is_allowed: bool = False

class VaGroupMenuCreate(BaseModel):
    menu_id: str
    is_visible: bool = True

class VaGroupCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_active: bool = True
    permissions: Optional[List[VaGroupPermissionCreate]] = []
    menus: Optional[List[VaGroupMenuCreate]] = []

class VaGroupPermissionResponse(BaseModel):
    id: UUID
    permission: str
    is_allowed: bool

    class Config:
        from_attributes = True

class VaGroupMenuResponse(BaseModel):
    id: UUID
    menu_id: str
    is_visible: bool

    class Config:
        from_attributes = True

class VaGroupResponse(BaseModel):
    id: UUID
    store_id: UUID
    name: str
    description: Optional[str]
    is_active: bool
    created_at: datetime
    permissions: List[VaGroupPermissionResponse] = []
    menus: List[VaGroupMenuResponse] = []

    class Config:
        from_attributes = True

class VaUserGroupAssign(BaseModel):
    user_id: UUID
    group_id: UUID
