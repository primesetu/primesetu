# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
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

# ── Static SYSTEM menu — always available, no auth required ──
STATIC_MENU = [
    {"id": "dashboard",  "label": "Overview",          "route": "dashboard",  "module": "dashboard",  "required_permission": "dashboard.view",   "category": "OPERATIONS", "icon": "LayoutDashboard", "shortcut": None, "children": []},
    {"id": "sales",      "label": "Billing (POS)",     "route": "sales",      "module": "sales",      "required_permission": "billing.view",     "category": "OPERATIONS", "icon": "ShoppingCart",    "shortcut": "F1", "children": []},
    {"id": "returns",    "label": "Sales Returns",     "route": "returns",    "module": "returns",    "required_permission": "billing.returns",  "category": "OPERATIONS", "icon": "RotateCcw",       "shortcut": None, "children": []},
    {"id": "tills",      "label": "Till Management",   "route": "tills",      "module": "tills",      "required_permission": "finance.till",     "category": "OPERATIONS", "icon": "Monitor",         "shortcut": None, "children": []},
    {"id": "dayend",     "label": "Day End Closure",   "route": "dayend",     "module": "dayend",     "required_permission": "billing.dayend",   "category": "OPERATIONS", "icon": "Lock",            "shortcut": "F12","children": []},
    {"id": "price",      "label": "Price Master",      "route": "price",      "module": "price",      "required_permission": "catalogue.price",  "category": "OPERATIONS", "icon": "DollarSign",      "shortcut": None, "children": []},
    {"id": "customers",  "label": "Customer Master",   "route": "customers",  "module": "customers",  "required_permission": "crm.view",         "category": "OPERATIONS", "icon": "UserSquare2",     "shortcut": None, "children": []},
    {"id": "loyalty",    "label": "Loyalty Program",   "route": "loyalty",    "module": "loyalty",    "required_permission": "crm.loyalty",      "category": "OPERATIONS", "icon": "Trophy",          "shortcut": None, "children": []},
    {"id": "vouchers",   "label": "Gift Vouchers",     "route": "vouchers",   "module": "vouchers",   "required_permission": "billing.vouchers", "category": "OPERATIONS", "icon": "FileText",        "shortcut": None, "children": []},
    {"id": "schemes",    "label": "Promotions",        "route": "schemes",    "module": "schemes",    "required_permission": "catalogue.schemes","category": "OPERATIONS", "icon": "Tag",             "shortcut": None, "children": []},
    {"id": "inventory",  "label": "Stock Status",      "route": "inventory",  "module": "inventory",  "required_permission": "inventory.view",   "category": "INVENTORY",  "icon": "Package",         "shortcut": "F9", "children": []},
    {"id": "grn",        "label": "Goods Inward (GRN)","route": "grn",        "module": "grn",        "required_permission": "inventory.grn",    "category": "INVENTORY",  "icon": "Truck",           "shortcut": None, "children": []},
    {"id": "procurement","label": "Purchase Orders",   "route": "procurement","module": "procurement","required_permission": "inventory.po",     "category": "INVENTORY",  "icon": "ShoppingBag",     "shortcut": None, "children": []},
    {"id": "movement",   "label": "Stock Movement",    "route": "movement",   "module": "movement",   "required_permission": "inventory.view",   "category": "INVENTORY",  "icon": "History",         "shortcut": None, "children": []},
    {"id": "transfer",   "label": "Store Transfers",   "route": "transfer",   "module": "transfer",   "required_permission": "inventory.transfer","category":"INVENTORY",  "icon": "ArrowLeftRight",  "shortcut": None, "children": []},
    {"id": "reconcile",  "label": "Physical Audit",    "route": "reconcile",  "module": "reconcile",  "required_permission": "inventory.audit",  "category": "INVENTORY",  "icon": "History",         "shortcut": None, "children": []},
    {"id": "barcode",    "label": "Barcode Studio",    "route": "barcode",    "module": "barcode",    "required_permission": "inventory.view",   "category": "INVENTORY",  "icon": "Package",         "shortcut": None, "children": []},
    {"id": "finance",    "label": "Finance Hub",       "route": "finance",    "module": "finance",    "required_permission": "finance.view",     "category": "FINANCE",    "icon": "DollarSign",      "shortcut": None, "children": []},
    {"id": "analytics",  "label": "Sales Reports",     "route": "analytics",  "module": "analytics",  "required_permission": "reports.view",     "category": "FINANCE",    "icon": "BarChart3",       "shortcut": "F3", "children": []},
    {"id": "gstr1",      "label": "GST Compliance",    "route": "gstr1",      "module": "gstr1",      "required_permission": "reports.gst",      "category": "FINANCE",    "icon": "FileText",        "shortcut": None, "children": []},
    {"id": "ho",         "label": "HO Sync",           "route": "ho",         "module": "ho",         "required_permission": "ho.view",          "category": "NETWORK",    "icon": "Globe",           "shortcut": None, "children": []},
    {"id": "settings",   "label": "System Config",     "route": "settings",   "module": "settings",   "required_permission": "settings.view",    "category": "SETTINGS",   "icon": "Settings",        "shortcut": "F10","children": []},
    {"id": "security",   "label": "Security",          "route": "security",   "module": "security",   "required_permission": "settings.security","category": "SETTINGS",   "icon": "ShieldCheck",     "shortcut": None, "children": []},
]

@router.get("", response_model=List[MenuItemResponse])
async def get_menu(
    db: AsyncSession = Depends(get_db),
    current_user: Optional[UserContext] = Depends(get_current_user)
):
    """
    Resolves the dynamic menu tree.
    Public endpoint — returns SYSTEM menu when unauthenticated.
    Returns store-filtered DB menu when authenticated.
    """
    # ── Unauthenticated: return static SYSTEM menu ──
    if not current_user:
        return [MenuItemResponse(**item) for item in STATIC_MENU]

    try:
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

        # If DB has no menu items yet, fall back to static menu
        if not db_items:
            return [MenuItemResponse(**item) for item in STATIC_MENU]

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
                item_map[item.parent_id].children.append(menu_node)
            elif not item.parent_id:
                root_items.append(menu_node)

        return root_items

    except Exception as e:
        # DB error — fall back to static menu instead of 500
        return [MenuItemResponse(**item) for item in STATIC_MENU]
