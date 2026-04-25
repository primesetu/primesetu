# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R. M.
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from database import engine, Base, get_db
from models import Till, Product
from schemas import DashboardStats, ProductRead, BillCreate
from typing import List
import uvicorn

app = FastAPI(title="PrimeSetu — Sovereign Retail OS")

# Configure CORS for Sovereign Node
ALLOWED_ORIGIN_REGEX = r"https?://(localhost|127\.0\.0\.1|.*\.primesetu\.pages\.dev|patrick-books-databases-activated\.trycloudflare\.com)(:\d+)?"

print("[PrimeSetu] Initializing CORS Middleware...")
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=ALLOWED_ORIGIN_REGEX,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("[PrimeSetu] Database connected and schema verified.")
    except Exception as e:
        print(f"[PrimeSetu] WARNING: Database connection failed: {e}")
        print("[PrimeSetu] Serving in Mock Mode (UI Only).")

@app.get("/")
async def read_index():
    return FileResponse("primesetu-shoper9-ui.html")

@app.get("/api/v1/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(select(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "online",
        "database": db_status,
        "engine": "FastAPI Phase 2 (Async)"
    }

@app.get("/api/v1/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: AsyncSession = Depends(get_db)):
    sku_count = await db.scalar(select(func.count(Product.id)))
    low_stock = await db.scalar(select(func.count(Product.id)).where(Product.stock_qty < 10))
    
    return DashboardStats(
        today_revenue=214000.0,
        active_skus=sku_count or 0,
        bills_today=284,
        low_stock_alerts=low_stock or 0,
        revenue_change=14.2,
        sku_change=38
    )

@app.get("/api/v1/inventory/alerts", response_model=List[ProductRead])
async def get_inventory_alerts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.stock_qty < 10).limit(5))
    return result.scalars().all()

@app.get("/api/v1/products/search", response_model=List[ProductRead])
async def search_products(q: str, db: AsyncSession = Depends(get_db)):
    query = select(Product).where(
        (Product.name.ilike(f"%{q}%")) | 
        (Product.sku.ilike(f"%{q}%")) |
        (Product.barcode == q)
    ).limit(10)
    result = await db.execute(query)
    return result.scalars().all()

@app.get("/api/v1/products", response_model=List[ProductRead])
async def list_products(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).order_by(Product.name))
    return result.scalars().all()

@app.post("/api/v1/products", response_model=ProductRead)
async def create_product(product: ProductRead, db: AsyncSession = Depends(get_db)):
    # Simple create, assuming ProductRead can be used for input for now
    new_product = Product(**product.dict(exclude={'id'}))
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

