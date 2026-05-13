import pyodbc
import asyncio
import os
from datetime import datetime
from decimal import Decimal
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv("backend/.env")

# MSSQL Connection
MSSQL_CONN_STR = f'DRIVER={{SQL Server}};SERVER=AITDL;DATABASE=Shoper9X01;UID={os.getenv("MSSQL_USER")};PWD={os.getenv("MSSQL_PASSWORD")};'

# Postgres Connection
PG_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
engine = create_async_engine(PG_URL)

async def migrate_sales():
    mssql_conn = pyodbc.connect(MSSQL_CONN_STR)
    cursor = mssql_conn.cursor()

    print("Fetching Sales Headers (TrnType=2100) from Shoper9...")
    # Fetch headers
    cursor.execute("""
        SELECT TrnCtrlNo, DocNoPrefix, DocNo, DocDt, PartyId, TotDocValue, TotalLineItems, VACompCode 
        FROM StkTrnHdr 
        WHERE TrnType = 2100
    """)
    mssql_headers = cursor.fetchall()
    print(f"Found {len(mssql_headers)} sales headers.")

    async with engine.connect() as pg_conn:
        # 1. Migrate Headers
        header_stmt = text("""
            INSERT INTO smriti_sale_hdr (
                bill_no, bill_date, cust_code, total_qty, net_amount, staff_code, tally_synced, tally_retry_count, last_sync
            ) VALUES (
                :bill_no, :bill_date, :cust_code, :total_qty, :net_amount, :staff_code, :tally_synced, :tally_retry_count, :last_sync
            ) ON CONFLICT (bill_no, bill_date) DO UPDATE SET
                net_amount = EXCLUDED.net_amount,
                last_sync = EXCLUDED.last_sync
        """)

        header_batch = []
        for row in mssql_headers:
            bill_no = f"{row.DocNoPrefix}{row.DocNo}"
            header_batch.append({
                "bill_no": bill_no,
                "bill_date": row.DocDt,
                "cust_code": str(row.PartyId).strip() if row.PartyId else "CASH",
                "total_qty": Decimal(str(row.TotalLineItems or 0)),
                "net_amount": Decimal(str(row.TotDocValue or 0)),
                "staff_code": "SYSTEM",
                "tally_synced": False,
                "tally_retry_count": 0,
                "last_sync": datetime.utcnow()
            })

        print("Inserting Sales Headers...")
        for i in range(0, len(header_batch), 500):
            batch = header_batch[i:i+500]
            try:
                async with pg_conn.begin():
                    await pg_conn.execute(header_stmt, batch)
            except Exception as e:
                print(f"Header batch at {i} failed: {e}")
        print(f"Migrated {len(header_batch)} headers.")

        # 2. Migrate Details
        print("Fetching Sales Details from Shoper9...")
        cursor.execute("""
            SELECT h.DocNoPrefix, h.DocNo, h.DocDt, d.EntSrlNo, d.StockNo, d.DocQty, d.DocEntRate, d.DocEntDisc, d.DocEntTax
            FROM StkTrnDtls d
            JOIN StkTrnHdr h ON d.TrnCtrlNo = h.TrnCtrlNo AND d.TrnType = h.TrnType
            WHERE d.TrnType = 2100
        """)
        mssql_joined_details = cursor.fetchall()

        detail_stmt = text("""
            INSERT INTO smriti_sale_dtl (
                bill_no, srl_no, sku, qty, rate, disc_amount, tax_amount, last_sync
            ) VALUES (
                :bill_no, :srl_no, :sku, :qty, :rate, :disc_amount, :tax_amount, :last_sync
            ) ON CONFLICT (bill_no, srl_no) DO UPDATE SET
                qty = EXCLUDED.qty,
                rate = EXCLUDED.rate,
                last_sync = EXCLUDED.last_sync
        """)

        detail_batch = []
        for row in mssql_joined_details:
            bill_no = f"{row.DocNoPrefix}{row.DocNo}"
            detail_batch.append({
                "bill_no": bill_no,
                "srl_no": row.EntSrlNo,
                "sku": str(row.StockNo).strip(),
                "qty": Decimal(str(row.DocQty or 0)),
                "rate": Decimal(str(row.DocEntRate or 0)),
                "disc_amount": Decimal(str(row.DocEntDisc or 0)),
                "tax_amount": Decimal(str(row.DocEntTax or 0)),
                "last_sync": datetime.utcnow()
            })

        print("Inserting Sales Details...")
        for i in range(0, len(detail_batch), 1000):
            batch = detail_batch[i:i+1000]
            try:
                async with pg_conn.begin():
                    await pg_conn.execute(detail_stmt, batch)
                if i % 5000 == 0:
                    print(f"Migrated {i}/{len(detail_batch)} detail records...")
            except Exception as e:
                print(f"Batch at {i} failed: {e}")

    print("Wave 2: Sales Migration Complete.")
    mssql_conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_sales())
