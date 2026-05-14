import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("\n--- AcceptDisplayDtls (Sales 2100) ---")
    rows = await conn.fetch("SELECT columnname, dispcap, dispvisible, dispwidth FROM shoper9.acceptdisplaydtls WHERE trntype = 2100 ORDER BY disppos")
    for r in rows:
        print(f"Col: {r['columnname']}, Caption: {r['dispcap']}, Visible: {r['dispvisible']}, Width: {r['dispwidth']}")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
