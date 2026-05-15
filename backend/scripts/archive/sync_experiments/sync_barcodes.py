import asyncio
import asyncpg
import os
import uuid
from dotenv import load_dotenv

load_dotenv()

async def sync_barcodes():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    print("Syncing SKUs to item_barcodes table...")
    
    # Fetch all items that don't have a barcode yet
    items = await conn.fetch("""
        SELECT i.id, i.store_id, i.item_code 
        FROM public.items i
        LEFT JOIN public.item_barcodes b ON i.id = b.item_id
        WHERE b.id IS NULL
    """)
    
    if not items:
        print("No items found needing barcode sync.")
        return

    barcode_records = []
    for item in items:
        barcode_records.append((
            str(uuid.uuid4()), str(item['store_id']), str(item['id']),
            str(item['item_code']), 'INTERNAL', True, True
        ))

    await conn.executemany("""
        INSERT INTO public.item_barcodes (id, store_id, item_id, barcode, barcode_type, is_primary, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    """, barcode_records)
    
    print(f"Successfully synced {len(barcode_records)} barcodes.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(sync_barcodes())
