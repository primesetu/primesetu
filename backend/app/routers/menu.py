# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
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
from app.models.base import MenuItem
from app.models.security import VaGroup, VaGroupPermission, VaUserGroup
from sqlalchemy import String, Integer, Boolean, ForeignKey, join

# Model is now in app.models.base

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
    {"id": "dashboard",  "label": "Overview",          "route": "dashboard",  "module": "dashboard",  "required_permission": "dashboard.view",   "category": "POS",        "icon": "LayoutDashboard", "shortcut": None, "children": []},
    {"id": "sales",      "label": "Billing (POS)",     "route": "sales",      "module": "sales",      "required_permission": "billing.view",     "category": "POS",        "icon": "ShoppingCart",    "shortcut": "F1", "children": []},
    {"id": "returns",    "label": "Sales Returns",     "route": "returns",    "module": "returns",    "required_permission": "billing.returns",  "category": "POS",        "icon": "RotateCcw",       "shortcut": None, "children": []},
    {"id": "tills",      "label": "Till Management",   "route": "tills",      "module": "tills",      "required_permission": "finance.till",     "category": "POS",        "icon": "Monitor",         "shortcut": None, "children": []},
    {"id": "dayend",     "label": "Day End Closure",   "route": "dayend",     "module": "dayend",     "required_permission": "billing.dayend",   "category": "POS",        "icon": "Lock",            "shortcut": "F12","children": []},
    
    {"id": "purchase_entry", "label": "Purchase Workbench", "route": "purchase_entry", "module": "purchase_entry", "required_permission": "inventory.view", "category": "TRANSACTIONS", "icon": "PackagePlus", "shortcut": None, "children": []},
    {"id": "sales_journal",    "label": "Sales Journal",      "route": "sales_journal",    "module": "sales_journal",    "required_permission": "billing.view",      "category": "TRANSACTIONS", "icon": "BookOpen", "shortcut": None, "children": []},
    {"id": "purchase_journal", "label": "Purchase Journal",   "route": "purchase_journal", "module": "purchase_journal", "required_permission": "inventory.view",    "category": "TRANSACTIONS", "icon": "BookOpen", "shortcut": None, "children": []},
    {"id": "stock_ledger",     "label": "Stock Ledger",       "route": "stock_ledger",     "module": "stock_ledger",     "required_permission": "inventory.view",    "category": "TRANSACTIONS", "icon": "ArrowRightLeft", "shortcut": None, "children": []},
    {"id": "item_master","label": "Item Master",       "route": "item_master","module": "item_master","required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Package",         "shortcut": None, "children": []},
    {"id": "customers",  "label": "Customer Master",   "route": "customers",  "module": "customers",  "required_permission": "crm.view",         "category": "CATALOGUE",  "icon": "UserSquare2",     "shortcut": None, "children": []},
    {"id": "vendors",    "label": "Vendor Master",     "route": "vendors",    "module": "vendors",    "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Truck",           "shortcut": None, "children": []},
    {"id": "price",      "label": "Price Workbench",      "route": "price",      "module": "price",      "required_permission": "catalogue.price",  "category": "CATALOGUE",  "icon": "DollarSign",      "shortcut": None, "children": []},
    {"id": "schemes",    "label": "Promotions",        "route": "schemes",    "module": "schemes",    "required_permission": "catalogue.schemes","category": "CATALOGUE",  "icon": "Tag",             "shortcut": None, "children": []},
    {"id": "loyalty",    "label": "Loyalty Program",   "route": "loyalty",    "module": "loyalty",    "required_permission": "crm.loyalty",      "category": "CATALOGUE",  "icon": "Trophy",          "shortcut": None, "children": []},
    {"id": "personnel",  "label": "Personnel Master",  "route": "personnel",  "module": "personnel",  "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "UserSquare2",     "shortcut": None, "children": []},
    {"id": "hsn",        "label": "HSN Manager",       "route": "hsn",        "module": "hsn",        "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "FileSpreadsheet", "shortcut": None, "children": []},
    {"id": "object_lookup", "label": "Object Lookup",     "route": "object_lookup", "module": "object_lookup", "required_permission": "catalogue.view", "category": "CATALOGUE", "icon": "Database", "shortcut": None, "children": []},
    {"id": "accounts",   "label": "Account Master",    "route": "accounts",   "module": "accounts",   "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Database",        "shortcut": None, "children": []},
    
    {"id": "inventory",  "label": "Stock Status",      "route": "inventory",  "module": "inventory",  "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "Package",         "shortcut": "F9", "children": []},
    {"id": "procurement","label": "Purchase Orders",   "route": "procurement","module": "procurement","required_permission": "inventory.po",     "category": "WAREHOUSE",  "icon": "ShoppingBag",     "shortcut": None, "children": []},
    {"id": "movement",   "label": "Stock Movement",    "route": "movement",   "module": "movement",   "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "History",         "shortcut": None, "children": []},
    {"id": "transfer",   "label": "Store Transfers",   "route": "transfer",   "module": "transfer",   "required_permission": "inventory.transfer","category":"WAREHOUSE",  "icon": "ArrowLeftRight",  "shortcut": None, "children": []},
    {"id": "reconcile",  "label": "Physical Audit",    "route": "reconcile",  "module": "reconcile",  "required_permission": "inventory.audit",  "category": "WAREHOUSE",  "icon": "History",         "shortcut": None, "children": []},
    {"id": "barcode",    "label": "Barcode Studio",    "route": "barcode",    "module": "barcode",    "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "Package",         "shortcut": None, "children": []},
    
    {"id": "finance",    "label": "Finance Hub",       "route": "finance",    "module": "finance",    "required_permission": "finance.view",     "category": "FINANCE",    "icon": "DollarSign",      "shortcut": None, "children": []},
    {"id": "analytics",  "label": "Sales Reports",     "route": "analytics",  "module": "analytics",  "required_permission": "reports.view",     "category": "FINANCE",    "icon": "BarChart3",       "shortcut": "F3", "children": []},
    {"id": "gstr1",      "label": "GST Compliance",    "route": "gstr1",      "module": "gstr1",      "required_permission": "reports.gst",      "category": "FINANCE",    "icon": "FileText",        "shortcut": None, "children": []},
    {"id": "vouchers",   "label": "Gift Vouchers",     "route": "vouchers",   "module": "vouchers",   "required_permission": "billing.vouchers", "category": "FINANCE",    "icon": "FileText",        "shortcut": None, "children": []},
    
    {"id": "ho",         "label": "HO Sync",           "route": "ho",         "module": "ho",         "required_permission": "ho.view",          "category": "HO",         "icon": "Globe",           "shortcut": None, "children": []},
    {"id": "hybrid_storage",  "label": "Hybrid Storage",   "route": "hybrid_storage",  "module": "hybrid_storage",  "required_permission": "settings.view",    "category": "SYSTEM", "icon": "Database",    "shortcut": None,  "children": []},
    {"id": "architect_config", "label": "SMRITI Config",    "route": "architect_config", "module": "architect_config", "required_permission": "settings.view",    "category": "SYSTEM", "icon": "ShieldCheck", "shortcut": "F7",   "children": []},
    {"id": "architect",        "label": "Architect Explorer","route": "/jawaharmallah",  "module": "architect",        "required_permission": "architect.view",    "category": "SYSTEM", "icon": "Code2",       "shortcut": "Alt+A","children": []},
    {"id": "settings",         "label": "System Config",    "route": "settings",         "module": "settings",         "required_permission": "settings.view",    "category": "SYSTEM", "icon": "Settings",    "shortcut": "F10",  "children": []},
    {"id": "security",         "label": "Security",         "route": "security",         "module": "security",         "required_permission": "settings.security","category": "SYSTEM", "icon": "ShieldCheck", "shortcut": None,   "children": []},
    {"id": "spreadsheet",      "label": "Sovereign Audit",  "route": "spreadsheet",      "module": "spreadsheet",      "required_permission": "settings.view",    "category": "SYSTEM", "icon": "FileText",    "shortcut": None,   "children": []},
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

    # ── Authenticated: return store-filtered & permission-filtered menu ──
    try:
        # 1. Resolve user's permissions from database
        # We join VaUserGroup -> VaGroup -> VaGroupPermission
        perm_query = select(VaGroupPermission.permission).select_from(
            join(VaUserGroup, VaGroup, VaUserGroup.group_id == VaGroup.id)
            .join(VaGroupPermission, VaGroup.id == VaGroupPermission.group_id)
        ).where(
            and_(
                VaUserGroup.user_id == current_user.user_id,
                VaGroupPermission.is_allowed == True
            )
        )
        
        perm_result = await db.execute(perm_query)
        user_perms = set(perm_result.scalars().all())

        # If user has no explicit group permissions, use role as fallback if it matches a group name
        if not user_perms:
            # Fallback: check permissions for a group named after the role
            fallback_perm_query = select(VaGroupPermission.permission).select_from(
                join(VaGroup, VaGroupPermission, VaGroup.id == VaGroupPermission.group_id)
            ).where(
                and_(
                    VaGroup.name == current_user.role,
                    VaGroup.store_id == current_user.store_id,
                    VaGroupPermission.is_allowed == True
                )
            )
            fallback_res = await db.execute(fallback_perm_query)
            user_perms = set(fallback_res.scalars().all())

        # 2. Query Menu Items
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

        # 3. Filter by permission
        # Merge DB items with core STATIC_MENU items
        source_items = list(db_items)
        db_item_ids = {item.id for item in source_items}
        
        for static_item in STATIC_MENU:
            if static_item['id'] not in db_item_ids:
                # Add static item if not overridden by DB
                source_items.append(MenuItem(**static_item, tenant_id='SYSTEM'))
        
        # Always allow 'dashboard.view' as a base
        user_perms.add('dashboard.view')

        item_map = {}
        for item in source_items:
            # Check permission
            if item.required_permission not in user_perms and current_user.role.lower() != 'admin':
                continue

            item_map[item.id] = MenuItemResponse(
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

        root_items = []
        for item in source_items:
            if item.id not in item_map:
                continue
                
            menu_node = item_map[item.id]
            if item.parent_id and item.parent_id in item_map:
                item_map[item.parent_id].children.append(menu_node)
            elif not item.parent_id:
                root_items.append(menu_node)

        return root_items

    except Exception as e:
        # DB error — fall back to static menu instead of 500
        return [MenuItemResponse(**item) for item in STATIC_MENU]
