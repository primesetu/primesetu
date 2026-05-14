
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from datetime import datetime

DB_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def fix_dayendpgms():
    engine = create_async_engine(DB_URL)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        # Check if 2 exists
        res = await session.execute(text("SELECT pgmindex FROM shoper9.dayendpgms WHERE pgmindex = 2"))
        if not res.first():
            await session.execute(text("""
                INSERT INTO shoper9.dayendpgms (pgmindex, pgmexe, pgmdesc, pgmopt, pgmflag, pgmdate, vauid, vactr, vatermid, vacompcode) 
                VALUES (2, 'SE301500.EXE', 'Sync To HO', '0', True, :dt, 'super', 2733, '.', 'X01')
            """), {"dt": datetime.now()})
            await session.commit()
            print("DayEndPgms (Index 2) inserted.")
        else:
            print("DayEndPgms (Index 2) already exists.")

if __name__ == "__main__":
    asyncio.run(fix_dayendpgms())
