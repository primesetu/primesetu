import asyncio
import os
import sys
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add the project root to sys.path to import our config
sys.path.append(os.getcwd())

async def debug_db():
    # Force the correct URL from .env
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    print(f"Connecting to: {url}")
    
    engine = create_async_engine(url)
    
    async with engine.connect() as conn:
        # 1. Check if schema exists
        res = await conn.execute(text("SELECT schema_name FROM information_schema.schemata WHERE schema_name = 'shoper9'"))
        print(f"Schema 'shoper9' exists: {res.fetchone() is not None}")
        
        # 2. Find the table
        res = await conn.execute(text("SELECT table_schema, table_name FROM information_schema.tables WHERE table_name ILIKE '%class12combo%'"))
        tables = res.fetchall()
        print(f"Tables matching 'class12combo': {tables}")
        
        if tables:
            schema, table = tables[0]
            # 3. Check columns
            res = await conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = '{schema}'"))
            cols = [r[0] for r in res.fetchall()]
            print(f"Columns for {schema}.{table}: {cols}")
            
            # 4. Check data count
            try:
                res = await conn.execute(text(f"SELECT COUNT(*) FROM {schema}.{table}"))
                print(f"Row count: {res.scalar()}")
                
                # 5. Sample data
                res = await conn.execute(text(f"SELECT * FROM {schema}.{table} LIMIT 3"))
                print(f"Sample rows: {res.fetchall()}")
            except Exception as e:
                print(f"Error reading table: {e}")
        
        # 6. Check GenLookup (for Brands/Products)
        res = await conn.execute(text("SELECT COUNT(*) FROM shoper9.genlookup WHERE recid IN (1, 2)"))
        print(f"GenLookup records for recid 1,2: {res.scalar()}")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(debug_db())
