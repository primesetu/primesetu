import asyncio
import asyncpg
from app.core.config import settings
import json

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    records = await conn.fetch("SELECT item_code, item_name, mrp_paise, anal_codes, user_fields FROM items LIMIT 1")
    print("--- SUPABASE (items) TABLE DATA WITH ALL METADATA ---")
    for r in records:
        print(f"Code: {r['item_code']}")
        print(f"Name: {r['item_name']}")
        print(f"MRP: {r['mrp_paise']/100:.2f}")
        print("\n--- AnalCodes (JSONB) ---")
        anal_codes = json.loads(r['anal_codes'])
        for k, v in list(anal_codes.items())[:10]:
            print(f"  {k}: {v}")
        print(f"  ... (+ {max(0, len(anal_codes) - 10)} more AnalCodes)")
            
        print("\n--- UserFields (JSONB) ---")
        user_fields = json.loads(r['user_fields'])
        for k, v in list(user_fields.items())[:10]:
            print(f"  {k}: {v}")
        print(f"  ... (+ {max(0, len(user_fields) - 10)} more UserFields)")
        
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
