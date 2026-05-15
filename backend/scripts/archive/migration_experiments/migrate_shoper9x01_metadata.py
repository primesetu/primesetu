import pyodbc
import asyncio
import asyncpg
import os
from app.core.config import settings

# ============================================================
# SMRITI-OS - Shoper 9 Metadata Migration Engine
# Syncs: Genlookup and Vendors from MSSQL [shoper9x01]
# ============================================================

async def migrate_metadata(database="shoper9x01"):
    print(f"Starting metadata sync from MSSQL [{database}]...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    
    try:
        mssql_conn = pyodbc.connect(conn_str)
        cursor = mssql_conn.cursor()
        
        # 1. Fetch Genlookup
        print("Fetching Genlookup...")
        cursor.execute("SELECT * FROM GenLookUp")
        gen_cols = [column[0].lower() for column in cursor.description]
        gen_rows = [dict(zip(gen_cols, row)) for row in cursor.fetchall()]
        
        # 2. Fetch Vendors
        print("Fetching Vendors...")
        cursor.execute("SELECT * FROM Vendors")
        ven_cols = [column[0].lower() for column in cursor.description]
        ven_rows = [dict(zip(ven_cols, row)) for row in cursor.fetchall()]
        
        mssql_conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return

    # Connect to PostgreSQL
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    try:
        pg_conn = await asyncpg.connect(url)
        await pg_conn.execute("SET search_path TO shoper9, public")

        # Sync Genlookup
        if gen_rows:
            print(f"Syncing {len(gen_rows)} Genlookup records...")
            insert_gen = []
            target_gen_cols = ['recid', 'code', 'descr', 'flag', 'number', 'vauid', 'vactr', 'vatermid', 'vacompcode']
            for r in gen_rows:
                insert_gen.append((
                    r.get('recid'), r.get('code'), r.get('descr'), r.get('flag'),
                    r.get('number'), r.get('vauid'), r.get('vactr'), r.get('vatermid'), r.get('vacompcode')
                ))
            
            async with pg_conn.transaction():
                await pg_conn.execute("TRUNCATE TABLE genlookup")
                await pg_conn.copy_records_to_table('genlookup', records=insert_gen, columns=target_gen_cols)

        # Sync Vendors
        if ven_rows:
            print(f"Syncing {len(ven_rows)} Vendor records...")
            # We'll just map the most important ones for now or all if model matches
            # Let's check model for Vendors briefly
            insert_ven = []
            # Assuming typical vendor columns from Shoper9
            # Since we don't have the full model view right now, we'll use a dynamic approach or common ones
            # Actually, let's use the columns found in MSSQL that exist in PG
            pg_ven_cols_res = await pg_conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'vendors' AND table_schema = 'shoper9'")
            pg_ven_cols = [r['column_name'] for r in pg_ven_cols_res]
            
            target_ven_cols = [c for c in ven_cols if c in pg_ven_cols]
            for r in ven_rows:
                insert_ven.append(tuple(r.get(c) for c in target_ven_cols))
            
            async with pg_conn.transaction():
                await pg_conn.execute("TRUNCATE TABLE vendors")
                await pg_conn.copy_records_to_table('vendors', records=insert_ven, columns=target_ven_cols)

        await pg_conn.close()
        print("Metadata Sync Complete.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_metadata("shoper9x01"))
