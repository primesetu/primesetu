import asyncio
import pyodbc
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings
from mssql_connect import build_conn_str

async def sync_all_masters():
    print("--- SMRITI-OS: Full Master Sync (MSSQL -> Local Postgres) ---")
    
    # 1. Define tables to sync
    # Map: { MSSQL_TABLE_NAME: POSTGRES_TABLE_NAME }
    tables = {
        "ItemMaster": "itemmaster",
        "StockMaster": "stockmaster",
        "GenLookUp": "genlookup",
        "Customers": "customers",
        "Class12Combo": "class12combo",
        "BarcodeMaster": "barcodemaster",
        "SubClass1Cat": "subclass1cat",
        "SubClass2Cat": "subclass2cat",
        "SizeCat": "sizecat"
    }

    # 2. Setup Postgres
    local_engine = create_async_engine(settings.local_database_url)
    mssql_conn_str = build_conn_str()

    print(f"Connecting to MSSQL: {settings.mssql_server}...")
    try:
        m_conn = pyodbc.connect(mssql_conn_str)
        m_cur = m_conn.cursor()
    except Exception as e:
        print(f"MSSQL Connection Failed: {e}")
        return

    for m_table, p_table in tables.items():
        print(f"\nProcessing {m_table} -> {p_table}...")
        
        # Check if MSSQL table exists
        try:
            m_cur.execute(f"SELECT COUNT(*) FROM {m_table}")
            count = m_cur.fetchone()[0]
            print(f"  Found {count} records in MSSQL.")
        except:
            print(f"  Table {m_table} not found in MSSQL. Skipping.")
            continue

        if count == 0:
            print(f"  {m_table} is empty. Skipping.")
            continue

        # Fetch all data
        m_cur.execute(f"SELECT * FROM {m_table}")
        columns = [column[0] for column in m_cur.description]
        rows = m_cur.fetchall()
        data = [dict(zip(columns, list(row))) for row in rows]

        # Sync to Postgres
        async with local_engine.begin() as p_conn:
            await p_conn.execute(text(f"CREATE SCHEMA IF NOT EXISTS {settings.LEGACY_SCHEMA}"))
            
            # Since we don't have all models for all tables, we might need to create them dynamically 
            # or just rely on existing ones. For this dev script, we'll try to insert raw.
            # We'll use a simpler approach: TRUNCATE and INSERT raw dicts.
            
            # We need to make sure the table exists in Postgres.
            # If it's a known model, it was created by migrate_cloud_to_local.py.
            
            try:
                await p_conn.execute(text(f"TRUNCATE TABLE {settings.LEGACY_SCHEMA}.{p_table} CASCADE"))
                # Note: This requires the table structure to match exactly.
                # If the table doesn't exist, we might need to create it.
                # But for development, we assume models cover the important ones.
                
                # Dynamic insert (simple version)
                if data:
                    # Clean data for Postgres (convert None/types if needed)
                    # SQLAlchemy insert works well with dicts
                    await p_conn.execute(text(f"INSERT INTO {settings.LEGACY_SCHEMA}.{p_table} ({', '.join(columns)}) VALUES ({', '.join([':'+c for c in columns])})"), data)
                    print(f"  Successfully synced {len(data)} rows.")
            except Exception as e:
                print(f"  Error syncing {p_table}: {e}")

    m_conn.close()
    await local_engine.dispose()
    print("\n--- Full Master Sync Complete ---")

if __name__ == "__main__":
    asyncio.run(sync_all_masters())
