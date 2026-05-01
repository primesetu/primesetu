import asyncio
import asyncpg
from app.core.config import settings

async def main():
    conn = await asyncpg.connect(settings.database_url.replace('postgresql+asyncpg://', 'postgresql://'))
    records = await conn.fetch("""
        SELECT i.item_code, a.prev_qty, a.change_qty, a.new_qty, a.created_at 
        FROM stock_audit_ledger a
        JOIN items i ON a.item_id = i.id
        LIMIT 5
    """)
    print("--- SUPABASE (stock_audit_ledger) TABLE DATA ---")
    for r in records:
        print(f"Code: {r['item_code']:<15} | Prev Qty: {r['prev_qty']:<4} | Change: {r['change_qty']:<4} | New Qty: {r['new_qty']:<4} | Date: {r['created_at']}")
    
    count = await conn.fetchval("SELECT COUNT(*) FROM stock_audit_ledger")
    print(f"\nTotal Audit Records in Supabase: {count}")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
