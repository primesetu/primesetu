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
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, engine, Base
from models import Product, Till

async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # Seed Products
        products = [
            Product(sku="SKU-0112", name="Parle-G 100g", barcode="8901496100106", mrp=10.0, stock_qty=4, category="Grocery"),
            Product(sku="SKU-0234", name="Tata Salt 1kg", barcode="8901725111473", mrp=28.0, stock_qty=12, category="Grocery"),
            Product(sku="SKU-0556", name="Maggi Noodles", barcode="8901063151468", mrp=14.0, stock_qty=3, category="Grocery"),
            Product(sku="SKU-0389", name="Amul Butter", barcode="8901063151468", mrp=265.0, stock_qty=9, category="Dairy"),
            Product(sku="SKU-0445", name="Fortune Oil 5L", barcode="8901499010401", mrp=840.0, stock_qty=88, category="Grocery"),
        ]
        
        # Seed Tills
        tills = [
            Till(name="Till 1 — Entrance", code="T1", status="open", cash_collected=28400.0),
            Till(name="Till 2 — Main Counter", code="T2", status="open", cash_collected=42800.0),
            Till(name="Till 3 — Express", code="T3", status="locked", cash_collected=18200.0),
        ]

        session.add_all(products)
        session.add_all(tills)
        await session.commit()
        print("Sovereign Database Seeded Successfully.")

if __name__ == "__main__":
    asyncio.run(seed())
