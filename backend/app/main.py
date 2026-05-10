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

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import engine, Base, get_db
from app.models import (
    Till, Transaction, Store, Alert
)
from app.models.legacy_s9 import Itemmaster, Stockmaster
from app.models import sovereign
from app.schemas.common import DashboardStats
from app.core.security import CurrentUser, require_auth
from typing import List
from datetime import date
import uvicorn

app = FastAPI(
    title="SMRITI-OS - Sovereign Retail OS",
    redirect_slashes=False  # Crucial for CORS stability with frontend pulse
)

# .. CORS ......................................................................
ALLOWED_ORIGIN_REGEX = (
    r"https?://(localhost|127\.0\.0\.1"
    r"|(.*\.)?primesetu\.com"
    r"|(.*\.)?primesetu\.pages\.dev"
    r"|(.*\.)?SMRITI-OS\.pages\.dev"
    r"|.*\.github\.io)(:\d+)?"
)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_prefix = "/api/v1"

from app.routers import (
    onboarding, barcode,
    purchase, inventory, billing,
    users, menu, extensions, finance, schemes, security, reporting,
    store, inventory_audit, stock_ledger, department,
    legacy, masks, item_master, customer, ho, settings, master, ecommerce,
    einvoice, tally, returns, loyalty, whatsapp, warehouse, intelligence,
    flexible_reports, gstr1,
    # Previously built — now wired
    accounts, alerts, catalogue, configuration, integration, price_group, reports, tills,
)
from app.routers import schema as schema_router

# Core & Management
app.include_router(onboarding.router)
app.include_router(store.router)
app.include_router(users.router)
app.include_router(extensions.router, prefix="/api/v1/extensions")
app.include_router(legacy.router)

# Masters
app.include_router(item_master.router, prefix=api_prefix)
app.include_router(settings.router, prefix=api_prefix)
app.include_router(master.router, prefix=api_prefix)
app.include_router(customer.router, prefix=api_prefix)
app.include_router(department.router, prefix=api_prefix)
app.include_router(barcode.router, prefix=api_prefix)
app.include_router(masks.router, prefix=api_prefix)
app.include_router(menu.router, prefix=api_prefix + "/menu")

# Operational
app.include_router(billing.router)
app.include_router(inventory.router)
app.include_router(inventory_audit.router)
app.include_router(stock_ledger.router, prefix="/api/v1")
app.include_router(purchase.router)
app.include_router(finance.router)
app.include_router(schemes.router)
app.include_router(security.router)
app.include_router(reporting.router)
app.include_router(ecommerce.router, prefix="/api/v1")
app.include_router(einvoice.router, prefix="/api/v1")
app.include_router(tally.router, prefix="/api/v1")
app.include_router(returns.router)
app.include_router(loyalty.router)
app.include_router(whatsapp.router)
app.include_router(warehouse.router)
app.include_router(intelligence.router)

# Previously built — now fully wired
app.include_router(accounts.router, prefix="/api/v1/accounts",   tags=["accounts"])
app.include_router(alerts.router,   prefix="/api/v1/alerts",     tags=["alerts"])
app.include_router(catalogue.router, prefix="/api/v1/catalogue", tags=["catalogue"])
app.include_router(configuration.router, prefix="/api/v1",       tags=["configuration"])
app.include_router(integration.router, prefix="/api/v1/integration", tags=["integration"])
app.include_router(price_group.router, prefix="/api/v1",         tags=["price-group"])
app.include_router(reports.router)                                # has its own /api/v1/reports prefix
app.include_router(tills.router, prefix="/api/v1/finance/till",  tags=["tills"])

# Reports & Sync
app.include_router(ho.router, prefix="/api/v1/ho")

# Schema Studio — Introspection & Provisioning
app.include_router(schema_router.router, prefix="/api/v1")
app.include_router(flexible_reports.router)
app.include_router(gstr1.router)

from app.services.sync_engine import SyncEngine
from app.services.omnichannel_sync import OmnichannelSyncEngine
from app.services.offline_sync import offline_sync_engine
from app.core.config import settings
import asyncio

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print(f"[SMRITI-OS] Database connected. Mode: {settings.storage_mode}")

    # ── LOCAL_POSTGRES: Initialize local PG queue ──
    if settings.storage_mode == "LOCAL_POSTGRES":
        await offline_sync_engine.initialize()
        await offline_sync_engine.start()
        print("[SMRITI-OS] Local PostgreSQL Sync Engine started.")

    # ── Cloud/Sovereign: Initialize cloud sync engines ──
    else:
        try:
            await SyncEngine.install_sync_schema()
            asyncio.create_task(SyncEngine.run_push_worker())
            print("[SMRITI-OS] Delta-Sync Engine online.")

            asyncio.create_task(OmnichannelSyncEngine.run_marketplace_worker())
            print("[SMRITI-OS] Omnichannel Marketplace Engine online.")
        except Exception as e:
            print(f"[SMRITI-OS] Failed to start Sync Engines: {e}")

@app.on_event("shutdown")
async def shutdown():
    if settings.storage_mode == "LOCAL_POSTGRES":
        await offline_sync_engine.stop()
        print("[SMRITI-OS] Local PostgreSQL Sync Engine stopped.")

@app.get("/")
async def read_index():
    return {
        "message": "SMRITI-OS Sovereign OS - Operational",
        "version": "1.0.0",
        "phase": 2,
        "architect": "Jawahar R Mallah"
    }

@app.get("/api/v1/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {
        "status": "online",
        "version": "1.0.0",
        "phase": 2,
        "storage_mode": settings.storage_mode,
        "database": db_status
    }

@app.get("/api/v1/offline/status")
async def offline_status():
    """Local PostgreSQL sync queue summary for the frontend status badge."""
    if settings.storage_mode != "LOCAL_POSTGRES":
        return {
            "mode": settings.storage_mode,
            "is_online": True,
            "pending": 0,
            "synced": 0,
            "failed": 0,
        }
    return await offline_sync_engine.get_status()

@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Sovereign Dashboard Intelligence.
    Aggregates real-time stats from synchronized Shoper9 tables.
    """
    store_id = current_user.store_id

    # Active SKUs in this store (from Stockmaster)
    sku_count = await db.scalar(
        select(func.count(Stockmaster.stockno))
        .where(Stockmaster.vacompcode == store_id)
    )

    # Low Stock Alerts (Stock < 5 units)
    low_stock = await db.scalar(
        select(func.count(Stockmaster.stockno))
        .where(
            and_(
                Stockmaster.vacompcode == store_id,
                Stockmaster.curbalqty < 5
            )
        )
    )

    # Today's Revenue (Finalized Bills)
    today_revenue = await db.scalar(
        select(func.coalesce(func.sum(Transaction.net_payable), 0))
        .where(
            and_(
                Transaction.store_id == store_id,
                func.date(Transaction.created_at) == date.today(),
                Transaction.status == "Finalized"
            )
        )
    )

    # Bills Issued Today
    bills_today = await db.scalar(
        select(func.count(Transaction.id))
        .where(
            and_(
                Transaction.store_id == store_id,
                func.date(Transaction.created_at) == date.today(),
                Transaction.status == "Finalized"
            )
        )
    )

    return DashboardStats(
        today_revenue=int(today_revenue or 0),
        active_skus=int(sku_count or 0),
        bills_today=int(bills_today or 0),
        low_stock_alerts=int(low_stock or 0),
        revenue_change=0.0,
        sku_change=0
    )

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
