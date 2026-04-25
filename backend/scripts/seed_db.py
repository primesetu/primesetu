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

import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, engine, Base
from models import Product, Till

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Seed Tills
        tills = [
            Till(name="Main Counter 1", code="POS-01", status="open", cash_collected=12500.0),
            Till(name="Express Lane 2", code="POS-02", status="closed", cash_collected=0.0),
        ]

        # Seed Products
        products = [
            Product(sku="SKU-0112", name="Parle-G 100g", barcode="8901496100106", mrp=10.0, stock_qty=4, category="Grocery"),
            Product(sku="SKU-0234", name="Tata Salt 1kg", barcode="8901725111473", mrp=28.0, stock_qty=12, category="Grocery"),
            Product(sku="SKU-0556", name="Maggi Noodles", barcode="8901063151468", mrp=14.0, stock_qty=3, category="Grocery"),
            Product(sku="SKU-0389", name="Amul Butter", barcode="8901063151468", mrp=265.0, stock_qty=9, category="Dairy"),
            Product(sku="SKU-0445", name="Fortune Oil 5L", barcode="8901499010401", mrp=840.0, stock_qty=88, category="Grocery"),
        ]
        
        # Idempotent Seed for Products
        for p in products:
            await session.execute(text("""
                INSERT INTO inventory (sku, name, barcode, mrp, stock_qty, category)
                VALUES (:sku, :name, :barcode, :mrp, :stock_qty, :category)
                ON CONFLICT (sku) DO UPDATE SET
                    stock_qty = EXCLUDED.stock_qty,
                    mrp = EXCLUDED.mrp;
            """), {
                "sku": p.sku,
                "name": p.name,
                "barcode": p.barcode,
                "mrp": p.mrp,
                "stock_qty": p.stock_qty,
                "category": p.category
            })
        
        # Idempotent Seed for Tills
        for t in tills:
            await session.execute(text("""
                INSERT INTO tills (name, code, status, cash_collected)
                VALUES (:name, :code, :status, :cash_collected)
                ON CONFLICT (code) DO UPDATE SET
                    status = EXCLUDED.status,
                    cash_collected = EXCLUDED.cash_collected;
            """), {
                "name": t.name,
                "code": t.code,
                "status": t.status,
                "cash_collected": t.cash_collected
            })

        await session.commit()
        print("Sovereign Database Refreshed with Demo Data.")

if __name__ == "__main__":
    asyncio.run(seed())
