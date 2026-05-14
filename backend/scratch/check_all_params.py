import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text

async def main():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        query = text("SELECT param_code, descr, value_txt FROM smriti_param")
        result = await session.execute(query)
        rows = result.fetchall()
        print("All Sovereign SysParams:")
        for row in rows:
            print(f"Code: {row[0]:<20} | Value: {row[2]}")

if __name__ == "__main__":
    asyncio.run(main())
