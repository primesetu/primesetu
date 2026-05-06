import asyncio
from sqlalchemy import select
from app.core.database import engine, get_db
from app.models.legacy_s9 import Itemmaster

async def perform_demo_update():
    sku = "2025080007823"
    new_desc = "My First Edit"
    new_brand = "Elaichi Aura"
    
    print(f"[DEMO] Updating SKU: {sku}...")
    
    async with engine.begin() as conn:
        # Check if item exists
        stmt = select(Itemmaster).where(Itemmaster.stockno == sku)
        result = await conn.execute(stmt)
        item = result.fetchone()
        
        if item:
            from sqlalchemy import update
            stmt = (
                update(Itemmaster)
                .where(Itemmaster.stockno == sku)
                .values(itemdesc=new_desc, class2cd=new_brand)
            )
            await conn.execute(stmt)
            print(f"[DEMO] SUCCESS: Item '{sku}' updated to '{new_desc}' and brand '{new_brand}'.")
        else:
            print(f"[DEMO] ERROR: SKU '{sku}' not found in Database.")

if __name__ == "__main__":
    asyncio.run(perform_demo_update())
