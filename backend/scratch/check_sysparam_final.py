
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_sysparam_final():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("Checking SYSPARAM for Stock/Inventory configurations (Sovereign Schema)...")
        
        # Search for paramcode or description containing keywords
        keywords = ['stock', 'inv', 'check', 'inquiry', 'neg', 'pos', 'trn']
        
        query = "SELECT paramcode, descr, boolean, intg, txt FROM shoper9.sysparam WHERE "
        query += " OR ".join([f"lower(paramcode) LIKE '%{kw}%' OR lower(descr) LIKE '%{kw}%'" for kw in keywords])
        
        result = await session.execute(text(query))
        params = result.all()
        
        if not params:
            print("No matching parameters found in SYSPARAM.")
        else:
            print(f"{'PARAM CODE':<25} | {'VALUE':<10} | {'DESCRIPTION'}")
            print("-" * 80)
            for p in params:
                # Determine value based on which column is not None
                val = p.boolean if p.boolean is not None else \
                      p.intg if p.intg is not None else \
                      p.txt if p.txt is not None else "N/A"
                
                print(f"{p.paramcode:<25} | {str(val):<10} | {p.descr}")

if __name__ == "__main__":
    asyncio.run(check_sysparam_final())
