import csv
import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

CSV_FILE = r"D:\IMP\GitHub\primesetu\.shoper9trace\sysparam_structured.csv"

async def restore_sysparams():
    if not os.path.exists(CSV_FILE):
        print(f"Error: CSV file {CSV_FILE} not found.")
        return

    # Connect to local database
    url = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"
    engine = create_async_engine(url)

    async with engine.connect() as conn:
        print(f"Reading from {CSV_FILE}...")
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as f:
            reader = csv.DictReader(f)
            rows = list(reader)
            print(f"Found {len(rows)} rows in CSV.")

            # Clear existing data in shoper9.sysparam
            async with conn.begin():
                await conn.execute(text("TRUNCATE TABLE shoper9.sysparam"))
            
            # Prepare insert statement
            insert_stmt = text("""
                INSERT INTO shoper9.sysparam (
                    id, descr, paramcode, boolean, intg, txt, opt, category
                ) VALUES (
                    :id, :descr, :paramcode, :boolean, :intg, :txt, :opt, :category
                )
            """)

            batch_data = []
            for row in rows:
                try:
                    data = {
                        "id": row.get('Id', '').strip(),
                        "descr": row.get('Descr', '').strip(),
                        "paramcode": row.get('ParamCode', '').strip(),
                        "boolean": row.get('Boolean', '0').strip() == '1',
                        "intg": int(row.get('Intg', 0) or 0),
                        "txt": row.get('Txt', '').strip(),
                        "opt": row.get('Opt', '').strip(),
                        "category": row.get('Category', '').strip()
                    }
                    batch_data.append(data)
                except Exception as e:
                    print(f"Error preparing row: {e}")

            # Batch insert in chunks of 100
            count = 0
            for i in range(0, len(batch_data), 100):
                chunk = batch_data[i:i+100]
                try:
                    async with conn.begin():
                        await conn.execute(insert_stmt, chunk)
                    count += len(chunk)
                except Exception as e:
                    print(f"Error inserting chunk starting at {i}: {e}")

            print(f"Successfully restored {count} rows to shoper9.sysparam.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(restore_sysparams())
