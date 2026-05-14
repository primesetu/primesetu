import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def list_local_content():
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)
    async with engine.connect() as conn:
        print("SMRITI-OS LOCAL DATABASE AUDIT (smriti_local)\n")
        
        for schema in ['shoper9', 'public']:
            print(f"--- Schema: {schema} ---")
            try:
                # Get all tables in schema
                result = await conn.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema = '{schema}'"))
                tables = [r[0] for r in result.all()]
                
                if not tables:
                    print("  No tables found.")
                    continue
                    
                for table in sorted(tables):
                    try:
                        count_res = await conn.execute(text(f"SELECT COUNT(*) FROM {schema}.{table}"))
                        count = count_res.scalar()
                        print(f"  {table.ljust(30)} : {count} rows")
                    except Exception as e:
                        print(f"  {table.ljust(30)} : Error ({e})")
            except Exception as e:
                print(f"  Error listing tables in {schema}: {e}")
            print()
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(list_local_content())
