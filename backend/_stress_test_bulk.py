import asyncio
import time
import uuid
import random
from decimal import Decimal
from app.core.database import get_db_session
from app.domains.inventory.bulk_item_service import process_bulk_item_import

async def generate_mock_data(count: int):
    items = []
    print(f"Generating {count} mock items...")
    
    # Base data pools to simulate real Footwear retail variations
    products = ['SANDAL', 'SHOE', 'SLIPPER', 'BOOT', 'MOCCS']
    brands = ['NIKE', 'PUMA', 'BATA', 'WOODLAND', 'ADIDAS']
    styles = ['ST101', 'ST102', 'ST205', 'ST900']
    colors = ['BLK', 'BRN', 'WHT', 'TAN', 'NAVY']
    sizes = ['6', '7', '8', '9', '10', '11']
    hsn_codes = ['6401', '6402', '6403', '6404']

    for i in range(count):
        unique_id = str(uuid.uuid4())[:8].upper()
        # Ensure stockno is unique to avoid skipping
        stockno = f"BTEST{i:05d}{unique_id}"
        
        item = {
            "stockno": stockno,
            "class1cd": random.choice(products),
            "class2cd": random.choice(brands),
            "subclass1cd": random.choice(styles),
            "subclass2cd": random.choice(colors),
            "sizecd": random.choice(sizes),
            "itemdesc": f"Test Footwear {unique_id}",
            "retail_price": Decimal(str(random.randint(499, 4999))),
            "standard_cost": Decimal(str(random.randint(200, 1500))),
            "analcode32": random.choice(hsn_codes), # HSN Code
            # Simulate some extra fields
            "uom": "PRS",
            "prodtaxtype": "GST18"
        }
        items.append(item)
    return items

async def main():
    payload_size = 1000  # Load test with 1000 items
    items = await generate_mock_data(payload_size)
    
    print(f"\\n--- SMRITI-OS BULK INJECTION PIPELINE STRESS TEST ({payload_size} items) ---")
    
    async with get_db_session() as session:
        start_time = time.perf_counter()
        
        try:
            summary = await process_bulk_item_import(
                db=session,
                items=items,
                vauid="admin_loadtest",
                vacompcode="LK"
            )
            
            end_time = time.perf_counter()
            duration = end_time - start_time
            
            print(f"SUCCESS: Pipeline Completed Successfully in {duration:.3f} seconds")
            print(f"SPEED: Throughput: {payload_size / duration:.1f} items / second")
            print("\\n--- SUMMARY ---")
            for k, v in summary.items():
                print(f"  {k}: {v}")
                
        except Exception as e:
            print(f"FAILED: Pipeline Failed: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
