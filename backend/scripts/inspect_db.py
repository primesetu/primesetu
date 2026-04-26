import asyncio
import asyncpg
import os
from app.core.config import settings

async def inspect_db():
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    print(f"Items count: {await conn.fetchval('SELECT count(*) FROM items')}")
    print(f"Products count: {await conn.fetchval('SELECT count(*) FROM products')}")
    
    print("\nChecking Foreign Keys for transaction_items...")
    fk_query = """
        SELECT
            tc.constraint_name, 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name 
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name='transaction_items';
    """
    fks = await conn.fetch(fk_query)
    for fk in fks:
        print(f"Constraint: {fk['constraint_name']} | Column: {fk['column_name']} -> {fk['foreign_table_name']}({fk['foreign_column_name']})")
    
    await conn.close()

if __name__ == "__main__":
    asyncio.run(inspect_db())
