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
from app.database import engine, Base, get_db
from app.models import Till, Product, Bill, BillItem, Store, Alert, Scheme
from app.schemas import (
    DashboardStats, ProductRead, ProductCreate, ProductUpdate,
    BillCreate, BillResponse, BillSummary, DayEndSummary
)
from app.core.security import CurrentUser, require_auth, require_manager, require_admin
from app.core.gst import GSTEngine, BillLineInput
from typing import List
from decimal import Decimal
from datetime import date
import random
import string
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

from app.routers import onboarding, item_master, customer, barcode, price_group, procurement, inventory_audit, purchase, users, inventory, billing, ho, flexible_reports
from app.routers.gstr1 import router as gstr1_router

app.include_router(onboarding.router)
app.include_router(gstr1_router)
app.include_router(item_master.router, prefix="/api/v1")
app.include_router(customer.router, prefix="/api/v1")
app.include_router(barcode.router, prefix="/api/v1")
app.include_router(price_group.router, prefix="/api/v1")
app.include_router(purchase.router) # Prefix handled in router
app.include_router(procurement.router)
app.include_router(inventory_audit.router)
app.include_router(users.router)
app.include_router(inventory.router, prefix="/api/v1/inventory")
app.include_router(billing.router, prefix="/api/v1/billing")
app.include_router(ho.router, prefix="/api/v1/ho")
app.include_router(flexible_reports.router)

# ── Startup ───────────────────────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("[PrimeSetu] Database connected and schema verified.")


# ── Public endpoints (no auth) ────────────────────────────────────────────────
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


# ── Dashboard ─────────────────────────────────────────────────────────────────
@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    store_id = current_user.store_id

    # Active SKU count for this store
    sku_count = await db.scalar(
        select(func.count(Product.id))
        .where(Product.store_id == store_id, Product.is_active == True)
    )

    # Low stock alerts
    low_stock = await db.scalar(
        select(func.count(Product.id))
        .where(Product.store_id == store_id,
               Product.stock_qty < Product.reorder_level,
               Product.is_active == True)
    )

    # Today's revenue — real DB query
    today_revenue = await db.scalar(
        select(func.coalesce(func.sum(Bill.total_amount), 0))
        .where(Bill.store_id == store_id,
               func.date(Bill.created_at) == date.today(),
               Bill.is_cancelled == False)
    )

    # Today's bill count
    bills_today = await db.scalar(
        select(func.count(Bill.id))
        .where(Bill.store_id == store_id,
               func.date(Bill.created_at) == date.today(),
               Bill.is_cancelled == False)
    )

    return DashboardStats(
        today_revenue=int(today_revenue or 0),
        active_skus=sku_count or 0,
        bills_today=bills_today or 0,
        low_stock_alerts=low_stock or 0,
        revenue_change=0.0, # Mocked for now
        sku_change=0
    )


# ── Tally export ──────────────────────────────────────────────────────────────
@app.get("/api/v1/tally/export")
async def export_tally_xml(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),
):
    from app.services.tally_bridge import TallyBridge
    store = await db.scalar(select(Store).where(Store.id == current_user.store_id))
    company_name = store.name if store else "PrimeSetu Retail"
    
    bills = (await db.execute(
        select(Bill)
        .where(Bill.store_id == current_user.store_id,
               func.date(Bill.created_at) == date.today(),
               Bill.is_cancelled == False)
    )).scalars().all()
    
    # Convert ORM objects to dicts for TallyBridge
    transactions = []
    for b in bills:
        transactions.append({
            'date': b.created_at,
            'bill_no': b.bill_number,
            'customer_name': b.customer_name,
            'net_amount': b.total_amount,
            'tax_amount': b.total_tax_amount
        })
    
    xml_data = TallyBridge.generate_sales_xml(transactions)
    return Response(content=xml_data, media_type="application/xml")


# ── Alerts ────────────────────────────────────────────────────────────────────
@app.get("/api/v1/alerts")
async def list_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    result = await db.execute(
        select(Alert)
        .where(Alert.store_id == current_user.store_id)
        .order_by(Alert.is_read.asc(), Alert.created_at.desc())
    )
    return result.scalars().all()


@app.patch("/api/v1/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    alert = await db.get(Alert, alert_id)
    if not alert or alert.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.is_read = True
    await db.commit()
    return {"status": "success"}


# ── Store settings ────────────────────────────────────────────────────────────
@app.get("/api/v1/store/settings")
async def get_settings(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    return await db.scalar(select(Store).where(Store.id == current_user.store_id))


@app.patch("/api/v1/store/settings")
async def update_settings(
    settings_data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),
):
    store = await db.scalar(select(Store).where(Store.id == current_user.store_id))
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    ALLOWED_FIELDS = {"name", "address", "phone", "gstin", "state_code"}
    for key, value in settings_data.items():
        if key in ALLOWED_FIELDS and hasattr(store, key):
            setattr(store, key, value)
    await db.commit()
    await db.refresh(store)
    return store


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
