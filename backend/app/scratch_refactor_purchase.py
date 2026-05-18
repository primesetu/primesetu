import os
import re

file_path = r"d:\IMP\GitHub\primesetu\backend\app\routers\purchase.py"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Update imports
content = content.replace(
    "from app.models.legacy_s9 import Itemmaster, Stockmaster, Vendors, Stktrnhdr, Stktrndtls, Pthdrsuper, Ptinvoicedtl",
    "from app.models.legacy_s9 import Itemmaster, Stockmaster, Vendors, Stktrnhdr, Stktrndtls, Pthdrsuper, Ptinvoicedtl, Purchordconfig, Purchordhdr, Purchorddtl"
)
content = content.replace(
    "from app.schemas.legacy_purchase import LegacyGRNCreate",
    "from app.schemas.legacy_purchase import LegacyGRNCreate, PurchaseOrderCreate"
)

# 2. Fix raw SQL shoper9. removal and add tenant_id binding
content = content.replace("FROM shoper9.stktrnhdr h", "FROM stktrnhdr h")
content = content.replace("FROM shoper9.stktrndtls d", "FROM stktrndtls d")
content = content.replace("LEFT JOIN shoper9.itemmaster i", "LEFT JOIN itemmaster i")
content = content.replace("{settings.legacy_schema}.", "") # for item-ledger query

# Add tenant_id to WHERE clauses dynamically in the SQL
content = content.replace("AND h.docvoidind = 0", "AND h.docvoidind = 0\n          AND h.tenant_id = :tenant_id")
content = content.replace("AND d.docentvoidind = FALSE", "AND d.docentvoidind = FALSE\n          AND d.tenant_id = :tenant_id")

# Fix execute calls to pass tenant_id
content = content.replace('{"limit": limit}', '{"limit": limit, "tenant_id": current_user.tenant_id}')
content = content.replace('{"ctrl_no": ctrl_no}', '{"ctrl_no": ctrl_no, "tenant_id": current_user.tenant_id}')

# For item-ledger
content = content.replace('WHERE d.stockno = :stockno', 'WHERE d.stockno = :stockno\n          AND d.tenant_id = :tenant_id')
content = content.replace('{"stockno": stockno, "limit": limit}', '{"stockno": stockno, "limit": limit, "tenant_id": current_user.tenant_id}')


# 3. Add PO Endpoints
po_endpoints = """

# ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────

@router.get("/orders/config")
async def get_po_config(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    \"\"\"Get PurchOrdConfig to determine UI rendering (Size/Color matrix vs standard).\"\"\"
    result = await db.execute(
        select(Purchordconfig).where(Purchordconfig.tenant_id == current_user.tenant_id)
    )
    configs = result.scalars().all()
    return {c.classification.lower(): c.selected for c in configs}

@router.post("/orders")
async def create_purchase_order(
    po_in: PurchaseOrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    \"\"\"Generate a new Purchase Order (Hdr + Dtl).\"\"\"
    try:
        ctrl_no = await CounterManager.get_next_ctrl_no(db, "PO")
    except Exception:
        res = await db.execute(text("SELECT COALESCE(MAX(poctrlno), 0) + 1 FROM purchordhdr WHERE tenant_id = :t"), {"t": current_user.tenant_id})
        ctrl_no = res.scalar() or 1

    total_qty = sum(i.qty for i in po_in.items)
    total_val = sum(i.qty * i.rate for i in po_in.items)

    hdr = Purchordhdr(
        ponoprefix="PO",
        poctrlno=ctrl_no,
        suppid=po_in.vendor_code,
        podate=datetime.combine(po_in.po_date, datetime.min.time()),
        deldate=datetime.combine(po_in.delivery_date, datetime.min.time()) if po_in.delivery_date else None,
        loccurrencyval=total_val,
        advanceper=po_in.advance_percent,
        isposizewise=po_in.is_sizewise,
        vauid=current_user.id,
        docremarks=po_in.remarks,
        dateinsert=datetime.utcnow(),
        tenant_id=current_user.tenant_id
    )
    db.add(hdr)

    for idx, item in enumerate(po_in.items, 1):
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
        db.add(dtl)

    await db.commit()
    return {"status": "SUCCESS", "po_no": f"PO{ctrl_no}", "ctrl_no": ctrl_no}

"""

# Append PO endpoints
content = content.replace("@router.post(\"/grn/finalize\")", po_endpoints + "\n@router.post(\"/grn/finalize\")")


# 4. Refactor POST /grn/finalize to add tenant_id, currentcost, and Against PO linking
# Inside finalize_grn:
# Replace the simple db.add calls to inject tenant_id.
content = content.replace("trntype=1100,", "trntype=1100,\n        tenant_id=current_user.tenant_id,")
content = content.replace("suppcode=grn_in.vendor_code,", "suppcode=grn_in.vendor_code,\n        tenant_id=current_user.tenant_id,")
content = content.replace("stockno=item_in.stockno,\n                curbalqty=item_in.qty,", "stockno=item_in.stockno,\n                curbalqty=item_in.qty,\n                tenant_id=current_user.tenant_id,")

# Add COGS and PO linking after: item_master.retail_price = item_in.mrp
cogs_logic = """
        # D. Update Itemmaster (MRP & COGS)
        item_master.retail_price = item_in.mrp
        item_master.currentcost = item_in.rate
        item_master.lastpurchprice = item_in.rate
        
        # E. Against PO logic
        if grn_in.po_ctrl_no:
            stmt = select(Purchorddtl).where(
                and_(
                    Purchorddtl.poctrlno == grn_in.po_ctrl_no,
                    Purchorddtl.stockno == item_in.stockno,
                    Purchorddtl.tenant_id == current_user.tenant_id
                )
            )
            po_dtl_res = await db.execute(stmt)
            po_dtl = po_dtl_res.scalar_one_or_none()
            if po_dtl:
                po_dtl.rcvdqty = float(po_dtl.rcvdqty or 0) + item_in.qty
                if float(po_dtl.rcvdqty) >= float(po_dtl.purchordqty or 0):
                    po_dtl.poclosureflag = 1
"""
content = content.replace("        # D. Update Itemmaster (MRP)\n        item_master.retail_price = item_in.mrp", cogs_logic)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("purchase.py completely refactored with PO wiring and COGS tracking.")
