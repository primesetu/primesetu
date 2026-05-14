import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def query_params():
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.connect() as conn:
            print("--- SMRITI_PARAM (Sovereign Table) ---")
            res = await conn.execute(text("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'smriti_param'
            """))
            cols = [r[0] for r in res.fetchall()]
            print(f"Columns in smriti_param: {cols}")
            
            val_col = 'value' if 'value' in cols else ('param_val' if 'param_val' in cols else cols[1])
            
            res = await conn.execute(text(f"""
                SELECT param_code, value_txt, category, descr 
                FROM smriti_param
                WHERE param_code ILIKE '%item%' 
                   OR param_code ILIKE '%stock%'
                   OR param_code ILIKE '%sku%'
                   OR param_code ILIKE '%class%'
                   OR category ILIKE '%item%'
                ORDER BY category, param_code
            """))
            rows = res.fetchall()
            print(f"\nFound {len(rows)} records in smriti_param:")
            for r in rows:
                print(f"{r[0]} | {r[1]} | {r[2]} | {r[3][:100] if r[3] else 'No desc'}")
                
            print("\n--- S9.SYSPARAM (Legacy Table) ---")
            res = await conn.execute(text("""
                SELECT paramcode, paramval, category, description 
                FROM s9.sysparam 
                WHERE paramcode ILIKE '%item%' 
                   OR paramcode ILIKE '%stock%'
                   OR paramcode ILIKE '%sku%'
                   OR paramcode ILIKE '%class%'
                   OR category ILIKE '%item%'
                ORDER BY category, paramcode
            """))
            rows2 = res.fetchall()
            print(f"\nFound {len(rows2)} records in s9.sysparam:")
            for r in rows2:
                print(f"{r[0]} | {r[1]} | {r[2]} | {r[3][:100] if r[3] else 'No desc'}")
                
        await engine.dispose()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(query_params())
