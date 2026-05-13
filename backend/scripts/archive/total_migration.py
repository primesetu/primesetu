import asyncio
import pyodbc
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from mssql_connect import build_conn_str

async def total_sync():
    print("--- SMRITI-OS: Total Migration Engine (MSSQL -> Local Postgres) ---")
    
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
    print(f"Found {len(m_tables)} tables in MSSQL.")

    # 3. Get all Postgres Tables in shoper9 schema
    async with local_engine.connect() as p_conn:
        res = await p_conn.execute(text(f"SELECT table_name FROM information_schema.tables WHERE table_schema='{settings.LEGACY_SCHEMA}'"))
        p_tables = [r[0].lower() for r in res.fetchall()]
    print(f"Found {len(p_tables)} tables in Local Postgres ({settings.LEGACY_SCHEMA} schema).")

    # 4. Sync common tables
    common_tables = [t for t in p_tables if t in m_tables]
    print(f"Starting sync for {len(common_tables)} common tables...\n")

    for p_table_name in common_tables:
        m_table_name = m_tables[p_table_name]
        
        # Check count
        try:
            m_cur.execute(f"SELECT COUNT(*) FROM {m_table_name}")
            m_count = m_cur.fetchone()[0]
        except:
            continue

        if m_count == 0:
            # print(f"  Skipping {m_table_name} (Empty)")
            continue

        print(f"Syncing {m_table_name} ({m_count} rows)...")
        
        try:
            # Fetch data
            m_cur.execute(f"SELECT * FROM {m_table_name}")
            cols = [col[0] for col in m_cur.description]
            rows = m_cur.fetchall()
            
            # Prepare data
            data = []
            for row in rows:
                data.append(dict(zip(cols, list(row))))

            # Push to Postgres
            async with local_engine.begin() as p_conn:
                await p_conn.execute(text(f"TRUNCATE TABLE {settings.LEGACY_SCHEMA}.{p_table_name} CASCADE"))
                # Use multi-insert for speed
                # We need to escape column names that might be reserved words
                safe_cols = [f'"{c}"' for c in cols]
                placeholders = [f":{c}" for c in cols]
                stmt = text(f"INSERT INTO {settings.LEGACY_SCHEMA}.{p_table_name} ({', '.join(safe_cols)}) VALUES ({', '.join(placeholders)})")
                
                # Chunked insert for very large tables
                chunk_size = 5000
                for i in range(0, len(data), chunk_size):
                    await p_conn.execute(stmt, data[i:i+chunk_size])
            
            print(f"  [OK] {m_table_name} synced.")
        except Exception as e:
            print(f"  [ERROR] {m_table_name}: {e}")

    m_conn.close()
    await local_engine.dispose()
    print("\n--- TOTAL MIGRATION COMPLETE ---")

if __name__ == "__main__":
    asyncio.run(total_sync())
