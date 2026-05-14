
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_out_of_stock_configs():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        print("--- SYSPARAM (Out of Stock / Negative Stock) ---")
        keywords = ['neg', 'zero', 'allow', 'restrict', 'stock', 'out']
        
        # Search for negative stock and restrict settings
        query = "SELECT paramcode, descr, boolean, intg, txt FROM shoper9.sysparam WHERE "
        query += " OR ".join([f"lower(paramcode) LIKE '%{kw}%' OR lower(descr) LIKE '%{kw}%'" for kw in keywords])
        
        try:
            result = await session.execute(text(query))
            params = result.all()
            for p in params:
                val = p.boolean if p.boolean is not None else \
                      p.intg if p.intg is not None else \
                      p.txt if p.txt is not None else "N/A"
                # Filter for most relevant results manually to avoid too much noise
                relevant_keywords = ['negative', 'restrict', 'allow', 'zero', 'stock check']
                if any(rk in p.paramcode.lower() or rk in p.descr.lower() for rk in relevant_keywords):
                    print(f"[{p.paramcode}] = {val} | {p.descr}")
        except Exception as e:
            print(f"Sysparam search failed: {e}")

        print("\n--- GENLOOKUP (Status/Stock Modes) ---")
        try:
            # Search for anything related to stock status or out of stock in descr
            res = await session.execute(text("SELECT code, descr FROM shoper9.genlookup WHERE lower(descr) LIKE '%stock%' OR lower(descr) LIKE '%out%' LIMIT 20"))
            items = res.all()
            for item in items:
                print(f"  - {item.code}: {item.descr}")
        except Exception as e:
            print(f"Genlookup search failed: {e}")

if __name__ == "__main__":
    asyncio.run(check_out_of_stock_configs())
