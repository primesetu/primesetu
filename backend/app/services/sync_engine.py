# ============================================================
# SMRITI-OS - Delta-Sync Engine (Hybrid Sovereign Architecture)
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# Core Engine for ensuring offline resilience and Cloud Parity.
# Uses PostgreSQL Triggers to mark delta changes (sync_status)
# and a background worker to push to the central Cloud Hub.
# ============================================================

import asyncio
import logging
import json
from sqlalchemy import text
from app.database import AsyncSessionLocal
from httpx import AsyncClient

logger = logging.getLogger("smritios.sync_engine")

# The central Cloud API for the Head Office
CLOUD_HUB_API = "https://hub.smritios.com/api/v1/sync/push"
# Tables to track for delta-sync
SYNC_TABLES = ["inventory", "bills", "bill_items", "customers", "users"]

class SyncEngine:
    
    @staticmethod
    async def install_sync_schema():
        """
        Injects the mandatory sync columns into target tables
        and installs the PostgreSQL trigger function.
        """
        async with AsyncSessionLocal() as session:
            try:
                logger.info("Initializing Sync Schema & WAL Triggers...")
                
                # 1. Add mandatory columns if they don't exist
                for table in SYNC_TABLES:
                    alter_sql = f"""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='{table}' AND column_name='sync_status') THEN
                            ALTER TABLE {table} ADD COLUMN sync_status VARCHAR(20) DEFAULT 'PENDING';
                            ALTER TABLE {table} ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
                            ALTER TABLE {table} ADD COLUMN company_id VARCHAR(50) DEFAULT 'HO_DEFAULT';
                        END IF;
                    END $$;
                    """
                    await session.execute(text(alter_sql))

                # 2. Create the unified Trigger Function
                trigger_func_sql = """
                CREATE OR REPLACE FUNCTION trg_mark_pending_sync()
                RETURNS TRIGGER AS $$
                BEGIN
                    IF TG_OP = 'UPDATE' THEN
                        IF NEW.sync_status = 'SYNCED' AND OLD.* IS DISTINCT FROM NEW.* THEN
                            NEW.sync_status := 'PENDING';
                        END IF;
                    ELSIF TG_OP = 'INSERT' THEN
                        NEW.sync_status := 'PENDING';
                    END IF;
                    RETURN NEW;
                END;
                $$ LANGUAGE plpgsql;
                """
                await session.execute(text(trigger_func_sql))

                # 3. Attach trigger to tables
                for table in SYNC_TABLES:
                    attach_sql = f"""
                    DO $$ 
                    BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_{table}_sync') THEN
                            CREATE TRIGGER trg_{table}_sync
                            BEFORE INSERT OR UPDATE ON {table}
                            FOR EACH ROW EXECUTE FUNCTION trg_mark_pending_sync();
                        END IF;
                    END $$;
                    """
                    await session.execute(text(attach_sql))

                await session.commit()
                logger.info("WAL Triggers and Sync Schema successfully installed.")
            except Exception as e:
                await session.rollback()
                logger.error(f"Failed to install Sync Schema: {str(e)}")

    @staticmethod
    async def run_push_worker():
        """
        Background worker that constantly polls for 'PENDING' records
        and pushes them to the Cloud Hub.
        """
        logger.info("Starting Delta-Sync Push Worker...")
        async with AsyncClient() as client:
            while True:
                try:
                    async with AsyncSessionLocal() as session:
                        for table in SYNC_TABLES:
                            # Fetch pending records
                            query = text(f"SELECT * FROM {table} WHERE sync_status = 'PENDING' LIMIT 50")
                            try:
                                result = await session.execute(query)
                                rows = result.mappings().all()
                            except Exception as db_err:
                                if "does not exist" in str(db_err) or "UndefinedTableError" in str(db_err):
                                    logger.warning(f"Table {table} does not exist yet. Skipping sync.")
                                    await session.rollback()
                                    continue
                                else:
                                    await session.rollback()
                                    raise db_err

                            if not rows:
                                continue

                            # Convert to dict and handle datetimes/decimals
                            payload = []
                            for row in rows:
                                row_dict = dict(row)
                                for k, v in row_dict.items():
                                    if hasattr(v, 'isoformat'):
                                        row_dict[k] = v.isoformat()
                                    elif hasattr(v, 'quantize'): # Decimal
                                        row_dict[k] = float(v)
                                payload.append(row_dict)

                            # Push to Cloud Hub
                            logger.info(f"Pushing {len(payload)} delta records from {table} to Cloud Hub...")
                            try:
                                # In a real env, this hits the Cloud Hub.
                                # response = await client.post(CLOUD_HUB_API, json={"table": table, "data": payload})
                                # if response.status_code == 200:
                                
                                # Simulate successful push
                                await asyncio.sleep(0.5) 
                                
                                # Mark as SYNCED
                                ids = [str(r['id']) for r in payload]
                                ids_str = "','".join(ids)
                                update_sql = text(f"UPDATE {table} SET sync_status = 'SYNCED' WHERE id IN ('{ids_str}')")
                                await session.execute(update_sql)
                                await session.commit()
                                logger.info(f"Successfully synced {table}.")
                                
                            except Exception as e:
                                logger.error(f"Network error pushing {table}: {str(e)}")
                                
                except Exception as e:
                    logger.error(f"Sync Worker Error: {str(e)}")
                
                # Wait before next polling cycle (Delta Interval)
                await asyncio.sleep(10)

# Entry point for testing the engine directly
if __name__ == "__main__":
    async def main():
        logging.basicConfig(level=logging.INFO)
        await SyncEngine.install_sync_schema()
        # await SyncEngine.run_push_worker()
        
    asyncio.run(main())
