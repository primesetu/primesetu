import pyodbc
import asyncio
import asyncpg
import uuid
import os
from datetime import datetime
from app.core.config import settings

# ============================================================
# PrimeSetu - Shoper 9 BULK Customer Sync Engine (V2)
# Phase 7: Handling 34,000+ Customers with Legacy Codes
# ============================================================

async def get_shoper9_customers(database="SHOPER9X01"):
    """Fetches all 34k customers with their contact details."""
    print("Reading 34k customers from Shoper 9 MSSQL...")
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Join Customers with MailingList
        query = """
            SELECT 
                C.Code, 
                M.Nm, 
                M.MobilePhone, 
                M.Email,
                C.DtOfCreation
            FROM Customers C
            JOIN MailingList M ON C.MailListSrlNo = M.RecNo
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        conn.close()
        return rows
    except Exception as e:
        print(f"MSSQL Customer Error: {e}")
        return []

async def sync_customers():
    print("Starting Bulk Customer Migration (V2)...")
    
    # 1. Fetch from Shoper 9
    rows = await get_shoper9_customers()
    if not rows:
        return
        
    print(f"Found {len(rows)} customers. Formatting for PrimeSetu...")
    
    # 2. Connect to Supabase
    url = settings.database_url.replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(url)
    
    customer_records = []
    seen_mobiles = set()
    
    for row in rows:
        name = str(row.Nm).strip()[:100] if row.Nm else "Unknown"
        mobile = str(row.MobilePhone).strip() if row.MobilePhone else ""
        code = str(row.Code).strip()
        email = str(row.Email).strip()[:100] if row.Email else None
        
        # Fallback Strategy: If mobile is blank, use code
        final_mobile = mobile if mobile else code
        
        # Ensure it's not too long and unique
        final_mobile = final_mobile[:20] 
        
        if not final_mobile or final_mobile in seen_mobiles:
            # If still duplicate (e.g. Code '000' used multiple times), add suffix
            if final_mobile in seen_mobiles:
                final_mobile = f"{final_mobile}_{uuid.uuid4().hex[:4]}"
            else:
                continue # Skip if completely empty
            
        seen_mobiles.add(final_mobile)
        
        # Table: customers
        # Columns: id, mobile, name, email, loyalty_points, created_at
        customer_records.append((
            uuid.uuid4(),           # id
            final_mobile,           # mobile
            name,                   # name
            email,                  # email
            0,                      # loyalty_points
            row.DtOfCreation or datetime.now() # created_at
        ))
        
    # 3. Bulk Insert
    print(f"Uploading {len(customer_records)} records to Supabase...")
    
    async with conn.transaction():
        # Clean up previous failed attempts if any
        await conn.execute("TRUNCATE TABLE customers CASCADE")
        
        await conn.copy_records_to_table(
            'customers',
            records=customer_records,
            columns=['id', 'mobile', 'name', 'email', 'loyalty_points', 'created_at']
        )
        
    await conn.close()
    print(f"CUSTOMER SYNC COMPLETE! {len(customer_records)} customers migrated.")

if __name__ == "__main__":
    asyncio.run(sync_customers())
