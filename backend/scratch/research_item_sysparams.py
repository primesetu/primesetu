import asyncio
import os
import sys

sys.path.append(os.getcwd())

from app.core.config import settings
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def research_sysparams():
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.connect() as conn:
            res = await conn.execute(text("""
                SELECT param_code, param_val, category, description 
                FROM s9.sysparam 
                WHERE param_code ILIKE '%item%' 
                   OR param_code ILIKE '%stock%'
                   OR param_code ILIKE '%sku%'
                   OR category ILIKE '%item%'
                ORDER BY category, param_code
            """))
            rows = res.fetchall()
            print(f"Found {len(rows)} system parameters relating to Item/Stock:")
            for r in rows:
                print(f"Code: {r[0]} | Val: {r[1]} | Cat: {r[2]} | Desc: {r[3]}")
                
        await engine.dispose()
    except Exception as e:
        print(f"Error querying s9.sysparam: {e}")
        
    try:
        engine = create_async_engine(settings.local_database_url)
        async with engine.connect() as conn:
            res = await conn.execute(text("""
                SELECT param_code, param_value, category, description 
                FROM smriti_sys_params
                WHERE param_code ILIKE '%item%' 
                   OR param_code ILIKE '%stock%'
                   OR param_code ILIKE '%sku%'
                   OR category ILIKE '%item%'
                ORDER BY category, param_code
            """))
            rows = res.fetchall()
            print(f"\nFound {len(rows)} system parameters in smriti_sys_params relating to Item/Stock:")
            for r in rows:
                print(f"Code: {r[0]} | Val: {r[1]} | Cat: {r[2]} | Desc: {r[3]}")
                
        await engine.dispose()
    except Exception as e:
        print(f"Error querying smriti_sys_params: {e}")

if __name__ == "__main__":
    asyncio.run(research_sysparams())
