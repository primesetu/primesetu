import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
import os
import sys

# Add parent dir to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def rename_schema():
    print("--- SMRITI-OS: Schema Rename Utility ---")
    
    old_name = "shoper9"
    new_name = "s9"
    
    engine = create_async_engine(settings.local_database_url)
    
    async with engine.begin() as conn:
        print(f"Checking if schema '{old_name}' exists...")
        res = await conn.execute(text(f"SELECT schema_name FROM information_schema.schemata WHERE schema_name = '{old_name}'"))
        exists = res.scalar()
        
        if not exists:
            print(f"Error: Schema '{old_name}' not found. Maybe it's already renamed?")
            return

        print(f"Renaming schema '{old_name}' to '{new_name}'...")
        try:
            await conn.execute(text(f"ALTER SCHEMA {old_name} RENAME TO {new_name}"))
            print(f"Success! Schema renamed to '{new_name}'.")
        except Exception as e:
            print(f"Error renaming schema: {e}")
            return

    # Update .env file
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            lines = f.readlines()
        
        with open(env_path, 'w') as f:
            for line in lines:
                if line.startswith("LEGACY_SCHEMA="):
                    f.write(f"LEGACY_SCHEMA={new_name}\n")
                else:
                    f.write(line)
        print(f"Updated .env: LEGACY_SCHEMA={new_name}")

    await engine.dispose()
    print("--- RENAME COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(rename_schema())
