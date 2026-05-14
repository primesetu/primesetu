
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_sysparam():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Checking SYSPARAM for Stock/Inventory configurations...")
        # Keywords to search for
        keywords = ['stock', 'inv', 'check', 'inquiry', 'neg']
        
        # Use paramcode instead of paramname as per hint
        query = "SELECT paramcode, paramvalue, description FROM shoper9.sysparam WHERE "
        query += " OR ".join([f"lower(paramcode) LIKE '%{kw}%' OR lower(description) LIKE '%{kw}%'" for kw in keywords])
        
        try:
            result = await session.execute(text(query))
            params = result.all()
            
            if not params:
                print("No matching parameters found in SYSPARAM.")
            else:
                for p in params:
                    print(f"[{p.paramcode}] = '{p.paramvalue}' | {p.description}")
        except Exception as e:
            print(f"Error executing query: {e}")
            # Try to list columns if it fails again
            res = await session.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'sysparam' AND table_schema = 'shoper9'"))
            print("Actual Columns in sysparam:", [r[0] for r in res.all()])

if __name__ == "__main__":
    asyncio.run(check_sysparam())
