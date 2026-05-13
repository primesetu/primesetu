import asyncio
import os
import sys
from datetime import datetime
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set up DB connection string
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    DATABASE_URL = "postgresql+asyncpg://postgres:postgres@localhost:5432/smriti_os"

async def trace_latest_transactions():
    print(f"Connecting to database...")
    engine = create_async_engine(DATABASE_URL)
    
    tables_to_watch = [
        "shoper9.stktrnhdr",
        "shoper9.stktrndtl",
        "shoper9.taxdtl",
        "shoper9.poscash",
        "shoper9.vouchhdr",
        "shoper9.vouchdtl"
    ]
    
    try:
        async with engine.connect() as conn:
            print("\n--- SHOPER 9 TRACER ACTIVATED ---")
            print("Listening for latest transactions...\n")
            
            last_counts = {}
            
            while True:
                for table in tables_to_watch:
                    try:
                        # Get count
                        count_res = await conn.execute(text(f"SELECT COUNT(*) FROM {table}"))
                        count = count_res.scalar()
                        
                        if table not in last_counts:
                            last_counts[table] = count
                            print(f"Initial Count [{table.upper()}]: {count}")
                        
                        if count > last_counts[table]:
                            diff = count - last_counts[table]
                            print(f"\n[{datetime.now().strftime('%H:%M:%S')}] NEW RECORD in POSTGRES {table.upper()}! (+{diff})")
                            
                            try:
                                res = await conn.execute(text(f"SELECT * FROM {table} ORDER BY docdt DESC LIMIT 1"))
                                row = res.fetchone()
                                if row:
                                    print(f"  -> LATEST: {dict(row._mapping)}")
                            except Exception:
                                res = await conn.execute(text(f"SELECT * FROM {table} LIMIT 1"))
                                row = res.fetchone()
                                if row:
                                    print(f"  -> SAMPLE: {dict(row._mapping)}")
                                    
                            last_counts[table] = count
                            print("-" * 50)
                            
                    except Exception as e:
                        # Table might not exist yet in some schemas
                        pass
                
                await asyncio.sleep(2)
    except Exception as e:
        print(f"Connection Error: {e}")
    finally:
        await engine.dispose()

if __name__ == "__main__":
    asyncio.run(trace_latest_transactions())