@app.patch("/api/v1/products/{product_id}", response_model=ProductRead)
async def update_product(product_id: int, product_data: dict, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for key, value in product_data.items():
        setattr(product, key, value)
    
    await db.commit()
    await db.refresh(product)
    return product

@app.delete("/api/v1/products/{product_id}")
async def delete_product(product_id: int, db: AsyncSession = Depends(get_db)):
    product = await db.get(Product, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return {"status": "success"}

@app.post("/api/v1/bills/finalize")
async def create_bill(bill_data: BillCreate, db: AsyncSession = Depends(get_db)):
    from models import Bill, BillItem
    import random
    import string
    
    bill_no = "INV-" + "".join(random.choices(string.ascii_uppercase + string.digits, k=8))
    total = sum(item.qty * item.unit_price for item in bill_data.items)
    
    new_bill = Bill(
        bill_number=bill_no,
        customer_name=bill_data.customer_name,
        total_amount=total
    )
    db.add(new_bill)
    await db.flush()
    
    for item in bill_data.items:
        bill_item = BillItem(
            bill_id=new_bill.id,
            product_id=item.product_id,
            qty=item.qty,
            unit_price=item.unit_price
        )
        db.add(bill_item)
        
        # Update Stock
        product = await db.get(Product, item.product_id)
        if product:
            product.stock_qty -= item.qty
    
    await db.commit()
    return {"status": "success", "bill_number": bill_no, "total": total}

@app.get("/api/v1/reports/sales-summary")
async def get_sales_summary(db: AsyncSession = Depends(get_db)):
    from models import Bill
    from sqlalchemy import extract
    
    # Total revenue and bill count
    result = await db.execute(select(
        func.sum(Bill.total_amount).label("total_revenue"),
        func.count(Bill.id).label("total_bills")
    ))
    stats = result.mappings().first()
    
    # Sales by day (last 7 days)
    daily_sales = await db.execute(select(
        func.date(Bill.created_at).label("date"),
        func.sum(Bill.total_amount).label("amount")
    ).group_by(func.date(Bill.created_at)).order_by(func.date(Bill.created_at)).limit(7))
    
    return {
        "revenue": stats["total_revenue"] or 0,
        "bills": stats["total_bills"] or 0,
        "daily": daily_sales.mappings().all()
    }

@app.get("/api/v1/reports/inventory-valuation")
async def get_inventory_valuation(db: AsyncSession = Depends(get_db)):
    # Total value of stock (MRP * Qty)
    result = await db.execute(select(
        func.sum(Product.mrp * Product.stock_qty).label("total_value"),
        func.count(Product.id).label("total_skus")
    ))
    stats = result.mappings().first()
    
    # Value by category
    cat_stats = await db.execute(select(
        Product.category,
        func.sum(Product.mrp * Product.stock_qty).label("value")
    ).group_by(Product.category))
    
    return {
        "total_valuation": stats["total_value"] or 0,
        "total_skus": stats["total_skus"] or 0,
        "by_category": cat_stats.mappings().all()
    }

@app.get("/api/v1/schemes")
async def list_schemes(db: AsyncSession = Depends(get_db)):
    from models import Scheme
    result = await db.execute(select(Scheme).order_by(Scheme.is_active.desc(), Scheme.created_at.desc()))
    return result.scalars().all()

@app.post("/api/v1/schemes")
async def create_scheme(scheme_data: dict, db: AsyncSession = Depends(get_db)):
    from models import Scheme
    new_scheme = Scheme(**scheme_data)
    db.add(new_scheme)
    await db.commit()
    await db.refresh(new_scheme)
    return new_scheme

@app.patch("/api/v1/schemes/{scheme_id}")
async def update_scheme(scheme_id: int, scheme_data: dict, db: AsyncSession = Depends(get_db)):
    from models import Scheme
    scheme = await db.get(Scheme, scheme_id)
    if not scheme:
        raise HTTPException(status_code=404, detail="Scheme not found")
    
    for key, value in scheme_data.items():
        if hasattr(scheme, key):
            setattr(scheme, key, value)
            
    await db.commit()
    await db.refresh(scheme)
    return scheme

@app.get("/api/v1/alerts")
async def list_alerts(db: AsyncSession = Depends(get_db)):
    from models import Alert
    result = await db.execute(select(Alert).order_by(Alert.is_read.asc(), Alert.created_at.desc()))
    return result.scalars().all()

@app.patch("/api/v1/alerts/{alert_id}/read")
async def mark_alert_read(alert_id: int, db: AsyncSession = Depends(get_db)):
    from models import Alert
    alert = await db.get(Alert, alert_id)
    if alert:
        alert.is_read = True
        await db.commit()
    return {"status": "success"}

@app.get("/api/v1/bills/day-end-summary")
async def get_day_end_summary(db: AsyncSession = Depends(get_db)):
    from models import Bill
    from datetime import date
    
    # Simple logic for now
    result = await db.execute(select(
        func.sum(Bill.total_amount).label("total"),
        func.count(Bill.id).label("count")
    ).where(func.date(Bill.created_at) == date.today()))
    
    stats = result.mappings().first()
    return {
        "total_revenue": stats["total"] or 0,
        "total_bills": stats["count"] or 0,
        "cash_sales": (stats["total"] or 0) * 0.6,
        "upi_sales": (stats["total"] or 0) * 0.3,
        "card_sales": (stats["total"] or 0) * 0.1
    }

@app.get("/api/v1/ho/status")
async def get_ho_status():
    import random
    return {
        "connected": True,
        "last_sync": "2026-04-23T18:30:00Z",
        "pending_packets": random.randint(0, 15),
        "health": "excellent",
        "corporate_node": "HQ-MUM-01"
    }

@app.post("/api/v1/ho/sync")
async def trigger_ho_sync():
    return {
        "status": "success",
        "synced_records": 142,
        "bandwidth_used": "1.2 MB",
        "message": "Store-HO synchronization completed."
    }

@app.get("/api/v1/store/settings")
async def get_settings(db: AsyncSession = Depends(get_db)):
    from models import Store
    result = await db.execute(select(Store).limit(1))
    return result.scalar()

@app.patch("/api/v1/store/settings")
async def update_settings(settings_data: dict, db: AsyncSession = Depends(get_db)):
    from models import Store
    result = await db.execute(select(Store).limit(1))
    store = result.scalar()
    if store:
        for key, value in settings_data.items():
            if hasattr(store, key):
                setattr(store, key, value)
        await db.commit()
        await db.refresh(store)
    return store

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
