import os
files = [
    'backend/app/main.py', 
    'backend/app/core/database.py', 
    'backend/app/routers/billing.py', 
    'backend/app/routers/inventory.py', 
    'backend/app/routers/store.py', 
    'backend/app/routers/inventory_audit.py', 
    'backend/app/routers/gstr1.py', 
    'backend/app/routers/finance.py', 
    'backend/app/routers/tills.py'
]
for f in files:
    if os.path.exists(f):
        print(f"Cleaning {f}...")
        with open(f, 'rb') as fr:
            data = fr.read()
        clean = data.decode('utf-8', errors='replace').replace('\ufffd', '.')
        with open(f, 'w', encoding='utf-8', newline='\n') as fw:
            fw.write(clean)
print("Done.")
