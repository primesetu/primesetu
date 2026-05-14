import asyncio
from database import engine, Base
from models import Scheme, Alert, Product, Bill, BillItem
from sqlalchemy import text
from datetime import datetime, timedelta

async def seed_extras():
    print("Seeding Additional Operational Data...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
        # 1. Seed Schemes
        await conn.execute(text("DELETE FROM schemes"))
        schemes = [
            {"name": "Summer Dhamaka 10%", "type": "percentage", "value": 10.0, "min_amount": 1000.0, "is_active": True},
            {"name": "Buy 2 Get 1 (Grocery)", "type": "bogo", "value": 0.0, "min_amount": 500.0, "is_active": True},
            {"name": "Inaugural Flat 50", "type": "flat", "value": 50.0, "min_amount": 200.0, "is_active": False}
        ]
        for s in schemes:
            await conn.execute(text("INSERT INTO schemes (name, type, value, min_amount, is_active) VALUES (:name, :type, :value, :min_amount, :is_active)"), s)

        # 2. Seed Alerts
        await conn.execute(text("DELETE FROM alerts"))
        alerts = [
            {"title": "Critical Stock: Parle-G", "message": "Parle-G 100g is below 5 units. Immediate refill required.", "category": "inventory", "priority": "high", "is_read": False},
            {"title": "Pending Sync", "message": "15 records pending for HO Handshake.", "category": "system", "priority": "medium", "is_read": False},
            {"title": "Security Audit", "message": "Terminal T1 performed a clean login.", "category": "security", "priority": "low", "is_read": True}
        ]
        for a in alerts:
            await conn.execute(text("INSERT INTO alerts (title, message, category, priority, is_read) VALUES (:title, :message, :category, :priority, :is_read)"), a)

        # 3. Seed some historical bills for MIS Trend
        await conn.execute(text("DELETE FROM bill_items"))
        await conn.execute(text("DELETE FROM bills"))
        
        for i in range(7):
            date = datetime.now() - timedelta(days=i)
            bill_no = f"INV-HIST-0{i}"
            total = 1500.0 + (i * 200)
            await conn.execute(text("INSERT INTO bills (bill_number, customer_name, total_amount, created_at) VALUES (:bill_no, 'Historical Customer', :total, :date)"), 
                             {"bill_no": bill_no, "total": total, "date": date})

    print("Seeding Completed Successfully.")

if __name__ == "__main__":
    asyncio.run(seed_extras())
