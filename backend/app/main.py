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


# ── Inventory ─────────────────────────────────────────────────────────────────
@app.get("/api/v1/inventory/alerts", response_model=List[ProductRead])
async def get_inventory_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    result = await db.execute(
        select(Product)
        .where(Product.store_id == current_user.store_id,
               Product.stock_qty < Product.reorder_level)
        .limit(20)
    )
    return result.scalars().all()


@app.get("/api/v1/products/search", response_model=List[ProductRead])
async def search_products(
    q: str,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    result = await db.execute(
        select(Product)
        .where(
            Product.store_id == current_user.store_id,
            Product.is_active == True,
            (Product.name.ilike(f"%{q}%"))
            | (Product.sku.ilike(f"%{q}%"))
            | (Product.barcode == q),
        )
        .limit(10)
    )
    return result.scalars().all()


@app.get("/api/v1/products", response_model=List[ProductRead])
async def list_products(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    result = await db.execute(
        select(Product)
        .where(Product.store_id == current_user.store_id)
        .order_by(Product.name)
    )
    return result.scalars().all()


@app.post("/api/v1/products", response_model=ProductRead)
async def create_product(
    product: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),   # manager+ only
):
    new_product = Product(**product.model_dump(), store_id=current_user.store_id)
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product


@app.patch("/api/v1/products/{product_id}", response_model=ProductRead)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),
):
    product = await db.get(Product, product_id)
    if not product or product.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product_data.model_dump(exclude_none=True).items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


@app.delete("/api/v1/products/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_admin),   # admin only
):
    product = await db.get(Product, product_id)
    if not product or product.store_id != current_user.store_id:
        raise HTTPException(status_code=404, detail="Product not found")
    # Soft delete — never hard delete inventory
    product.is_active = False
    await db.commit()
    return {"status": "success", "message": "Product deactivated"}


# ── Billing ───────────────────────────────────────────────────────────────────
def _generate_bill_number() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    return f"PS-{suffix}"


@app.post("/api/v1/bills/finalize", response_model=BillResponse)
async def create_bill(
    bill_data: BillCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    store_id = current_user.store_id

    # 1. Fetch store for state code (IGST determination)
    store = await db.scalar(select(Store).where(Store.id == store_id))

    # 2. Validate all products belong to this store & have enough stock
    gst_inputs: List[BillLineInput] = []
    for item in bill_data.items:
        product = await db.get(Product, item.product_id)
        if not product or product.store_id != store_id:
            raise HTTPException(status_code=404,
                                detail=f"Product {item.product_id} not found in your store")
        if product.stock_qty < item.qty:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. "
                       f"Available: {product.stock_qty}, requested: {item.qty}"
            )
        gst_inputs.append(BillLineInput(
            product_id=item.product_id,
            qty=item.qty,
            unit_price=item.unit_price,
            mrp_at_billing=item.mrp_at_billing,
            gst_rate=item.gst_rate or product.gst_rate,
            hsn_code=item.hsn_code or product.hsn_code,
            discount_amount=item.discount_amount,
        ))

    # 3. Run GST engine
    totals = GSTEngine.compute_bill(
        gst_inputs,
        store_state=store.state_code if store else None,
        customer_gstin=bill_data.customer_gstin,
    )

    # 4. Persist bill
    new_bill = Bill(
        store_id=store_id,
        bill_number=_generate_bill_number(),
        customer_name=bill_data.customer_name,
        customer_phone=bill_data.customer_phone,
        customer_gstin=bill_data.customer_gstin,
        bill_type=bill_data.bill_type,
        payment_mode=bill_data.payment_mode,
        cashier_id=current_user.user_id,
        subtotal_amount=totals.subtotal_amount,
        discount_amount=totals.total_discount,
        cgst_amount=totals.cgst_amount,
        sgst_amount=totals.sgst_amount,
        igst_amount=totals.igst_amount,
        total_tax_amount=totals.total_tax_amount,
        round_off=totals.round_off,
        total_amount=totals.total_amount,
    )
    db.add(new_bill)
    await db.flush()   # get new_bill.id before adding items

    # 5. Persist line items + deduct stock
    for line in totals.lines:
        db.add(BillItem(
            bill_id=new_bill.id,
            product_id=line.product_id,
            qty=line.qty,
            unit_price=line.unit_price,
            mrp_at_billing=line.mrp_at_billing,
            discount_amount=line.discount_amount,
            hsn_code=line.hsn_code,
            gst_rate=line.gst_rate,
            taxable_amount=line.taxable_amount,
            cgst_amount=line.cgst_amount,
            sgst_amount=line.sgst_amount,
            igst_amount=line.igst_amount,
            line_total=line.line_total,
        ))
        product = await db.get(Product, line.product_id)
        if product:
            product.stock_qty -= line.qty

    await db.commit()
    await db.refresh(new_bill)
    return new_bill


