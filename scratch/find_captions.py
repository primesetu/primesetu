
import asyncio
from app.core.database import AsyncSessionLocal
from sqlalchemy import text

async def find_captions():
    async with AsyncSessionLocal() as db:
        # Check schemas first
        schemas_res = await db.execute(text("SELECT schema_name FROM information_schema.schemata"))
        schemas = [r[0] for r in schemas_res.all()]
        print(f"Available Schemas: {schemas}")
        
        target_schema = "s9"
        print(f"Using Schema: {target_schema}")
        
        try:
            sql = text("SELECT paramcode, txt FROM s9.sysparam WHERE paramcode LIKE '%Caption%'")
            res = await db.execute(sql)
            for row in res.all():
                print(f"{row[0]}: {row[1]}")
        except Exception as e:
            print(f"Error querying captions: {e}")
        except Exception as e:
            print(f"Error querying sysparam: {e}")

if __name__ == "__main__":
    asyncio.run(find_captions())
