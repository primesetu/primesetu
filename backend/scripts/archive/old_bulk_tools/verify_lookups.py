import asyncio
import asyncpg
from app.core.config import settings

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    
    # Check for ASST in CLASS category
    records = await conn.fetch("""
        SELECT category, code, label 
        FROM general_lookup 
        WHERE code = 'ASST' AND category = 'CLASS'
        LIMIT 5
    """)
    print("--- SUPABASE (general_lookup) VERIFICATION ---")
    for r in records:
        print(f"Category: {r['category']} | Code: {r['code']} | Label: {r['label']}")
        
    # Check for HSN Code
    records = await conn.fetch("""
        SELECT category, code, label 
        FROM general_lookup 
        WHERE category = 'HSN Code'
        LIMIT 5
    """)
    print("\n--- HSN CODES ---")
    for r in records:
        print(f"Category: {r['category']} | Code: {r['code']} | Label: {r['label']}")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
