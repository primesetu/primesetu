import asyncio
from sqlalchemy import select, and_, func
import app.models.legacy_s9 as legacy_models
from app.core.config import settings
from app.core.database import get_engine_for_db, default_db_name

async def debug_bulk():
    db_name = default_db_name
    if settings.storage_mode == "LOCAL_POSTGRES":
        db_url = settings.local_database_url
    else:
        db_url = settings.database_url
        
    print(f"[DEBUG] DB URL: {db_url}, DB Name: {db_name}")
    session_maker = get_engine_for_db(db_name, db_url)
    
    async with session_maker() as db:
        print("[DEBUG] DB session established successfully.")
        
        # Emulate bulk logic
        table_name = "Genlookup"
        tenant_id = "SYSTEM"
        payload = [
            {"recid": 1, "code": "DEBUG_C1", "descr": "Debug Category", "number": 1}
        ]
        
        target_model = None
        for attr_name in dir(legacy_models):
            attr = getattr(legacy_models, attr_name)
            if hasattr(attr, "__tablename__") and attr.__tablename__ == table_name.lower():
                target_model = attr
                break
                
        print(f"[DEBUG] Resolved target_model: {target_model}")
        if not target_model:
            print("[DEBUG] Model not resolved!")
            return
            
        pks = [c.name for c in target_model.__table__.primary_key.columns]
        print(f"[DEBUG] Primary keys: {pks}")
        
        item = payload[0]
        query = select(target_model)
        for pk in pks:
            val = item.get(pk) or item.get(pk.lower()) or item.get(pk.upper())
            if val is not None:
                query = query.where(and_(getattr(target_model, pk) == val, target_model.tenant_id == tenant_id))
        
        print(f"[DEBUG] Query constructed: {query}")
        try:
            res = await db.execute(query)
            row = res.scalar_one_or_none()
            print(f"[DEBUG] Executed fine. Row: {row}")
        except Exception as e:
            import traceback
            print("\n[CRITICAL ERROR RUNNING QUERY]")
            print(traceback.format_exc())

if __name__ == "__main__":
    asyncio.run(debug_bulk())
