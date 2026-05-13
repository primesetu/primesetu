import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.database import engine as cloud_engine
from app.core.config import settings
from app.models.legacy_s9 import Base, Itemmaster

async def migrate_to_local():
    print("--- SMRITI-OS: Local Development Recovery ---")
    print(f"Source: Supabase (Cloud)")
    print(f"Target: Local Postgres ({settings.local_database_url.split('@')[-1]})")

    # 1. Fetch from Cloud
    print("\n[1/3] Fetching 1219 records from Supabase...")
    async with cloud_engine.connect() as cloud_conn:
        try:
            res = await cloud_conn.execute(text("SELECT * FROM shoper9.itemmaster"))
            columns = res.keys()
            rows = res.fetchall()
            data = [dict(zip(columns, row)) for row in rows]
            print(f"Found {len(data)} records.")
        except Exception as e:
            print(f"Error fetching from cloud: {e}")
            return

    # 2. Setup Local Tables
    print("\n[2/3] Setting up local schema and tables...")
    local_engine = create_async_engine(settings.local_database_url)
    async with local_engine.begin() as local_conn:
        await local_conn.execute(text("CREATE SCHEMA IF NOT EXISTS shoper9"))
        # Create all tables including itemmaster
        await local_conn.run_sync(Base.metadata.create_all)
        print("Local tables verified/created.")

    # 3. Insert into Local
    print("\n[3/3] Inserting data into local database...")
    async with local_engine.begin() as local_conn:
        # Clear existing data to avoid PK conflicts
        await local_conn.execute(text("TRUNCATE TABLE shoper9.itemmaster CASCADE"))
        
        # Batch insert for speed
        if data:
            # We use the table object directly for insertion
            await local_conn.execute(Itemmaster.__table__.insert(), data)
            print(f"Successfully migrated {len(data)} items to local database.")

    await local_engine.dispose()
    print("\n--- DONE: You are now fully local! ---")

if __name__ == "__main__":
    asyncio.run(migrate_to_local())
