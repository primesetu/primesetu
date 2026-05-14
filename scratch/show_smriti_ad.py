import asyncio
import sys
import os

# Add backend directory to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from app.core.database import engine
from sqlalchemy import text

async def show_smriti_ad():
    print("--- [SMRITI-OS] SMRITI_AD DATA PREVIEW ---")
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT trntype, index, acptcap, dispcap, visible, column_name FROM smriti_ad WHERE visible = true LIMIT 25"))
        print(f"{'TRN':<5} | {'IDX':<3} | {'CAPTION (Accept)':<20} | {'DISPLAY':<20} | {'COLUMN'}")
        print("-" * 80)
        for row in result:
            print(f"{row[0]:<5} | {row[1]:<3} | {str(row[2]):<20} | {str(row[3]):<20} | {row[5]}")

if __name__ == "__main__":
    asyncio.run(show_smriti_ad())
