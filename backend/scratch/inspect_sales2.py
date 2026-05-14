import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    ctrl = 70152
    lines = await conn.fetch('''
        SELECT entsrlno, stockno, batchsrlno,
               docqty, phyqtyin, phyqtyout,
               docentrate, docentvalue, docenttotdisc, docentdisc, docentbilldisc,
               docentvalaftdisc, docenttax, docentnetvalue,
               stkupdtrate, stkupdtvaluein, stkupdtvalueout,
               batchno, gradecd, locationcd
        FROM shoper9.stktrndtls
        WHERE trntype = 2100 AND trnctrlno = $1
        ORDER BY entsrlno
    ''', ctrl)
    print(f'=== LINES FOR ctrl={ctrl} (Sales trntype=2100) ===')
    for l in lines:
        print(f'  [{l["entsrlno"]}] stockno={l["stockno"]:15s} batch={str(l["batchno"]):20s} grade={l["gradecd"]} loc={l["locationcd"]}')
        print(f'         qty_doc={l["docqty"]} phyin={l["phyqtyin"]} phyout={l["phyqtyout"]}')
        print(f'         rate={l["docentrate"]} val={l["docentvalue"]} disc={l["docenttotdisc"]} billdisc={l["docentbilldisc"]} net={l["docentnetvalue"]} tax={l["docenttax"]}')
        print(f'         stk_rate={l["stkupdtrate"]} stk_in={l["stkupdtvaluein"]} stk_out={l["stkupdtvalueout"]}')

    # Fetch all stktrndtls cols
    cols = await conn.fetch('''
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'shoper9' AND table_name = 'stktrndtls'
        ORDER BY ordinal_position
    ''')
    print(f'\n=== ALL {len(cols)} COLS IN stktrndtls ===')
    for c in cols:
        print(f'  {c["column_name"]:30s} {c["data_type"]}')

    await conn.close()

asyncio.run(main())
