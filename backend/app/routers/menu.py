# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import Mapped, mapped_column
from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from app.core.database import get_db
from app.core.security import get_current_user, UserContext
from app.models.base import Base
from sqlalchemy import String, Integer, Boolean, ForeignKey

# ------------------------------------------------------------
# LOCAL MODEL (Temporary - per "Do NOT touch any other file" rule)
# ------------------------------------------------------------
class MenuItem(Base):
    __tablename__ = "menu_items"
    __table_args__ = {'extend_existing': True}

    id: Mapped[str] = mapped_column(String, primary_key=True)
    label: Mapped[str] = mapped_column(String)
    route: Mapped[str] = mapped_column(String)
    icon: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    module: Mapped[str] = mapped_column(String)
    required_permission: Mapped[str] = mapped_column(String)
    category: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    parent_id: Mapped[Optional[str]] = mapped_column(String, ForeignKey("menu_items.id"), nullable=True)
    tenant_id: Mapped[str] = mapped_column(String)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    shortcut: Mapped[Optional[str]] = mapped_column(String, nullable=True)

# ------------------------------------------------------------
# SCHEMAS (Pydantic v2)
# ------------------------------------------------------------
class MenuItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    label: str
    route: str
    icon: Optional[str] = None
    module: str
    category: Optional[str] = None
    required_permission: str
    shortcut: Optional[str] = None
    children: List["MenuItemResponse"] = []

# ------------------------------------------------------------
# ROUTER
# ------------------------------------------------------------
router = APIRouter()

@router.get("", response_model=List[MenuItemResponse])
async def get_menu(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Resolves the dynamic menu tree for the authenticated user.
    Extracts store_id from JWT context (never from body).
    """
    try:
        # 1. Fetch all active menu items for the tenant or SYSTEM
        # Filter: (tenant_id == store_id OR tenant_id == 'SYSTEM') AND is_active == True
        query = select(MenuItem).where(
            and_(
                MenuItem.is_active == True,
                or_(
                    MenuItem.tenant_id == current_user.store_id,
                    MenuItem.tenant_id == 'SYSTEM'
                )
            )
        ).order_by(MenuItem.sort_order)
        
        result = await db.execute(query)
        db_items = result.scalars().all()

        # 2. Build Nested Tree Logic
        # Create a mapping of all items for O(1) lookup
        item_map = {
            item.id: MenuItemResponse(
                id=item.id,
                label=item.label,
                route=item.route,
                icon=item.icon,
                module=item.module,
                category=item.category,
                required_permission=item.required_permission,
                shortcut=item.shortcut,
                children=[]
            )
            for item in db_items
        }

        root_items = []
        for item in db_items:
            menu_node = item_map[item.id]
            if item.parent_id and item.parent_id in item_map:
                # Attach to parent's children list
                item_map[item.parent_id].children.append(menu_node)
            elif not item.parent_id:
                # It's a top-level root item
                root_items.append(menu_node)

        return root_items

    except Exception as e:
        # Explicitly handle and report DB errors without swallowing
        raise HTTPException(
            status_code=500,
            detail=f"[PrimeSetu] Menu Engine Resolution Error: {str(e)}"
        )
