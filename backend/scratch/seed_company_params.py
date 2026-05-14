import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

async def main():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        params = [
            ('CompanyName', 'Shoper Company Name', 'Citywalk Shoes-Seawood', 'FIRM'),
            ('CompanyCode', 'Shoper Company Code', 'X01', 'FIRM'),
            ('CompanyAddr1', 'Address Line 1', 'Seawood Grand Central Mall', 'FIRM'),
            ('CompanyAddr2', 'Address Line 2', 'Navi Mumbai', 'FIRM'),
        ]
        
        for code, descr, val, cat in params:
            query = text("""
                INSERT INTO smriti_param (param_code, descr, value_txt, category, value_bool, value_int)
                VALUES (:code, :descr, :val, :cat, false, 0)
                ON CONFLICT (param_code) DO UPDATE
                SET value_txt = EXCLUDED.value_txt,
                    descr = EXCLUDED.descr,
                    category = EXCLUDED.category
            """)
            await session.execute(query, {"code": code, "descr": descr, "val": val, "cat": cat})
        
        await session.commit()
        print("Sovereign SmritiParam updated successfully.")

if __name__ == "__main__":
    asyncio.run(main())
