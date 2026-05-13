import csv
import os
import sys
import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

CSV_FILE = r"D:\IMP\GitHub\primesetu\.shoper9trace\AcceptDisplayDtls_Extract.csv"

async def restore_masks():
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

            # Clear existing data in shoper9.acceptdisplaydtls
            async with conn.begin():
                await conn.execute(text("TRUNCATE TABLE shoper9.acceptdisplaydtls"))
            
            # Prepare insert statement
            insert_stmt = text("""
                INSERT INTO shoper9.acceptdisplaydtls (
                    trntype, index, acptcap, dispcap, acptvisible, dispvisible, 
                    acptpos, disppos, acptdatatype, dispdatatype, acptwidth, dispwidth, 
                    acptalign, dispalign, columnname
                ) VALUES (
                    :trntype, :index, :acptcap, :dispcap, :acptvisible, :dispvisible, 
                    :acptpos, :disppos, :acptdatatype, :dispdatatype, :acptwidth, :dispwidth, 
                    :acptalign, :dispalign, :columnname
                )
            """)

            batch_data = []
            for row in rows:
                try:
                    # Clean and convert data
                    data = {
                        "trntype": int(row.get('TrnType', 0) or 0),
                        "index": int(row.get('Index', 0) or 0),
                        "acptcap": row.get('AcptCap', '').strip(),
                        "dispcap": row.get('DispCap', '').strip(),
                        "acptvisible": row.get('AcptVisible', '0').strip() == '1',
                        "dispvisible": row.get('DispVisible', '0').strip() == '1',
                        "acptpos": int(row.get('AcptPos', 0) or 0),
                        "disppos": int(row.get('DispPos', 0) or 0),
                        "acptdatatype": int(row.get('AcptDataType', 0) or 0),
                        "dispdatatype": int(row.get('DispDataType', 0) or 0),
                        "acptwidth": float(row.get('AcptWidth', 0) or 0.0),
                        "dispwidth": float(row.get('DispWidth', 0) or 0.0),
                        "acptalign": int(row.get('AcptAlign', 0) or 0),
                        "dispalign": int(row.get('DispAlign', 0) or 0),
                        "columnname": row.get('DispCap', '').strip().lower().replace(" ", "_").replace(".", "")
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

            print(f"Successfully restored {count} rows to shoper9.acceptdisplaydtls.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(restore_masks())
