
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_sales_billing_configs():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("--- SYSPARAM (Sales/Billing) ---")
        keywords = ['sale', 'bill', 'tax', 'disc', 'price', 'cash', 'pay', 'round']
        
        query = "SELECT paramcode, descr, boolean, intg, txt FROM shoper9.sysparam WHERE "
        query += " OR ".join([f"lower(paramcode) LIKE '%{kw}%' OR lower(descr) LIKE '%{kw}%'" for kw in keywords])
        
        try:
            result = await session.execute(text(query))
            params = result.all()
            for p in params:
                val = p.boolean if p.boolean is not None else \
                      p.intg if p.intg is not None else \
                      p.txt if p.txt is not None else "N/A"
                print(f"[{p.paramcode}] = {val} | {p.descr}")
        except Exception as e:
            print(f"Sysparam search failed: {e}")

        print("\n--- GENLOOKUP (Sample Categories) ---")
        try:
            # Check if table exists first
            res = await session.execute(text("SELECT table_name FROM information_schema.tables WHERE table_name = 'genlookup' AND table_schema = 'shoper9'"))
            if res.first():
                # Get some samples
                res = await session.execute(text("SELECT DISTINCT category FROM shoper9.genlookup LIMIT 20"))
                cats = [r[0] for r in res.all()]
                print("Available Categories in GenLookup:", cats)
                
                # Search for billing/payment categories
                res = await session.execute(text("SELECT code, description FROM shoper9.genlookup WHERE lower(category) LIKE '%pay%' OR lower(category) LIKE '%sale%' LIMIT 20"))
                items = res.all()
                for item in items:
                    print(f"  - {item.code}: {item.description}")
            else:
                print("Table 'genlookup' does not exist in shoper9 schema.")
        except Exception as e:
            print(f"Genlookup search failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_sales_billing_configs())
