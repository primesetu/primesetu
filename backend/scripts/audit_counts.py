import pyodbc
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

def get_mssql_counts():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    # Get all base tables
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'")
    tables = [row.TABLE_NAME for row in cursor.fetchall()]
    
    counts = {}
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM [{t}]")
            counts[t.lower()] = cursor.fetchone()[0]
        except:
            continue
            
    conn.close()
    return counts

async def get_pg_counts():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    # Get all tables in public schema
    rows = await conn.fetch("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
    tables = [r['tablename'] for r in rows]
    
    counts = {}
    for t in tables:
        try:
            count = await conn.fetchval(f'SELECT COUNT(*) FROM public."{t}"')
            counts[t.lower()] = count
        except:
            continue
            
    await conn.close()
    return counts

async def audit():
    print("Fetching Source Counts (MSSQL)...")
    mssql_counts = get_mssql_counts()
    
    print("Fetching Target Counts (SMRITI-OS)...")
    pg_counts = await get_pg_counts()
    
    # Header
    print("\n" + "="*80)
    print(f"{'TABLE NAME':<40} | {'SOURCE (MSSQL)':<15} | {'TARGET (PG)':<15}")
    print("-" * 80)
    
    # Compare all tables found in either
    all_tables = sorted(set(mssql_counts.keys()) | set(pg_counts.keys()))
    
    for t in all_tables:
        s_count = mssql_counts.get(t, "N/A")
        t_count = pg_counts.get(t, "N/A")
        
        # Only show if there's data in either or if they match
        if s_count == 0 and t_count == 0: continue
        
        print(f"{t:<40} | {str(s_count):<15} | {str(t_count):<15}")
    
    print("="*80)

if __name__ == '__main__':
    asyncio.run(audit())
