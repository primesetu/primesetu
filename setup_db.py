import asyncio
from sqlalchemy import text
from database import engine

async def setup():
    async with engine.begin() as conn:
        # Create users table if it doesn't exist
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS users (
                id character varying PRIMARY KEY,
                store_id character varying,
                email character varying,
                full_name character varying,
                role character varying,
                active boolean DEFAULT true,
                created_at timestamp without time zone DEFAULT now()
            )
        """))
        
        # Add code to stores if missing
        try:
            await conn.execute(text("ALTER TABLE stores ADD COLUMN code character varying UNIQUE;"))
            print("Added code column to stores.")
        except Exception as e:
            print("code column might already exist:", e)

if __name__ == "__main__":
    asyncio.run(setup())
