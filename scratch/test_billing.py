
import asyncio
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.core.database import engine
from backend.app.models.base import Store, Product, Inventory, Customer
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

client = TestClient(app)

async def setup_test_data():
    async with engine.begin() as conn:
        # Create Store
        await conn.execute(text("INSERT INTO stores (id, name, type, is_active) VALUES ('CSW', 'Citywalk Main', 'Retail', true) ON CONFLICT DO NOTHING"))
        
        # Create Product
        product_id = "00000000-0000-0000-0000-000000000001"
        await conn.execute(text(f"""
            INSERT INTO products (id, code, name, mrp, cost_price, tax_rate, is_tax_inclusive, is_inventory_item, is_active, lsq, attributes) 
            VALUES ('{product_id}', 'SKU001', 'Test Shoe', 999.00, 500.00, 18.0, true, true, true, 1.0, '{{}}'::json) 
            ON CONFLICT DO NOTHING
        """))
        
        # Create Inventory
        await conn.execute(text(f"""
            INSERT INTO inventory (id, product_id, store_id, quantity, min_stock) 
            VALUES ('00000000-0000-0000-0000-000000000002', '{product_id}', 'CSW', 10.0, 2.0) 
            ON CONFLICT DO NOTHING
        """))

from backend.app.core.security import get_current_user, UserContext

def override_get_current_user():
    return UserContext(
        user_id="user-123",
        email="test@primesetu.com",
        role="OWNER",
        store_id="CSW",
        permissions=[]
    )

from httpx import AsyncClient, ASGITransport

app.dependency_overrides[get_current_user] = override_get_current_user

async def test_billing():
    await setup_test_data()
    
    print("Test data setup complete. Simulating Finalize Bill Request...")
    
    payload = {
        "customer_mobile": "9876543210",
        "type": "Sales",
        "items": [
            {
                "product_id": "00000000-0000-0000-0000-000000000001",
                "qty": 1,
                "unit_price": 999.00,
                "discount_per": 0.0,
                "tax_per": 18.0
            }
        ],
        "payments": [
            {
                "mode": "CASH",
                "amount": 999.00
            }
        ]
    }
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        response = await client.post("/api/v1/bills/finalize", json=payload)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")

if __name__ == "__main__":
    asyncio.run(test_billing())
