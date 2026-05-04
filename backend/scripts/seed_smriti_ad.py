import csv
import os
import sys
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import delete
from app.database import AsyncSessionLocal, engine
from app.models.sovereign import SmritiAD, Base

CSV_FILE = r"D:\IMP\GitHub\primesetu\.shoper9trace\AcceptDisplayDtls_Extract.csv"

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_smriti_ad():
    if not os.path.exists(CSV_FILE):
        print(f"Error: CSV file {CSV_FILE} not found.")
        return

    # Initialize tables
    await init_db()

    async with AsyncSessionLocal() as db:
        try:
            print(f"Reading from {CSV_FILE}...")
            with open(CSV_FILE, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                count = 0
                
                # Clear existing data
                await db.execute(delete(SmritiAD))
                
                for row in reader:
                    try:
                        trn_type = int(row.get('TrnType', 0).strip() or 0)
                        index = int(row.get('Index', 0).strip() or 0)
                        disp_visible = row.get('DispVisible', '0').strip() == '1'
                        
                        smriti_ad = SmritiAD(
                            trntype=trn_type,
                            index=index,
                            acptcap=row.get('AcptCap', '').strip(),
                            dispcap=row.get('DispCap', '').strip(),
                            visible=disp_visible,
                            position=int(row.get('DispPos', 0).strip() or 0),
                            data_type=int(row.get('DispDataType', 0).strip() or 0),
                            width=float(row.get('DispWidth', 0).strip() or 0.0),
                            # Derive a column name for ag-grid field mapping
                            column_name=row.get('DispCap', '').strip().lower().replace(" ", "_").replace(".", "")
                        )
                        db.add(smriti_ad)
                        count += 1
                    except Exception as e:
                        print(f"Error processing row {row}: {e}")
                
                await db.commit()
                print(f"Successfully seeded {count} rows into SmritiAD.")
        except Exception as e:
            print(f"Exception during seeding: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_smriti_ad())
