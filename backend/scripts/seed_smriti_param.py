import csv
import os
import sys
import asyncio

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from sqlalchemy import delete
from app.database import AsyncSessionLocal, engine
from app.models.sovereign import SmritiParam, Base

CSV_FILE = r"D:\IMP\GitHub\primesetu\.shoper9trace\sysparam_structured.csv"

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def seed_smriti_param():
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
                await db.execute(delete(SmritiParam))
                
                for row in reader:
                    try:
                        param_code = row.get('ParamCode', '').strip()
                        if not param_code:
                            continue

                        descr = row.get('Descr', '').strip()
                        value_txt = row.get('Txt', '').strip()
                        value_bool = row.get('Boolean', '0').strip() == '1'
                        
                        try:
                            value_int = int(row.get('Intg', 0).strip() or 0)
                        except ValueError:
                            value_int = 0

                        category = row.get('Category', '').strip()
                        
                        smriti_param = SmritiParam(
                            param_code=param_code,
                            descr=descr,
                            value_txt=value_txt,
                            value_bool=value_bool,
                            value_int=value_int,
                            category=category
                        )
                        # Use merge instead of add to handle duplicate keys if any
                        await db.merge(smriti_param)
                        count += 1
                    except Exception as e:
                        print(f"Error processing row {row}: {e}")
                
                await db.commit()
                print(f"Successfully seeded {count} rows into SmritiParam.")
        except Exception as e:
            print(f"Exception during seeding: {e}")
            await db.rollback()

if __name__ == "__main__":
    asyncio.run(seed_smriti_param())
