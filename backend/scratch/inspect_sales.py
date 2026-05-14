import asyncio, asyncpg, os
from dotenv import load_dotenv
load_dotenv()

async def main():
    db_url = os.getenv('DATABASE_URL').replace('postgresql+asyncpg://', 'postgresql://')
    conn = await asyncpg.connect(db_url)
    
    # Key columns from stktrndtls
    cols = await conn.fetch('''
        SELECT column_name, data_type, ordinal_position
        FROM information_schema.columns
        WHERE table_schema = 'shoper9' AND table_name = 'stktrndtls'
        ORDER BY ordinal_position
        LIMIT 50
    ''')
    print('=== shoper9.stktrndtls (first 50 cols) ===')
    for c in cols:
        print(f'  {c["column_name"]:30s} {c["data_type"]}')
    
    # Sample a sales bill (trntype=2100) from stktrndtls + stktrnhdr
    print('\n=== SAMPLE SALES BILL (trntype=2100) ===')
    sample = await conn.fetch('''
        SELECT h.trntype, h.trnctrlno, h.docno, h.docnoprefix, h.docdt,
               h.partyid, h.netdocvalue, h.totdocdisc, h.vauid,
               h.docvoidind, h.totallineitems
        FROM shoper9.stktrnhdr h
        WHERE h.trntype = 2100
        ORDER BY h.trnctrlno DESC
        LIMIT 5
    ''')
    for r in sample:
        print(f'  ctrl={r["trnctrlno"]} docno={r["docnoprefix"]}{r["docno"]} dt={str(r["docdt"])[:10]} party={r["partyid"]} net={r["netdocvalue"]} disc={r["totdocdisc"]} lines={r["totallineitems"]}')
    
    # Sample lines for one of those
    if sample:
        ctrl = sample[0]['trnctrlno']
        lines = await conn.fetch('''
            SELECT entsrlno, stockno, batchno, gradecd, locationcd,
                   phyqtyin, phyqtyout, salerate, salevalue, discvalue,
                   taxvalue, netvalue
            FROM shoper9.stktrndtls
            WHERE trntype = 2100 AND trnctrlno = $1
            ORDER BY entsrlno
        ''', ctrl)
        print(f'\n=== LINES FOR ctrl={ctrl} ===')
        for l in lines:
            print(f'  [{l["entsrlno"]}] {l["stockno"]:15s} batch={l["batchno"]:20s} qty_in={l["phyqtyin"]} qty_out={l["phyqtyout"]} rate={l["salerate"]} val={l["salevalue"]} disc={l["discvalue"]} net={l["netvalue"]}')
    
    # Check trntype mapping
    print('\n=== TRNTYPE GUIDE ===')
    print('  2100 = Sales')
    print('  2200 = Sales Return')
    print('  1200 = Purchase (GRN)')
    print('  1300 = Purchase Return')
    print('  3100 = Stock Transfer Out')
    print('  3200 = Stock Transfer In')
    print('  1100 = Opening Stock')
    print('  1600 = Stock Adjustment')
    
    await conn.close()

asyncio.run(main())
