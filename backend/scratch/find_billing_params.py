
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_billing_params():
    async with engine.connect() as conn:
        query = text("""
            SELECT "ParamCode", "Descr", "Txt", "Intg", "Boolean" 
            FROM shoper9."SysParam" 
            WHERE "Descr" ILIKE '%bill%' 
               OR "Descr" ILIKE '%sale%' 
               OR "Descr" ILIKE '%round%'
               OR "Descr" ILIKE '%disc%'
            LIMIT 100
        """)
        result = await conn.execute(query)
        for row in result:
            val = row[2] if row[2] else (row[3] if row[3] is not None else row[4])
            print(f"{row[0]}: {row[1]} -> {val}")

if __name__ == "__main__":
    asyncio.run(find_billing_params())
