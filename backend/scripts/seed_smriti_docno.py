import csv
import os
import sys
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import delete
from app.database import AsyncSessionLocal, engine
from app.models.sovereign import SmritiDocNo, Base

CSV_FILE = r"D:\IMP\GitHub\primesetu\.shoper9trace\PrefixTrnNo_Extract.csv"

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_smriti_docno():
    if not os.path.exists(CSV_FILE):
        print(f"Error: CSV file {CSV_FILE} not found.")
        return

    await init_db()

    async with AsyncSessionLocal() as db:
        try:
            print(f"Reading from {CSV_FILE}...")
            with open(CSV_FILE, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                count = 0
                
                # Clear existing data
                await db.execute(delete(SmritiDocNo))
                
                for row in reader:
                    try:
                        trn_type_str = row.get('TrnType', '').strip()
                        if not trn_type_str:
                            continue
                            
                        trn_type = int(trn_type_str)
                        prefix = row.get('ActualPrefix', '').strip()
                        next_no = int(row.get('DocNumber', 1))
                        
                        smriti_docno = SmritiDocNo(
                            trn_type=trn_type,
                            prefix=prefix,
                            next_no=next_no
                        )
                        # Use merge to handle duplicates if they exist
                        await db.merge(smriti_docno)
                        count += 1
                    except Exception as e:
                        print(f"Error processing row {row}: {e}")
                
                await db.commit()
                print(f"Successfully seeded {count} rows into SmritiDocNo.")
        except Exception as e:
            print(f"Exception during seeding: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_smriti_docno())
