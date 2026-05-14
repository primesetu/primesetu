
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def find_billing_params():
    async with engine.connect() as conn:
        # Search in lowercase sysparam
        query = text("""
            SELECT "paramcode", "descr", "txt", "intg", "boolean" 
            FROM shoper9.sysparam 
            WHERE "descr" ILIKE '%bill%' 
               OR "descr" ILIKE '%sale%' 
               OR "descr" ILIKE '%round%'
               OR "descr" ILIKE '%disc%'
            LIMIT 100
        """)
        result = await conn.execute(query)
        for row in result:
            val = row[2] if row[2] else (row[3] if row[3] is not None else row[4])
            print(f"{row[0]}: {row[1]} -> {val}")

if __name__ == "__main__":
    asyncio.run(find_billing_params())