# ── Reports ───────────────────────────────────────────────────────────────────
@app.get("/api/v1/reports/sales-summary")
async def get_sales_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),
):
    store_id = current_user.store_id

    stats = (await db.execute(
        select(
            func.coalesce(func.sum(Bill.total_amount), 0).label("total_revenue"),
            func.coalesce(func.sum(Bill.total_tax_amount), 0).label("total_tax"),
            func.count(Bill.id).label("total_bills"),
        ).where(Bill.store_id == store_id, Bill.is_cancelled == False)
    )).mappings().first()

    daily = (await db.execute(
        select(
            func.date(Bill.created_at).label("date"),
            func.sum(Bill.total_amount).label("amount"),
            func.sum(Bill.total_tax_amount).label("tax"),
            func.count(Bill.id).label("bills"),
        )
        .where(Bill.store_id == store_id, Bill.is_cancelled == False)
        .group_by(func.date(Bill.created_at))
        .order_by(func.date(Bill.created_at).desc())
        .limit(7)
    )).mappings().all()

    return {
        "revenue": int(stats["total_revenue"]),
        "tax_collected": int(stats["total_tax"]),
        "bills": int(stats["total_bills"]),
        "daily": [
            {
                "date": d["date"],
                "amount": int(d["amount"]),
                "tax": int(d["tax"]),
                "bills": int(d["bills"])
            } for d in daily
        ],
    }


@app.get("/api/v1/reports/inventory-valuation")
async def get_inventory_valuation(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),
):
    store_id = current_user.store_id

    stats = (await db.execute(
        select(
            func.coalesce(func.sum(Product.mrp * Product.stock_qty), 0).label("mrp_value"),
            func.coalesce(func.sum(Product.cost_price * Product.stock_qty), 0).label("cost_value"),
            func.count(Product.id).label("total_skus"),
        ).where(Product.store_id == store_id, Product.is_active == True)
    )).mappings().first()

    by_cat = (await db.execute(
        select(
            Product.category,
            func.sum(Product.mrp * Product.stock_qty).label("mrp_value"),
            func.count(Product.id).label("skus"),
        )
        .where(Product.store_id == store_id, Product.is_active == True)
        .group_by(Product.category)
    )).mappings().all()

    return {
        "mrp_valuation": int(stats["mrp_value"]),
        "cost_valuation": int(stats["cost_value"]),
        "total_skus": int(stats["total_skus"]),
        "by_category": [
            {
                "category": c["category"],
                "mrp_value": int(c["mrp_value"]),
                "skus": int(c["skus"])
            } for c in by_cat
        ],
    }


@app.get("/api/v1/bills/day-end-summary", response_model=DayEndSummary)
async def get_day_end_summary(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_manager),
):
    store_id = current_user.store_id

    def _sum_mode(mode: str):
        return func.coalesce(
            func.sum(Bill.total_amount).filter(Bill.payment_mode == mode), 0
        )

    stats = (await db.execute(
        select(
            func.coalesce(func.sum(Bill.total_amount), 0).label("total"),
            func.coalesce(func.sum(Bill.total_tax_amount), 0).label("total_tax"),
            func.coalesce(func.sum(Bill.cgst_amount), 0).label("cgst"),
            func.coalesce(func.sum(Bill.sgst_amount), 0).label("sgst"),
            func.coalesce(func.sum(Bill.igst_amount), 0).label("igst"),
            func.count(Bill.id).label("count"),
            func.count(Bill.id).filter(Bill.is_cancelled == True).label("cancelled"),
            _sum_mode("cash").label("cash"),
            _sum_mode("upi").label("upi"),
            _sum_mode("card").label("card"),
            _sum_mode("credit").label("credit"),
        ).where(
            Bill.store_id == store_id,
            func.date(Bill.created_at) == date.today(),
        )
    )).mappings().first()

    return DayEndSummary(
        total_revenue=int(stats["total"]),
        total_bills=int(stats["count"]),
        total_tax_collected=int(stats["total_tax"]),
        cgst_collected=int(stats["cgst"]),
        sgst_collected=int(stats["sgst"]),
        igst_collected=int(stats["igst"]),
        cash_sales=int(stats["cash"]),
        upi_sales=int(stats["upi"]),
        card_sales=int(stats["card"]),
        credit_sales=int(stats["credit"]),
        cancelled_bills=int(stats["cancelled"]),
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
