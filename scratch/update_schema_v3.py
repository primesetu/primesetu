import asyncio
import asyncpg

PG_URL = "postgresql://postgres:MSba108682%21%40@localhost:5434/smriti_local"

async def update_schema():
    print("Updating Sovereign Schema to v3.0...")
    conn = await asyncpg.connect(PG_URL)
    try:
        async with conn.transaction():
            await conn.execute("""
                ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS barcode VARCHAR;
                ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS anal_codes JSONB;
                ALTER TABLE smriti_item ADD COLUMN IF NOT EXISTS user_fields JSONB;
                ALTER TABLE smriti_stock ADD COLUMN IF NOT EXISTS metadata JSONB;
                CREATE INDEX IF NOT EXISTS idx_smriti_item_barcode ON smriti_item(barcode);
            """)
        print("Schema updated successfully.")
    except Exception as e:
        print(f"Schema Update Error: {e}")
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(update_schema())
