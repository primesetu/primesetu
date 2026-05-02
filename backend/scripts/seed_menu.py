
import asyncio
import os
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select
from dotenv import load_dotenv

# Import the models
# Since MenuItem is defined in the router (locally), we can either import it or redefine it here.
# For a script, redefining is safer if we don't want to mess with app imports.
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import String, Integer, Boolean, ForeignKey
from typing import Optional

load_dotenv()

class Base(DeclarativeBase):
    pass

class MenuItem(Base):
    __tablename__ = "menu_items"
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

STATIC_MENU = [
    {"id": "dashboard",  "label": "Overview",          "route": "dashboard",  "module": "dashboard",  "required_permission": "dashboard.view",   "category": "POS",        "icon": "LayoutDashboard", "shortcut": None},
    {"id": "sales",      "label": "Billing (POS)",     "route": "sales",      "module": "sales",      "required_permission": "billing.view",     "category": "POS",        "icon": "ShoppingCart",    "shortcut": "F1"},
    {"id": "returns",    "label": "Sales Returns",     "route": "returns",    "module": "returns",    "required_permission": "billing.returns",  "category": "POS",        "icon": "RotateCcw",       "shortcut": None},
    {"id": "tills",      "label": "Till Management",   "route": "tills",      "module": "tills",      "required_permission": "finance.till",     "category": "POS",        "icon": "Monitor",         "shortcut": None},
    {"id": "dayend",     "label": "Day End Closure",   "route": "dayend",     "module": "dayend",     "required_permission": "billing.dayend",   "category": "POS",        "icon": "Lock",            "shortcut": "F12"},
    
    {"id": "item_master","label": "Item Master",       "route": "item_master","module": "item_master","required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Package",         "shortcut": None},
    {"id": "customers",  "label": "Customer Master",   "route": "customers",  "module": "customers",  "required_permission": "crm.view",         "category": "CATALOGUE",  "icon": "UserSquare2",     "shortcut": None},
    {"id": "vendors",    "label": "Vendor Master",     "route": "vendors",    "module": "vendors",    "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Truck",           "shortcut": None},
    {"id": "price",      "label": "Price Master",      "route": "price",      "module": "price",      "required_permission": "catalogue.price",  "category": "CATALOGUE",  "icon": "DollarSign",      "shortcut": None},
    {"id": "schemes",    "label": "Promotions",        "route": "schemes",    "module": "schemes",    "required_permission": "catalogue.schemes","category": "CATALOGUE",  "icon": "Tag",             "shortcut": None},
    {"id": "loyalty",    "label": "Loyalty Program",   "route": "loyalty",    "module": "loyalty",    "required_permission": "crm.loyalty",      "category": "CATALOGUE",  "icon": "Trophy",          "shortcut": None},
    {"id": "personnel",  "label": "Personnel Master",  "route": "personnel",  "module": "personnel",  "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "UserSquare2",     "shortcut": None},
    {"id": "hsn",        "label": "HSN Manager",       "route": "hsn",        "module": "hsn",        "required_permission": "catalogue.view",   "category": "CATALOGUE",  "icon": "Tag",             "shortcut": None},
    
    {"id": "inventory",  "label": "Stock Status",      "route": "inventory",  "module": "inventory",  "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "Package",         "shortcut": "F9"},
    {"id": "grn",        "label": "Goods Inward (GRN)","route": "grn",        "module": "grn",        "required_permission": "inventory.grn",    "category": "WAREHOUSE",  "icon": "Truck",           "shortcut": None},
    {"id": "procurement","label": "Purchase Orders",   "route": "procurement","module": "procurement","required_permission": "inventory.po",     "category": "WAREHOUSE",  "icon": "ShoppingBag",     "shortcut": None},
    {"id": "movement",   "label": "Stock Movement",    "route": "movement",   "module": "movement",   "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "History",         "shortcut": None},
    {"id": "transfer",   "label": "Store Transfers",   "route": "transfer",   "module": "transfer",   "required_permission": "inventory.transfer","category":"WAREHOUSE",  "icon": "ArrowLeftRight",  "shortcut": None},
    {"id": "reconcile",  "label": "Physical Audit",    "route": "reconcile",  "module": "reconcile",  "required_permission": "inventory.audit",  "category": "WAREHOUSE",  "icon": "History",         "shortcut": None},
    {"id": "barcode",    "label": "Barcode Studio",    "route": "barcode",    "module": "barcode",    "required_permission": "inventory.view",   "category": "WAREHOUSE",  "icon": "Package",         "shortcut": None},
    
    {"id": "finance",    "label": "Finance Hub",       "route": "finance",    "module": "finance",    "required_permission": "finance.view",     "category": "FINANCE",    "icon": "DollarSign",      "shortcut": None},
    {"id": "analytics",  "label": "Sales Reports",     "route": "analytics",  "module": "analytics",  "required_permission": "reports.view",     "category": "FINANCE",    "icon": "BarChart3",       "shortcut": "F3"},
    {"id": "gstr1",      "label": "GST Compliance",    "route": "gstr1",      "module": "gstr1",      "required_permission": "reports.gst",      "category": "FINANCE",    "icon": "FileText",        "shortcut": None},
    {"id": "vouchers",   "label": "Gift Vouchers",     "route": "vouchers",   "module": "vouchers",   "required_permission": "billing.vouchers", "category": "FINANCE",    "icon": "FileText",        "shortcut": None},
    
    {"id": "ho",         "label": "HO Sync",           "route": "ho",         "module": "ho",         "required_permission": "ho.view",          "category": "HO",         "icon": "Globe",           "shortcut": None},
    {"id": "settings",   "label": "System Config",     "route": "settings",   "module": "settings",   "required_permission": "settings.view",    "category": "SYSTEM",     "icon": "Settings",        "shortcut": "F10"},
    {"id": "security",   "label": "Security",          "route": "security",   "module": "security",   "required_permission": "settings.security","category": "SYSTEM",     "icon": "ShieldCheck",     "shortcut": None},
    {"id": "table_viewer","label": "DB Explorer",       "route": "table_viewer","module": "table_viewer","required_permission": "settings.view",    "category": "SYSTEM",     "icon": "Database",        "shortcut": None},
]

async def seed_menu():
    url = os.getenv("DATABASE_URL")
    engine = create_async_engine(url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if menu_items table exists, if not create it (safe because of LOCAL MODEL in router)
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)

        print("Seeding menu_items...")
        for idx, item in enumerate(STATIC_MENU):
            menu_item = MenuItem(
                id=item["id"],
                label=item["label"],
                route=item["route"],
                icon=item["icon"],
                module=item["module"],
                required_permission=item["required_permission"],
                category=item["category"],
                tenant_id="SYSTEM",  # Global default
                sort_order=idx * 10,
                shortcut=item["shortcut"],
                is_active=True
            )
            await session.merge(menu_item)
        
        await session.commit()
        print("Menu seeded successfully.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_menu())
