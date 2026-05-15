import pyodbc
import asyncio
import asyncpg
import os
from app.core.config import settings

# ============================================================
# SMRITI-OS - Staff & Promotion Migration Engine
# Syncs: Personnel and Promotion Logic from MSSQL [shoper9x01]
# ============================================================

async def migrate_staff_promo(database="shoper9x01"):
    print(f"Starting Staff & Promotion sync from MSSQL [{database}]...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    
    tables_to_sync = [
        'Personnel',
        'PromoMnHeader',
        'PromoMnItemLvlDiscDtls',
        'PromoMnBillLvlDiscDtls'
    ]
    
    try:
        mssql_conn = pyodbc.connect(conn_str)
        cursor = mssql_conn.cursor()
        
        extracted_data = {}
        for table in tables_to_sync:
            print(f"Fetching {table} from MSSQL...")
            cursor.execute(f"SELECT * FROM {table}")
            cols = [column[0].lower() for column in cursor.description]
            rows = [dict(zip(cols, row)) for row in cursor.fetchall()]
            extracted_data[table.lower()] = (cols, rows)
        
        mssql_conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return

    # Connect to PostgreSQL
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    try:
        pg_conn = await asyncpg.connect(url)
        await pg_conn.execute("SET search_path TO shoper9, public")

        for table, (cols, rows) in extracted_data.items():
            if not rows:
                print(f"No data for {table}, skipping.")
                continue
                
            print(f"Syncing {len(rows)} records for {table}...")
            
            # Dynamic Column Mapping
            pg_cols_res = await pg_conn.fetch(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{table}' AND table_schema = 'shoper9'")
            pg_cols = [r['column_name'] for r in pg_cols_res]
            
            target_cols = [c for c in cols if c in pg_cols]
            insert_records = [tuple(r.get(c) for c in target_cols) for r in rows]
            
            async with pg_conn.transaction():
                await pg_conn.execute(f"TRUNCATE TABLE {table} CASCADE")
                await pg_conn.copy_records_to_table(table, records=insert_records, columns=target_cols)

        await pg_conn.close()
        print("Staff & Promotion Sync Complete.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_staff_promo("shoper9x01"))
