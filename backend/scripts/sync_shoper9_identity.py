import pyodbc
import asyncio
from app.core.database import AsyncSessionLocal
from app.models.base import Store, User
from sqlalchemy import select
import uuid

# ============================================================
# PrimeSetu - Shoper 9 "Zero-Config" Identity Sync
# Phase 5: Importing Stores & Users from System Kernel (tspsysdb9)
# ============================================================

def get_shoper9_system_data():
    """Reads Master Stores and Users from tspsysdb9."""
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # 1. Get Stores (Companies)
        # Note: Columns: CompCode, Nm, DbName
        cursor.execute("SELECT LTRIM(RTRIM(CAST(CompCode AS VARCHAR))), LTRIM(RTRIM(CAST(Nm AS VARCHAR))), LTRIM(RTRIM(CAST(DbName AS VARCHAR))) FROM vaCompany")
        stores = [{"code": r[0], "name": r[1], "db_name": r[2]} for r in cursor.fetchall()]
        
        # 2. Get Users
        cursor.execute("SELECT LTRIM(RTRIM(CAST(LoginId AS VARCHAR))), LTRIM(RTRIM(CAST(Nm AS VARCHAR))) FROM vaUser")
        users = [{"login": r[0], "name": r[1]} for r in cursor.fetchall()]
        
        conn.close()
        return stores, users
    except Exception as e:
        print(f"MSSQL System Error: {e}")
        return [], []

async def sync_identity():
    print("Starting Shoper 9 Identity Sync (Zero-Config Mode)...")
    
    stores, users = get_shoper9_system_data()
    
    if not stores:
        print("No stores found in tspsysdb9.")
        return

    async with AsyncSessionLocal() as session:
        # 1. Sync Stores
        for s in stores:
            # Use merge for UPSERT behavior
            new_store = Store(
                id=s["code"], 
                name=s["name"],
                code=s["code"],
                type="Retail",
                metadata_json={"shoper9_db": s["db_name"]}
            )
            await session.merge(new_store)
            print(f"Synced Store: {s['name']} ({s['code']})")

        # 2. Sync Users (Mapping to the first store by default)
        if stores:
            default_store_id = stores[0]["code"]
            for u in users:
                email = f"{u['login'].lower()}@shoper9.local"
                
                # Check for existing user by email to avoid UUID conflicts
                stmt = select(User).where(User.email == email)
                res = await session.execute(stmt)
                existing_user = res.scalar_one_or_none()
                
                if not existing_user:
                    print(f"Adding New User: {u['name']} ({u['login']})")
                    new_user = User(
                        id=uuid.uuid4(),
                        store_id=default_store_id,
                        email=email,
                        full_name=u["name"],
                        role="manager" if u["login"].lower() == "super" else "cashier",
                        active=True
                    )
                    session.add(new_user)
                else:
                    existing_user.full_name = u["name"]
                    print(f"Updated User: {u['name']}")

        await session.commit()
        print("Identity Sync Complete. You can now use Shoper 9 Store IDs in PrimeSetu.")

if __name__ == "__main__":
    asyncio.run(sync_identity())
