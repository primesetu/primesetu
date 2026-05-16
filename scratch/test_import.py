
import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

try:
    from app.domains.inventory.routers import barcode_router
    print("Import Successful")
    print(f"Router Prefix: {barcode_router.router.prefix}")
except Exception as e:
    print(f"Import Failed: {e}")
    import traceback
    traceback.print_exc()
