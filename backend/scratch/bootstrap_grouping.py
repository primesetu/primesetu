import asyncio
from sqlalchemy import text
from app.core.database import SessionLocal
from app.core.config import settings

async def bootstrap_item_grouping():
    print("🚀 Bootstrapping Sovereign Item Grouping (Class12Combo)...")
    
    schema = settings.LEGACY_SCHEMA # usually 'shoper9'
    
    # Sample records to inject
    records = [
        {"c1": "JEANS", "c2": "LEVIS", "bill": True, "markup": 45.0, "batch": 0, "stop": 0},
        {"c1": "SHIRT", "c2": "RAYMOND", "bill": True, "markup": 35.0, "batch": 0, "stop": 0},
        {"c1": "JACKET", "c2": "ZARA", "bill": True, "markup": 55.0, "batch": 1, "stop": 30},
        {"c1": "SHOES", "c2": "NIKE", "bill": True, "markup": 40.0, "batch": 1, "stop": 15},
    ]
    
    db = SessionLocal()
    try:
        # 1. Clear existing for demo purposes (optional, but ensures clean view)
        # await db.execute(text(f"TRUNCATE TABLE {schema}.class12combo"))
        
        for r in records:
            query = text(f"""
                INSERT INTO {schema}.class12combo 
                (class1cd, class2cd, billable, retailmarkup, batchapplicable, stopsalesbefexpdays, tenant_id)
                VALUES (:c1, :c2, :bill, :markup, :batch, :stop, 'SYSTEM')
                ON CONFLICT (class1cd, class2cd) DO UPDATE SET 
                retailmarkup = EXCLUDED.retailmarkup,
                batchapplicable = EXCLUDED.batchapplicable
            """)
            db.execute(query, r)
        
        db.commit()
        print("✅ Demo Grouping successfully injected into Class12Combo!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    import sys
    # Wrap in sync run for convenience
    loop = asyncio.get_event_loop()
    loop.run_until_complete(bootstrap_item_grouping())
