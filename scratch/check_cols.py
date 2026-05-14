
import asyncio
from sqlalchemy import text
from backend.app.core.database import engine

async def check_columns():
    async with engine.connect() as conn:
        for table in ['bills', 'bill_items', 'inventory', 'products', 'users', 'stores']:
            print(f"\nTable: {table}")
            try:
                result = await conn.execute(text(f"SELECT column_name, data_type FROM information_schema.columns WHERE table_name = '{table}'"))
                for row in result:
                    print(f"  {row[0]}: {row[1]}")
            except Exception as e:
                print(f"  Error: {e}")

if __name__ == "__main__":
    asyncio.run(check_columns())
