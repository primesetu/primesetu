import asyncio
import asyncpg
from app.core.config import settings

async def fix_constraints():
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    print("Clearing existing transactions for a clean sync...")
    await conn.execute("TRUNCATE TABLE transaction_items CASCADE")
    await conn.execute("TRUNCATE TABLE transactions CASCADE")
    
    print("Fixing transaction_items foreign key...")
    try:
        async with conn.transaction():
            # 1. Drop old constraint pointing to 'products'
            await conn.execute("ALTER TABLE transaction_items DROP CONSTRAINT IF EXISTS transaction_items_product_id_fkey")
            
            # 2. Add new constraint pointing to 'items'
            await conn.execute("ALTER TABLE transaction_items ADD CONSTRAINT transaction_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES items(id) ON DELETE CASCADE")
            
            print("Constraint successfully pointed to 'items' table.")
    except Exception as e:
        print(f"Migration Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(fix_constraints())
