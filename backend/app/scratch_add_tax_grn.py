import os
import re

file_path = r"d:\IMP\GitHub\primesetu\backend\app\routers\purchase.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Add Import
if "from app.services.tax_service import TaxService" not in content:
    content = content.replace(
        "from app.core.counters import CounterManager",
        "from app.core.counters import CounterManager\nfrom app.services.tax_service import TaxService\nfrom decimal import Decimal"
    )

# 2. Update POST /orders
order_loop_old = """    for idx, item in enumerate(po_in.items, 1):
        dtl = Purchorddtl(
            ponoprefix="PO",
            poctrlno=ctrl_no,
            entrysrlno=idx,
            entrysubsrlno=1,
            stockno=item.stockno,
            purchordqty=item.qty,
            purchordrate=item.rate,
            rcvdqty=0,  # CRITICAL: Starts at 0
            poclosureflag=0,
            vauid=current_user.id,
            line_remarks=item.remarks,
            doclinegrossvalue=item.qty * item.rate,
            dateinsert=datetime.utcnow(),
            tenant_id=current_user.tenant_id
        )
        db.add(dtl)"""

order_loop_new = """    tot_tax = Decimal("0")
    for idx, item in enumerate(po_in.items, 1):
        # Calculate Tax
        tax_info = await TaxService.get_item_tax_info(db, item.stockno, showroom_code=current_user.store_id)
        tax_rate = Decimal(str(tax_info.get("total_tax_rate", 0)))
        gross_val = Decimal(str(item.qty)) * Decimal(str(item.rate))
        tax_amt = TaxService.calculate_tax(gross_val, tax_rate, tax_info.get("is_inclusive", False))
        
        # Determine net value
        net_val = gross_val if tax_info.get("is_inclusive", False) else gross_val + tax_amt
        tot_tax += tax_amt

        dtl = Purchorddtl(
            ponoprefix="PO",
            poctrlno=ctrl_no,
            entrysrlno=idx,
            entrysubsrlno=1,
            stockno=item.stockno,
            purchordqty=item.qty,
            purchordrate=item.rate,
            rcvdqty=0,  # CRITICAL: Starts at 0
            poclosureflag=0,
            vauid=current_user.id,
            line_remarks=item.remarks,
            doclinegrossvalue=float(gross_val),
            doclinenetvalue=float(net_val),
            salestaxper=float(tax_rate),
            salestaxamt=float(tax_amt),
            dateinsert=datetime.utcnow(),
            tenant_id=current_user.tenant_id
        )
        db.add(dtl)"""

content = content.replace(order_loop_old, order_loop_new)


# 3. Fix GRN pre-calculation
# We must calculate total_doc_tax before Stktrnhdr is created.
grn_precalc = """    # Pre-calculate totals with tax
    tot_doc_tax = Decimal("0")
    tot_doc_net = Decimal("0")
    grn_items_tax_cache = {}
    
    for item in grn_in.items:
        tax_info = await TaxService.get_item_tax_info(db, item.stockno, showroom_code=current_user.store_id)
        tax_rate = Decimal(str(tax_info.get("total_tax_rate", 0)))
        gross_val = Decimal(str(item.qty)) * Decimal(str(item.rate))
        tax_amt = TaxService.calculate_tax(gross_val, tax_rate, tax_info.get("is_inclusive", False))
        net_val = gross_val if tax_info.get("is_inclusive", False) else gross_val + tax_amt
        
        tot_doc_tax += tax_amt
        tot_doc_net += net_val
        grn_items_tax_cache[item.stockno] = {
            "tax_info": tax_info,
            "tax_rate": tax_rate,
            "tax_amt": tax_amt,
            "gross_val": gross_val,
            "net_val": net_val
        }

    # 3. Create Stock Transaction Header (stktrnhdr)
    new_hdr = Stktrnhdr(
        trntype=1100,
        tenant_id=current_user.tenant_id,
        trnctrlno=trn_ctrl_no,
        docno=doc_no,
        docnoprefix="GRN",
        docdt=datetime.combine(grn_in.bill_date, datetime.min.time()),
        partyid=grn_in.vendor_code,
        totallineitems=len(grn_in.items),
        totdoctax=float(tot_doc_tax),
        docvoidind=0,
        vauid=current_user.id,
        vatermid="SMRITI-OS",
        netdocvalue=float(tot_doc_net)
    )"""

content = content.replace(
"""    # 3. Create Stock Transaction Header (stktrnhdr)
    new_hdr = Stktrnhdr(
        trntype=1100,
        tenant_id=current_user.tenant_id,
        trnctrlno=trn_ctrl_no,
        docno=doc_no,
        docnoprefix="GRN",
        docdt=datetime.combine(grn_in.bill_date, datetime.min.time()),
        partyid=grn_in.vendor_code,
        totallineitems=len(grn_in.items),
        docvoidind=0,
        vauid=current_user.id,
        vatermid="SMRITI-OS",
        netdocvalue=sum(item.qty * item.rate for item in grn_in.items)
    )""", grn_precalc)


# 4. Update GRN Detail loop to use the cache
grn_loop_old = """        # A. Stock Transaction Detail (stktrndtls)
        new_dtl = Stktrndtls(
            trntype=1100,
            tenant_id=current_user.tenant_id,
            trnctrlno=trn_ctrl_no,
            entsrlno=i + 1,
            stockno=item_in.stockno,
            docqty=item_in.qty,
            phyqtyin=item_in.qty,
            docentrate=item_in.rate,
            docentvalue=item_in.qty * item_in.rate,
            docentnetvalue=item_in.qty * item_in.rate,
            befcurbalqty=bef_qty,
            aftcurbalqty=aft_qty,
            batchno=item_in.batchno or "",
            docentvoidind=False
        )"""

grn_loop_new = """        cache = grn_items_tax_cache[item_in.stockno]
        gross_val = cache["gross_val"]
        net_val = cache["net_val"]
        tax_amt = cache["tax_amt"]
        tax_info = cache["tax_info"]

        # Map component taxes (CGST/SGST/IGST etc.)
        tax_comps = {}
        for idx_t, comp in enumerate(tax_info.get("tax_rates", [])):
            if idx_t < 3:
                comp_amt = TaxService.calculate_tax(gross_val, Decimal(str(comp['rate'])), comp['is_inclusive'])
                tax_comps[f"taxcomp{idx_t+1}"] = float(comp_amt)
        
        # A. Stock Transaction Detail (stktrndtls)
        new_dtl = Stktrndtls(
            trntype=1100,
            tenant_id=current_user.tenant_id,
            trnctrlno=trn_ctrl_no,
            entsrlno=i + 1,
            stockno=item_in.stockno,
            docqty=item_in.qty,
            phyqtyin=item_in.qty,
            docentrate=item_in.rate,
            docentvalue=float(gross_val),
            docentnetvalue=float(net_val),
            docenttax=float(tax_amt),
            taxcomp1=tax_comps.get("taxcomp1", 0.0),
            taxcomp2=tax_comps.get("taxcomp2", 0.0),
            taxcomp3=tax_comps.get("taxcomp3", 0.0),
            befcurbalqty=bef_qty,
            aftcurbalqty=aft_qty,
            batchno=item_in.batchno or "",
            docentvoidind=False
        )"""

content = content.replace(grn_loop_old, grn_loop_new)


with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("Tax integration successfully written with pre-calculation!")
