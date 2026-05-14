import asyncio
from sqlalchemy import create_engine, text

# Converted URL to synchronous for this simple check
engine = create_engine('postgresql://postgres.obuynyhvvjrtgmaeiroy:MSba108682%21%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres')

def check_db():
    with engine.connect() as conn:
        print("--- Checking shoper9 schema for Store X01 ---")
        
        # 1. SysParam
        print("\n[SysParam]")
        res = conn.execute(text("SELECT paramcode, txt, boolean FROM shoper9.sysparam LIMIT 5"))
        for row in res: print(row)
        
        # 2. Class12Combo
        print("\n[Class12Combo]")
        res = conn.execute(text("SELECT * FROM shoper9.class12combo LIMIT 5"))
        rows = res.fetchall()
        if not rows: print("No combinations found in Class12Combo.")
        else:
            for row in rows: print(row)
            
        # 3. ItemMaster
        print("\n[ItemMaster Sample]")
        res = conn.execute(text("SELECT stockno, itemdesc, class1cd, class2cd FROM shoper9.itemmaster LIMIT 1"))
        for row in res: print(row)
        
        # 4. Genlookup
        print("\n[Genlookup Sample]")
        res = conn.execute(text("SELECT DISTINCT rectype FROM shoper9.genlookup LIMIT 10"))
        for row in res: print(row)

if __name__ == "__main__":
    check_db()
