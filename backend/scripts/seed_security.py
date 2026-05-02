
import asyncio
import os
import uuid
import sys

# Add the backend directory to sys.path to allow importing app
sys.path.append(os.getcwd())

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select
from dotenv import load_dotenv

load_dotenv()

from app.models.base import Store
from app.models.security import VaGroup, VaGroupPermission

async def seed_security():
    url = os.getenv("DATABASE_URL")
    engine = create_async_engine(url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # 1. Ensure a Store exists
        result = await session.execute(select(Store).limit(1))
        store = result.scalar_one_or_none()
        
        if not store:
            print("Creating default store...")
            store = Store(
                id="001",
                name="Main Store",
                code="MAIN",
                hierarchy_role="standalone",
                is_active=True,
                metadata_json={}
            )
            session.add(store)
            await session.commit()
            await session.refresh(store)
        
        store_id = store.id
        print(f"Using store_id: {store_id}")

        # 2. Define Groups
        groups_data = [
            {"name": "cashier", "desc": "Standard POS Operations"},
            {"name": "manager", "desc": "Store Management & Reports"},
            {"name": "admin",   "desc": "System Administration"},
        ]

        for g in groups_data:
            stmt = select(VaGroup).where(VaGroup.name == g["name"], VaGroup.store_id == store_id)
            res = await session.execute(stmt)
            group = res.scalar_one_or_none()
            
            if not group:
                print(f"Creating group: {g['name']}")
                group = VaGroup(
                    id=uuid.uuid4(),
                    name=g["name"],
                    description=g["desc"],
                    store_id=store_id,
                    is_active=True
                )
                session.add(group)
        
        await session.commit()

        # 3. Define Permissions
        permissions = [
            # Cashier
            ("cashier", "dashboard.view"),
            ("cashier", "billing.view"),
            ("cashier", "billing.returns"),
            ("cashier", "inventory.view"),
            
            # Manager
            ("manager", "dashboard.view"),
            ("manager", "billing.view"),
            ("manager", "billing.returns"),
            ("manager", "billing.dayend"),
            ("manager", "inventory.view"),
            ("manager", "inventory.grn"),
            ("manager", "inventory.audit"),
            ("manager", "catalogue.view"),
            ("manager", "reports.view"),
            ("manager", "finance.view"),
            
            # Admin
            ("admin", "dashboard.view"),
            ("admin", "billing.view"),
            ("admin", "billing.returns"),
            ("admin", "billing.dayend"),
            ("admin", "inventory.view"),
            ("admin", "inventory.grn"),
            ("admin", "inventory.audit"),
            ("admin", "catalogue.view"),
            ("admin", "catalogue.price"),
            ("admin", "catalogue.schemes"),
            ("admin", "reports.view"),
            ("admin", "reports.gst"),
            ("admin", "finance.view"),
            ("admin", "settings.view"),
            ("admin", "settings.security"),
            ("admin", "ho.view"),
        ]

        print("Seeding permissions...")
        for g_name, perm in permissions:
            # Get group_id
            stmt = select(VaGroup).where(VaGroup.name == g_name, VaGroup.store_id == store_id)
            res = await session.execute(stmt)
            group = res.scalar_one()
            
            # Check if permission exists
            stmt = select(VaGroupPermission).where(
                VaGroupPermission.group_id == group.id, 
                VaGroupPermission.permission == perm
            )
            res = await session.execute(stmt)
            p_exists = res.scalar_one_or_none()
            
            if not p_exists:
                p = VaGroupPermission(
                    id=uuid.uuid4(),
                    group_id=group.id,
                    permission=perm,
                    is_allowed=True
                )
                session.add(p)

        await session.commit()
        print("Security seeded successfully.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_security())
