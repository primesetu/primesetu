import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

async def upgrade_users_table():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("DATABASE_URL not found in .env")
        return
        
    engine = create_async_engine(db_url)
    
    async with engine.begin() as conn:
        print("Checking if preferences column exists in users table...")
        
        # Add column if not exists
        try:
            await conn.execute(text("ALTER TABLE users ADD COLUMN preferences JSON DEFAULT '{}';"))
            print("Successfully added preferences JSON column to users table.")
        except Exception as e:
            print("Notice:", str(e))
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(upgrade_users_table())
