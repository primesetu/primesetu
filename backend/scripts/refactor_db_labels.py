# ============================================================
# SMRITI-OS - Database Label Refactoring Script
# Replaces "Shoper" and "Shoper9" with "SMRITI" in metadata,
# parameter descriptions, and lookup descriptions.
# ============================================================
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
import sys
import os

# Add parent directory to path so we can import app settings
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.core.config import settings

async def refactor_database_labels():
    print("Starting Database Label Refactoring (Shoper -> SMRITI)...")
    
    # Try local database URL first, fallback to configured URL
    db_url = settings.local_database_url
    print(f"Connecting to database: {db_url}")
    
    engine = create_async_engine(db_url, echo=True)
    
    async with engine.begin() as conn:
        print("Connected successfully! Checking tables and executing updates...")
        
        # 1. Update smriti_param (SysParam descriptions and codes)
        try:
            print("Updating smriti_param...")
            # Shoper9 replacement
            res1 = await conn.execute(text("""
                UPDATE smriti_param 
                SET descr = REPLACE(descr, 'Shoper9', 'SMRITI'),
                    cat_descr = REPLACE(cat_descr, 'Shoper9', 'SMRITI')
                WHERE descr LIKE '%Shoper9%' OR cat_descr LIKE '%Shoper9%';
            """))
            # Shoper replacement
            res2 = await conn.execute(text("""
                UPDATE smriti_param 
                SET descr = REPLACE(descr, 'Shoper', 'SMRITI'),
                    cat_descr = REPLACE(cat_descr, 'Shoper', 'SMRITI')
                WHERE descr LIKE '%Shoper%' OR cat_descr LIKE '%Shoper%';
            """))
            # SHOPER prefix/suffix replacement in param_code
            res_code = await conn.execute(text("""
                UPDATE smriti_param 
                SET param_code = REPLACE(param_code, 'SHOPER', 'SMRITI')
                WHERE param_code LIKE '%SHOPER%';
            """))
            # Path value replacements
            res_val1 = await conn.execute(text("""
                UPDATE smriti_param 
                SET value_txt = REPLACE(value_txt, 'shoper9', 'smriti')
                WHERE value_txt LIKE '%shoper9%';
            """))
            res_val2 = await conn.execute(text("""
                UPDATE smriti_param 
                SET value_txt = REPLACE(value_txt, 'shoper7', 'smriti')
                WHERE value_txt LIKE '%shoper7%';
            """))
            print(f"[OK] smriti_param updated. Affected rows: {res1.rowcount + res2.rowcount + res_code.rowcount + res_val1.rowcount + res_val2.rowcount}")
        except Exception as e:
            print(f"[WARN] smriti_param update skipped/failed: {e}")

        # 2. Update smriti_lookup (GenLookup descriptions and codes)
        try:
            print("Updating smriti_lookup...")
            res1 = await conn.execute(text("""
                UPDATE smriti_lookup 
                SET descr = REPLACE(descr, 'Shoper9', 'SMRITI')
                WHERE descr LIKE '%Shoper9%';
            """))
            res2 = await conn.execute(text("""
                UPDATE smriti_lookup 
                SET descr = REPLACE(descr, 'Shoper', 'SMRITI')
                WHERE descr LIKE '%Shoper%';
            """))
            res_code = await conn.execute(text("""
                UPDATE smriti_lookup 
                SET code = REPLACE(code, 'SHOPER', 'SMRITI')
                WHERE code LIKE '%SHOPER%';
            """))
            print(f"[OK] smriti_lookup updated. Affected rows: {res1.rowcount + res2.rowcount + res_code.rowcount}")
        except Exception as e:
            print(f"[WARN] smriti_lookup update skipped/failed: {e}")

        # 3. Update legacy s9.sysparam
        try:
            print("Updating s9.sysparam...")
            res1 = await conn.execute(text("""
                UPDATE s9.sysparam 
                SET descr = REPLACE(descr, 'Shoper9', 'SMRITI'),
                    catdescr = REPLACE(catdescr, 'Shoper9', 'SMRITI')
                WHERE descr LIKE '%Shoper9%' OR catdescr LIKE '%Shoper9%';
            """))
            res2 = await conn.execute(text("""
                UPDATE s9.sysparam 
                SET descr = REPLACE(descr, 'Shoper', 'SMRITI'),
                    catdescr = REPLACE(catdescr, 'Shoper', 'SMRITI')
                WHERE descr LIKE '%Shoper%' OR catdescr LIKE '%Shoper%';
            """))
            res_code = await conn.execute(text("""
                UPDATE s9.sysparam 
                SET paramcode = REPLACE(paramcode, 'SHOPER', 'SMRITI')
                WHERE paramcode LIKE '%SHOPER%';
            """))
            res_val1 = await conn.execute(text("""
                UPDATE s9.sysparam 
                SET txt = REPLACE(txt, 'shoper9', 'smriti')
                WHERE txt LIKE '%shoper9%';
            """))
            res_val2 = await conn.execute(text("""
                UPDATE s9.sysparam 
                SET txt = REPLACE(txt, 'shoper7', 'smriti')
                WHERE txt LIKE '%shoper7%';
            """))
            print(f"[OK] s9.sysparam updated. Affected rows: {res1.rowcount + res2.rowcount + res_code.rowcount + res_val1.rowcount + res_val2.rowcount}")
        except Exception as e:
            print(f"[WARN] s9.sysparam update skipped/failed (possibly schema/table does not exist yet): {e}")

        # 4. Update legacy s9.genlookup
        try:
            print("Updating s9.genlookup...")
            res1 = await conn.execute(text("""
                UPDATE s9.genlookup 
                SET descr = REPLACE(descr, 'Shoper9', 'SMRITI')
                WHERE descr LIKE '%Shoper9%';
            """))
            res2 = await conn.execute(text("""
                UPDATE s9.genlookup 
                SET descr = REPLACE(descr, 'Shoper', 'SMRITI')
                WHERE descr LIKE '%Shoper%';
            """))
            res_code = await conn.execute(text("""
                UPDATE s9.genlookup 
                SET code = REPLACE(code, 'SHOPER', 'SMRITI')
                WHERE code LIKE '%SHOPER%';
            """))
            print(f"[OK] s9.genlookup updated. Affected rows: {res1.rowcount + res2.rowcount + res_code.rowcount}")
        except Exception as e:
            print(f"[WARN] s9.genlookup update skipped/failed (possibly schema/table does not exist yet): {e}")

    print("Database Label Refactoring Completed successfully!")

if __name__ == "__main__":
    asyncio.run(refactor_database_labels())

