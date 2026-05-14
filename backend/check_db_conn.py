import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text, select
import sys

async def check_db():
    # Load from environment or use direct string for testing
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@127.0.0.1:5434/smriti_local"
    print(f"Checking connection to: {url}")
    
    engine = create_async_engine(url)
    try:
        async with engine.connect() as conn:
            # 1. Basic Ping
            res = await conn.execute(text("SELECT 1"))
            print(f"SUCCESS: Ping successful. (Result: {res.scalar()})")
            
            # 2. Check Schema 's9'
            res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 's9'"))
            schema = res.scalar()
            if schema:
                print(f"SUCCESS: Schema 's9' found.")
            else:
                print(f"WARNING: Schema 's9' NOT found.")
                
            # 3. Check Tables in s9
            res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema = 's9' AND table_name = 'itemmaster'"))
            table = res.scalar()
            if table:
                print(f"SUCCESS: Table 'itemmaster' found in 's9'.")
                # Count records
                count_res = await conn.execute(text("SELECT count(*) FROM s9.itemmaster"))
                print(f"INFO: Total records in s9.itemmaster: {count_res.scalar()}")
            else:
                print(f"WARNING: Table 'itemmaster' NOT found in 's9'.")
                
            # 4. Check SmritiParam table
            res = await conn.execute(text("SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'smriti_param')"))
            exists = res.scalar()
            if exists:
                print("SUCCESS: Table 'smriti_param' exists in public schema.")
            else:
                print("WARNING: Table 'smriti_param' NOT found.")

    except Exception as e:
        print(f"FAILURE: Could not connect to database. Error: {str(e)}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
