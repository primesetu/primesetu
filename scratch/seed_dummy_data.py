# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Seed Dummy Data Script
# ============================================================
import asyncio
import uuid
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy import select, delete
from backend.app.core.database import AsyncSessionLocal, engine
from backend.app.models.base import Store, Product, Inventory, Customer, Partner, GeneralLookup, TaxMaster

async def seed_data():
    async with AsyncSessionLocal() as session:
        # 1. Create Store
        store_id = "X01"
        result = await session.execute(select(Store).where(Store.id == store_id))
        store = result.scalar_one_or_none()
        if not store:
            store = Store(
                id=store_id,
                name="Citywalk Main Terminal",
                address="Colaba Causeway, Mumbai",
                type="Retail",
                is_active=True
            )
            session.add(store)
            print(f"Added Store: {store_id}")
        
        # 2. Create Tax Master
        tax_name = "GST Footwear"
        result = await session.execute(select(TaxMaster).where(TaxMaster.name == tax_name))
        tax_master = result.scalar_one_or_none()
        if not tax_master:
            tax_master = TaxMaster(
                name=tax_name,
                hsn_code="6403",
                slabs=[
                    {"min": 0, "max": 999, "rate": 5},
                    {"min": 1000, "max": 999999, "rate": 12}
                ]
            )
            session.add(tax_master)
            print(f"Added Tax Master: {tax_name}")

        # 3. Create General Lookups
        lookups = [
            ("CATEGORY", "FORMAL", "Formal Shoes"),
            ("CATEGORY", "CASUAL", "Casual Sneakers"),
            ("CATEGORY", "SPORTS", "Sports & Running"),
            ("BRAND", "NIKE", "Nike India"),
            ("BRAND", "ADIDAS", "Adidas Originals"),
            ("BRAND", "BATA", "Bata Premium"),
            ("BRAND", "WOODLAND", "Woodland Rugged"),
            ("SIZE_GROUP", "UK_ADULT", "UK Adult Sizes")
        ]
        for cat, code, name in lookups:
            result = await session.execute(select(GeneralLookup).where(GeneralLookup.category == cat, GeneralLookup.code == code))
            if not result.scalar_one_or_none():
                session.add(GeneralLookup(category=cat, code=code, name=name))
                print(f"Added Lookup: {cat} - {code}")

        # 4. Create Products and Inventory
        products_data = [
            {"code": "FW-001", "name": "Air Max Infinity", "brand": "NIKE", "category": "SPORTS", "mrp": 8999.00, "cost_price": 5400.00},
            {"code": "FW-002", "name": "Stan Smith Classic", "brand": "ADIDAS", "category": "CASUAL", "mrp": 7599.00, "cost_price": 4500.00},
            {"code": "FW-003", "name": "Bata Oxford Tan", "brand": "BATA", "category": "FORMAL", "mrp": 2499.00, "cost_price": 1200.00},
            {"code": "FW-004", "name": "Woodland Trekker", "brand": "WOODLAND", "category": "CASUAL", "mrp": 4295.00, "cost_price": 2600.00},
            {"code": "FW-005", "name": "Nike Revolution 6", "brand": "NIKE", "category": "SPORTS", "mrp": 3695.00, "cost_price": 2100.00},
            {"code": "FW-006", "name": "Bata Derby Black", "brand": "BATA", "category": "FORMAL", "mrp": 1899.00, "cost_price": 950.00},
        ]

        for p_data in products_data:
            result = await session.execute(select(Product).where(Product.code == p_data["code"]))
            product = result.scalar_one_or_none()
            if not product:
                product = Product(
                    code=p_data["code"],
                    name=p_data["name"],
                    brand=p_data["brand"],
                    category=p_data["category"],
                    mrp=Decimal(str(p_data["mrp"])),
                    cost_price=Decimal(str(p_data["cost_price"])),
                    tax_rate=Decimal("12.0"),
                    is_tax_inclusive=True
                )
                session.add(product)
                await session.flush() # Get product.id
                print(f"Added Product: {p_data['code']}")

                # Add Inventory
                session.add(Inventory(
                    product_id=product.id,
                    store_id=store_id,
                    quantity=Decimal("50.000"),
                    min_stock=Decimal("10.000")
                ))
                print(f"Added Inventory for: {p_data['code']}")

        # 5. Create Customers
        customers_data = [
            {"mobile": "9876543210", "name": "Jawahar R Mallah", "email": "jawahar@aitdl.net"},
            {"mobile": "9999888877", "name": "Aman Gupta", "email": "aman@example.com"},
            {"mobile": "9000100020", "name": "Sneha Kapoor", "email": "sneha@example.com"},
        ]
        for c_data in customers_data:
            result = await session.execute(select(Customer).where(Customer.mobile == c_data["mobile"]))
            if not result.scalar_one_or_none():
                session.add(Customer(
                    mobile=c_data["mobile"],
                    name=c_data["name"],
                    email=c_data["email"],
                    loyalty_points=150
                ))
                print(f"Added Customer: {c_data['name']}")

        # 6. Create Partners (Vendors)
        partners_data = [
            {"type": "VENDOR", "code": "V-NIKE", "name": "Nike India Pvt Ltd", "mobile": "18001026453", "gst_no": "27AAACN0123A1Z1"},
            {"type": "VENDOR", "code": "V-BATA", "name": "Bata India Limited", "mobile": "18004192282", "gst_no": "19AAACB0456B2Z2"},
        ]
        for p_data in partners_data:
            result = await session.execute(select(Partner).where(Partner.code == p_data["code"]))
            if not result.scalar_one_or_none():
                session.add(Partner(
                    type=p_data["type"],
                    code=p_data["code"],
                    name=p_data["name"],
                    mobile=p_data["mobile"],
                    gst_no=p_data["gst_no"]
                ))
                print(f"Added Partner: {p_data['name']}")

        await session.commit()
        print("Successfully seeded dummy data!")

if __name__ == "__main__":
    asyncio.run(seed_data())
