
import asyncio
from sqlalchemy import text
from app.core.database import engine

async def list_all_system_tables():
    async with engine.connect() as conn:
        # Get schemas
        query = text("""
            SELECT schema_name 
            FROM information_schema.schemata 
            WHERE schema_name NOT IN ('information_schema', 'pg_catalog')
        """)
        schemas = [r[0] for r in (await conn.execute(query)).fetchall()]
        
        all_results = {}
        for schema in schemas:
            print(f"Scanning schema: {schema}")
            query = text(f"""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = '{schema}'
                ORDER BY table_name
            """)
            tables = [r[0] for r in (await conn.execute(query)).fetchall()]
            
            table_details = []
            for table in tables:
                try:
                    cnt = (await conn.execute(text(f'SELECT COUNT(*) FROM "{schema}"."{table}"'))).scalar()
                    table_details.append({"name": table, "count": cnt})
                except:
                    table_details.append({"name": table, "count": "Error"})
            
            all_results[schema] = table_details

        # Print summary
        for schema, tables in all_results.items():
            print(f"\n--- Schema: {schema} ---")
            for t in tables:
                print(f"  {t['name']}: {t['count']} rows")

if __name__ == "__main__":
    asyncio.run(list_all_system_tables())
