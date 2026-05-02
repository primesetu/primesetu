import pyodbc
import asyncio
import asyncpg
import os
from app.core.config import settings

# ============================================================
# SMRITI-OS - Stock Ledger Migration Engine
# Syncs: Stktrndtls and Stktrnhdr for active SKUs
# ============================================================

async def migrate_ledger(database="shoper9x01"):
    print(f"Starting Stock Ledger sync from MSSQL [{database}]...")
    
    # 1. Get Active SKUs from PG
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    pg_conn = await asyncpg.connect(url)
    active_skus = await pg_conn.fetch("SELECT stockno FROM shoper9.itemmaster")
    sku_list = [r['stockno'] for r in active_skus]
    
    if not sku_list:
        print("No active SKUs found in Smriti-OS.")
        await pg_conn.close()
        return

    # 2. Fetch Details from MSSQL
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        mssql_conn = pyodbc.connect(conn_str)
        cursor = mssql_conn.cursor()
        
        skus_str = ",".join([f"'{s}'" for s in sku_list])
        
        print("Fetching Stktrndtls...")
        cursor.execute(f"SELECT * FROM StkTrnDtls WHERE StockNo IN ({skus_str})")
        dtls_cols = [column[0].lower() for column in cursor.description]
        dtls_rows = [dict(zip(dtls_cols, row)) for row in cursor.fetchall()]
        
        if not dtls_rows:
            print("No ledger details found.")
            mssql_conn.close()
            await pg_conn.close()
            return

        # Identify unique headers needed
        header_keys = set()
        for r in dtls_rows:
            header_keys.add((r['trntype'], r['trnctrlno'], r['docnoprefix'], r['docno']))
            
        print(f"Fetching {len(header_keys)} Headers (Stktrnhdr)...")
        # To avoid massive IN clauses, we can pull headers linked to these details
        # Or better, pull all headers that are present in the details table join
        # For simplicity since it's only 7k records, we'll pull headers where TrnCtrlNo in list
        ctrl_nos = list(set([k[1] for k in header_keys]))
        ctrl_str = ",".join([str(c) for c in ctrl_nos])
        
        cursor.execute(f"SELECT * FROM StkTrnHdr WHERE TrnCtrlNo IN ({ctrl_str})")
        hdr_cols = [column[0].lower() for column in cursor.description]
        hdr_rows = [dict(zip(hdr_cols, row)) for row in cursor.fetchall()]
        
        mssql_conn.close()
    except Exception as e:
        print(f"MSSQL Error: {e}")
        await pg_conn.close()
        return

    # 3. Sync to PostgreSQL
    try:
        await pg_conn.execute("SET search_path TO shoper9, public")

        # Sync Headers
        if hdr_rows:
            print(f"Syncing {len(hdr_rows)} Headers...")
            pg_hdr_cols_res = await pg_conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'stktrnhdr' AND table_schema = 'shoper9'")
            pg_hdr_cols = [r['column_name'] for r in pg_hdr_cols_res]
            target_hdr_cols = [c for c in hdr_cols if c in pg_hdr_cols]
            
            insert_hdr = [tuple(r.get(c) for c in target_hdr_cols) for r in hdr_rows]
            
            async with pg_conn.transaction():
                # We only truncate what we are about to replace to avoid wiping everything if partial sync
                # But for a clean tally, a full wipe of ledger related to these SKUs is better
                # For now, full wipe of these specific tables is safer for consistency
                await pg_conn.execute("TRUNCATE TABLE stktrnhdr CASCADE")
                await pg_conn.copy_records_to_table('stktrnhdr', records=insert_hdr, columns=target_hdr_cols)

        # Sync Details
        if dtls_rows:
            print(f"Syncing {len(dtls_rows)} Details...")
            pg_dtls_cols_res = await pg_conn.fetch("SELECT column_name FROM information_schema.columns WHERE table_name = 'stktrndtls' AND table_schema = 'shoper9'")
            pg_dtls_cols = [r['column_name'] for r in pg_dtls_cols_res]
            target_dtls_cols = [c for c in dtls_cols if c in pg_dtls_cols]
            
            insert_dtls = [tuple(r.get(c) for c in target_dtls_cols) for r in dtls_rows]
            
            async with pg_conn.transaction():
                await pg_conn.execute("TRUNCATE TABLE stktrndtls")
                await pg_conn.copy_records_to_table('stktrndtls', records=insert_dtls, columns=target_dtls_cols)

        await pg_conn.close()
        print("Stock Ledger Sync Complete. Audit trail synchronized.")
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(migrate_ledger("shoper9x01"))
