# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect : Jawahar R. M.
# Organisation     : AITDL Network
# Project          : PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.core.database import engine, Base, get_db
from app.models import (
    Till, Item, Transaction, Store, Alert, Scheme, ItemStock
)
from app.schemas.common import DashboardStats
from app.core.security import CurrentUser, require_auth
from typing import List
from datetime import date
import uvicorn

app = FastAPI(title="PrimeSetu — Sovereign Retail OS")

# ── CORS ──────────────────────────────────────────────────────────────────────
ALLOWED_ORIGIN_REGEX = (
    r"https?://(localhost|127\.0\.0\.1"
    r"|(.*\.)?primesetu\.pages\.dev"
    r"|.*\.github\.io)(:\d+)?"
)
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

from app.routers import (
    onboarding, item_master, customer, barcode, 
    price_group, purchase, inventory, billing, 
    ho, flexible_reports, users, menu, extensions, finance, schemes, security, reporting
)
from app.routers.gstr1 import router as gstr1_router

# Core & Management
app.include_router(onboarding.router)
app.include_router(users.router)
app.include_router(extensions.router, prefix="/api/v1/extensions")

# Masters
app.include_router(item_master.router, prefix="/api/v1")
app.include_router(customer.router, prefix="/api/v1")
app.include_router(price_group.router, prefix="/api/v1")
app.include_router(barcode.router, prefix="/api/v1")
app.include_router(menu.router, prefix="/api/v1/menu")

# Operational
app.include_router(billing.router)   # Prefix handled in router
app.include_router(inventory.router) # Prefix handled in router
app.include_router(purchase.router)  # Prefix handled in router
app.include_router(finance.router)   # Prefix handled in router
app.include_router(schemes.router)   # Prefix handled in router
app.include_router(security.router)  # Prefix handled in router
app.include_router(reporting.router) # Prefix handled in router

# Reports & Sync
app.include_router(ho.router, prefix="/api/v1/ho")
app.include_router(flexible_reports.router)
app.include_router(gstr1_router)

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[PrimeSetu] Database connected and schema verified.")

@app.get("/")
async def read_index():
    return FileResponse("primesetu-shoper9-ui.html")

@app.get("/api/v1/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {e}"
    return {"status": "online", "database": db_status, "engine": "FastAPI Phase 2 (Async)"}

@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    store_id = current_user.store_id

    sku_count = await db.scalar(
        select(func.count(Item.id))
        .where(Item.store_id == store_id, Item.is_active == True)
    )

    low_stock = await db.scalar(
        select(func.count(ItemStock.id))
        .where(ItemStock.store_id == store_id,
               ItemStock.qty_on_hand < ItemStock.reorder_level)
    )

    today_revenue = await db.scalar(
        select(func.coalesce(func.sum(Transaction.net_payable), 0))
        .where(Transaction.store_id == store_id,
               func.date(Transaction.created_at) == date.today(),
               Transaction.status == "Finalized")
    )

    bills_today = await db.scalar(
        select(func.count(Transaction.id))
        .where(Transaction.store_id == store_id,
               func.date(Transaction.created_at) == date.today(),
               Transaction.status == "Finalized")
    )

    return DashboardStats(
        today_revenue=int(today_revenue or 0),
        active_skus=sku_count or 0,
        bills_today=bills_today or 0,
        low_stock_alerts=low_stock or 0,
        revenue_change=0.0,
        sku_change=0
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
