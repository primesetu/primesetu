import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

async def main():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Check shoper9.sysparam (legacy mirror)
        try:
            query = text("SELECT paramcode, txt FROM shoper9.sysparam WHERE paramcode = 'CompanyName'")
            result = await session.execute(query)
            row = result.fetchone()
            if row:
                print(f"Legacy Mirror (shoper9.sysparam): {row[0]} = {row[1]}")
            else:
                print("No CompanyName found in shoper9.sysparam")
        except Exception as e:
            print(f"Error checking shoper9 schema: {e}")

if __name__ == "__main__":
    asyncio.run(main())
