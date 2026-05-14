
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def check_schema():
    async with engine.connect() as conn:
        query = text("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'shoper9' AND table_name = 'vamenu'
        """)
        result = await conn.execute(query)
        rows = result.fetchall()
        if not rows:
            print("Table 'shoper9.vamenu' not found.")
        else:
            print("PostgreSQL Columns for shoper9.vamenu:")
            for row in rows:
                print(f"  {row[0]}: {row[1]}")

if __name__ == "__main__":
    asyncio.run(check_schema())
