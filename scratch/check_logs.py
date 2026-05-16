import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import select
from app.models.sovereign import SmritiBarcodePrintLog

async def check_logs():
    async with AsyncSessionLocal() as db:
        res = await db.execute(select(SmritiBarcodePrintLog).limit(5))
        logs = res.scalars().all()
        print(f"Total Logs in DB: {len(logs)}")
        for l in logs:
            print(f"Log: {l.created_at} | SKU: {l.stock_no} | Qty: {l.qty}")

if __name__ == "__main__":
    asyncio.run(check_logs())
