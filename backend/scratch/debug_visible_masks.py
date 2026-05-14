import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def run():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("\n--- Visible AcceptDisplayDtls (2100) ---")
    rows = await conn.fetch("SELECT columnname, acptcap, dispcap, dispvisible, acptvisible, disppos FROM shoper9.acceptdisplaydtls WHERE trntype = 2100 AND dispvisible = true ORDER BY disppos")
    for r in rows:
        print(f"Pos: {r['disppos']}, Col: {r['columnname']}, Caption: {r['dispcap']}, Accept: {r['acptvisible']}")

    await conn.close()

if __name__ == '__main__':
    asyncio.run(run())
