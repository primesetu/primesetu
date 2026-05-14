import os
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

async def list_menus():
    print("\n--- Sovereign Menu Inventory ---\n")
    engine = create_async_engine(DATABASE_URL)
    
    query = "SELECT id, label, category, module, route, shortcut, tenant_id FROM public.menu_items ORDER BY category, sort_order;"
    
    async with engine.connect() as conn:
        result = await conn.execute(text(query))
        rows = result.all()
        
        if not rows:
            print("No menus found in database.")
            return

        print(f"{'ID':<15} | {'LABEL':<20} | {'CATEGORY':<12} | {'MODULE':<12} | {'ROUTE':<20} | {'HOTKEY'}")
        print("-" * 100)
        
        for row in rows:
            print(f"{row.id:<15} | {row.label:<20} | {row.category:<12} | {row.module:<12} | {row.route:<20} | {row.shortcut}")
    
    await engine.dispose()
    print("\n--- End of Inventory ---\n")

if __name__ == "__main__":
    asyncio.run(list_menus())
