import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def apply_migration():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    # Standardize URL for asyncpg
    db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
    
    migration_path = r"d:\IMP\GitHub\primesetu\supabase\migrations\20260501000001_hard_reset_live_port.sql"
    
    print(f"Connecting to SMRITI-OS Database (async)...")
    try:
        conn = await asyncpg.connect(db_url)
        
        print(f"Executing Hard Reset and Migration: {migration_path}")
        with open(migration_path, 'r') as f:
            sql = f.read()
            
        # Execute the SQL
        # Note: asyncpg.execute can handle multiple statements
        await conn.execute(sql)
        
        print("MIGRATION SUCCESSFUL: SMRITI-OS is now in sync with Shoper 9 Live Schema.")
        await conn.close()
    except Exception as e:
        print(f"MIGRATION FAILED: {str(e)}")

if __name__ == '__main__':
    asyncio.run(apply_migration())
