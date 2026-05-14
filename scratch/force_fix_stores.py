import asyncio
import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

async def fix_pt():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg = await asyncpg.connect(db_url)
    
    correct_id = 'ae8f347e-baa6-4455-b6e7-22b3220ee464'
    
    print(f"Force updating ptinvoicehdr and ptinvoicedtl to {correct_id}")
    
    res1 = await pg.execute("UPDATE ptinvoicehdr SET store_id = $1", correct_id)
    res2 = await pg.execute("UPDATE ptinvoicedtl SET store_id = $1", correct_id)
    res3 = await pg.execute("UPDATE items SET store_id = $1", correct_id)
    res4 = await pg.execute("UPDATE item_stock SET store_id = $1", correct_id)
    res5 = await pg.execute("UPDATE itemmaster SET store_id = $1", correct_id)
    res6 = await pg.execute("UPDATE stockmaster SET store_id = $1", correct_id)
    
    print(f"ptinvoicehdr: {res1}")
    print(f"ptinvoicedtl: {res2}")
    print(f"items: {res3}")
    print(f"item_stock: {res4}")
    print(f"itemmaster: {res5}")
    print(f"stockmaster: {res6}")
    
    await pg.close()

if __name__ == "__main__":
    asyncio.run(fix_pt())
