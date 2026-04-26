import asyncio
import asyncpg
import os
from app.core.config import settings

async def apply_migration():
    print("Applying Shoper 9 DNA Migration...")
    
    # Path to migration file
    migration_path = os.path.join("supabase", "migrations", "20260426173100_add_shoper9_dna_columns.sql")
    
    with open(migration_path, "r") as f:
        sql = f.read()

    # Convert sqlalchemy url to asyncpg url
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(url)
        # Execute the SQL
        # We split by semicolon if needed, but asyncpg can execute blocks
        await conn.execute(sql)
        await conn.close()
        print("Migration Applied Successfully.")
    except Exception as e:
        print(f"Migration Error: {e}")

if __name__ == "__main__":
    asyncio.run(apply_migration())
