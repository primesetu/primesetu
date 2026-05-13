import asyncio
import pyodbc
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from mssql_connect import build_conn_str

async def robust_total_sync():
    print("--- SMRITI-OS: Robust Total Migration Engine (Intersection Sync) ---")
    
    # 1. Setup Engines
    local_engine = create_async_engine(settings.local_database_url)
    mssql_conn_str = build_conn_str()

    print(f"Connecting to MSSQL: {settings.mssql_server}...")
    try:
        m_conn = pyodbc.connect(mssql_conn_str)
        m_cur = m_conn.cursor()
    except Exception as e:
        print(f"MSSQL Connection Failed: {e}")
        return

    # 2. Get all MSSQL Tables
    m_cur.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'")
    m_tables = {t[0].lower(): t[0] for t in m_cur.fetchall()}

    # 3. Get all Postgres Tables in the legacy schema
    async with local_engine.connect() as p_conn:
        res = await p_conn.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema='{settings.LEGACY_SCHEMA}'"))
        p_tables = [r[0].lower() for r in res.fetchall()]

    common_tables = [t for t in p_tables if t in m_tables]
    print(f"Found {len(common_tables)} common tables out of {len(p_tables)} total tables.\n")

    for p_table_name in common_tables:
        m_table_name = m_tables[p_table_name]
        
        # A. Check count
        try:
            m_cur.execute(f"SELECT COUNT(*) FROM {m_table_name}")
            m_count = m_cur.fetchone()[0]
        except:
            continue

        if m_count == 0:
            continue

        # B. Get Column Intersections
        # MSSQL Columns
        m_cur.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='{m_table_name}'")
        m_cols = {c[0].lower(): c[0] for c in m_cur.fetchall()}
        
        # Postgres Columns
        async with local_engine.connect() as p_conn:
            res = await p_conn.execute(text(f"SELECT column_name FROM information_schema.columns WHERE table_schema='{settings.LEGACY_SCHEMA}' AND table_name='{p_table_name}'"))
            p_cols = [r[0].lower() for r in res.fetchall()]
        
        # Find common columns (use MSSQL casing for FETCH, Postgres names for INSERT)
        intersect = [c for c in p_cols if c in m_cols]
        if not intersect:
            print(f"  [SKIP] {m_table_name} - No common columns found.")
            continue

        print(f"Syncing {m_table_name} ({m_count} rows, {len(intersect)} columns)...")
        
        try:
            # Fetch using intersection columns
            m_query_cols = [m_cols[c] for c in intersect]
            m_cur.execute(f"SELECT {', '.join([f'[{c}]' for c in m_query_cols])} FROM {m_table_name}")
            rows = m_cur.fetchall()
            
            # Prepare data
            data = []
            for row in rows:
                data.append(dict(zip(intersect, list(row))))

            # Push to Postgres
            async with local_engine.begin() as p_conn:
                await p_conn.execute(text(f"TRUNCATE TABLE {settings.LEGACY_SCHEMA}.{p_table_name} CASCADE"))
                
                safe_cols = [f'"{c}"' for c in intersect]
                placeholders = [f":{c}" for c in intersect]
                stmt = text(f"INSERT INTO {settings.LEGACY_SCHEMA}.{p_table_name} ({', '.join(safe_cols)}) VALUES ({', '.join(placeholders)})")
                
                chunk_size = 2000
                for i in range(0, len(data), chunk_size):
                    await p_conn.execute(stmt, data[i:i+chunk_size])
            
            print(f"  [OK] {m_table_name} synced.")
        except Exception as e:
            print(f"  [ERROR] {m_table_name}: {e}")

    m_conn.close()
    await local_engine.dispose()
    print("\n--- ROBUST TOTAL MIGRATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(robust_total_sync())
