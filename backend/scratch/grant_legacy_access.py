
import asyncio
import uuid
from sqlalchemy import text, select
from app.core.database import engine

async def grant_legacy_access():
    async with engine.begin() as conn:
        # Get admin group id
        res = await conn.execute(text("SELECT id FROM va_groups WHERE name = 'admin' LIMIT 1"))
        admin_group = res.fetchone()
        if not admin_group:
            print("Admin group not found.")
            return
        
        group_id = admin_group[0]
        # Insert permission
        await conn.execute(text("""
            INSERT INTO va_group_permissions (id, group_id, permission, is_allowed)
            VALUES (:id, :gid, 'legacy.view', True)
        """), {"id": str(uuid.uuid4()), "gid": group_id})
        print("Granted 'legacy.view' permission to admin group.")

if __name__ == "__main__":
    asyncio.run(grant_legacy_access())
