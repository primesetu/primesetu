import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres:MSba108682!%40@127.0.0.1:5434/smriti_local"

async def check_schemas():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("Checking schemas in smriti_local...")
        try:
            result = await conn.execute(text("""
                SELECT schema_name 
                FROM information_schema.schemata 
                WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast');
            """))
            schemas = result.fetchall()
            for s in schemas:
                print(f"Schema: {s.schema_name}")
                
                # Check if remote_commands exists in this schema
                r = await conn.execute(text(f"SELECT 1 FROM information_schema.tables WHERE table_schema = '{s.schema_name}' AND table_name = 'remote_commands'"))
                if r.fetchone():
                    print(f"  - Table 'remote_commands' exists in {s.schema_name}")
                    # Check columns
                    c_result = await conn.execute(text(f"""
                        SELECT column_name FROM information_schema.columns 
                        WHERE table_schema = '{s.schema_name}' AND table_name = 'remote_commands'
                    """))
                    cols = [c[0] for c in c_result.fetchall()]
                    print(f"    Columns: {cols}")
        except Exception as e:
            print(f"Error: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_schemas())
