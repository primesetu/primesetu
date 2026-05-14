import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

# Tables we WANT to keep in public schema
ALLOWED_TABLES = {
    "stores", "users", "va_groups", "va_group_permissions", "va_user_groups", 
    "va_group_menus", "transactions", "transaction_items", "customers", "partners",
    "departments", "menu_items", "general_lookup", "system_parameters", "alerts",
    "inventory_audits", "tills", "till_sessions", "loyalty_ledger", "loyalty_programs",
    "loyalty_tiers"
}

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    # All public schema tables
    tables = await conn.fetch("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
          AND table_type = 'BASE TABLE'
        ORDER BY table_name
    """)
    
    junk = []
    keep = []
    
    for t in tables:
        name = t['table_name']
        if name in ALLOWED_TABLES:
            keep.append(name)
        else:
            junk.append(name)
            
    print(f"--- TABLES TO KEEP ({len(keep)}) ---")
    for k in keep:
        print(f"  [KEEP] {k}")
        
    print(f"\n--- JUNK TABLES DETECTED ({len(junk)}) ---")
    for j in junk:
        cnt = await conn.fetchval(f'SELECT count(*) FROM public."{j}"')
        row_str = f"({cnt} rows)" if cnt > 0 else ""
        print(f"  [JUNK] {j} {row_str}")
        
    await conn.close()

asyncio.run(main())
