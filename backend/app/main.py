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

# ============================================================ #
# MONKEYPATCH: SQLAlchemy 2.0 Compatibility for Python 3.14
# Fixes: TypeError: descriptor '__getitem__' requires a 'typing.Union' object but received a 'tuple'
import sqlalchemy.util.typing
import typing
def _patched_make_union_type(*types):
    if len(types) == 1 and isinstance(types[0], tuple):
        types = types[0]
    return typing.Union[types]
sqlalchemy.util.typing.make_union_type = _patched_make_union_type
# ============================================================ #

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import get_db
from app.models.base import Product, Inventory
from app.schemas.common import DashboardStats, PredictiveStats
from app.routers import billing, schemes, alerts, ho, inventory, catalogue, reports, integration, accounts, tills, menu
from app.core.security import get_current_user, UserContext
from app.core.config import settings

app = FastAPI(
    title="PrimeSetu API",
    description="Shoper9-Based Retail OS - Phase 2 FastAPI Backend",
    version="0.1.0",
)

print(f"DEBUG: Environment is {settings.environment}")

# CORS Configuration
ALLOWED_ORIGIN_REGEX = r"https?://(localhost|127\.0\.0\.1|.*\.primesetu\.pages\.dev|.*\.github\.io|primesetu-api\.onrender\.com)(:\d+)?"
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://primesetu.pages.dev",
    "https://primesetu-api.onrender.com"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(billing.router,    prefix="/api/v1/bills",     tags=["Billing"])
app.include_router(inventory.router,  prefix="/api/v1/inventory", tags=["Inventory"])
app.include_router(inventory.router,  prefix="/api/v1/products",  tags=["Inventory"])
app.include_router(schemes.router,    prefix="/api/v1/schemes",   tags=["Schemes"])
app.include_router(alerts.router,     prefix="/api/v1/alerts",    tags=["Alerts"])
app.include_router(ho.router,         prefix="/api/v1/ho",        tags=["HO"])
app.include_router(catalogue.router,  prefix="/api/v1/catalogue", tags=["Catalogue"])
app.include_router(reports.router,    prefix="/api/v1/reports",   tags=["Reports"])
app.include_router(integration.router, prefix="/api/v1/integration", tags=["Integration"])
app.include_router(accounts.router,    prefix="/api/v1/accounts",   tags=["Accounts"])
app.include_router(tills.router,       prefix="/api/v1/tills",      tags=["Tills"])
app.include_router(menu.router,        prefix="/api/v1/menu",       tags=["Menu"])

@app.get("/")
async def root():
    return {
        "message": "PrimeSetu Sovereign OS - Operational",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health():
    return {"status": "ok", "service": "PrimeSetu API", "phase": 2}

@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    sku_count = await db.scalar(select(func.count(Product.id)))
    
    low_stock = await db.scalar(
        select(func.count(Inventory.id))
        .where(Inventory.store_id == current_user.store_id)
        .where(Inventory.quantity < Inventory.min_stock)
    )
    
    return DashboardStats(
        today_revenue=214000.0,
        active_skus=sku_count or 0,
        bills_today=284,
        low_stock_alerts=low_stock or 0,
        revenue_change=14.2,
        sku_change=38
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
