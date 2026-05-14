import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("--- Personnel Data ---")
    rows = await conn.fetch("SELECT code, nm, activeflag, allowinbilling FROM shoper9.personnel LIMIT 20")
    for r in rows:
        print(f"Code: {r['code']}, Name: {r['nm']}, Active: {r['activeflag']}, Allow: {r['allowinbilling']}")
        
    print("\n--- AcceptDisplayDtls (UI Config) ---")
    # Checking for TrnType 2100 (Sales)
    rows = await conn.fetch("SELECT columnname, caption, isvisible, width FROM shoper9.acceptdisplaydtls WHERE trntype = 2100 ORDER BY displayorder")
    for r in rows:
        print(f"Col: {r['columnname']}, Caption: {r['caption']}, Visible: {r['isvisible']}, Width: {r['width']}")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
