# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# Protocol: DB Sovereign v1.0 — No new tables. Shoper9 is truth.
# GRN/Purchase history lives in shoper9.stktrnhdr/dtls (trntype=1100)
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, text, desc
from typing import List, Optional
import uuid
from datetime import datetime

from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.legacy_s9 import Itemmaster, Stockmaster, Vendors, Stktrnhdr, Stktrndtls, Pthdrsuper, Ptinvoicedtl, Purchordconfig, Purchordhdr, Purchorddtl
from app.schemas.legacy_purchase import LegacyGRNCreate, PurchaseOrderCreate
from app.core.counters import CounterManager
from app.services.tax_service import TaxService
from decimal import Decimal

router = APIRouter(prefix="/api/v1/purchase", tags=["purchase"])

# ─── GRN HISTORY from shoper9 ─────────────────────────────────────────────────

@router.get("/grn/history")
async def list_grn_history(
    limit: int = 50,
    vendor_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    GRN (Purchase Receipt) History from shoper9.stktrnhdr (trntype=1100).
    No native table needed — Shoper9 is the source of truth.
    """
    query = """
        SELECT
            h.trnctrlno,
            h.docnoprefix || CAST(h.docno AS VARCHAR)  AS grn_no,
            h.docdt::date                               AS grn_date,
            h.partyid                                   AS vendor_code,
            h.netdocvalue                               AS net_value,
            h.totdocdisc                                AS total_disc,
            h.totallineitems                            AS line_count,
            h.docvoidind                                AS is_void,
            h.vauid                                     AS entered_by
        FROM stktrnhdr h
        WHERE h.trntype = 1100
          AND h.docvoidind = 0
          AND h.tenant_id = :tenant_id
        ORDER BY h.trnctrlno DESC
        LIMIT :limit
    """
    result = await db.execute(text(query), {"limit": limit, "tenant_id": current_user.tenant_id})
    rows = result.mappings().all()
    return [dict(r) for r in rows]


@router.get("/grn/{ctrl_no}/lines")
async def get_grn_lines(
    ctrl_no: int,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    GRN Line Items from shoper9.stktrndtls (trntype=1100).
    Joined with Itemmaster for item description.
    """
    query = text("""
        SELECT
            d.entsrlno,
            d.stockno,
            i.itemdesc                  AS item_name,
            d.docqty                    AS qty,
            d.docentrate                AS rate,
            d.docentvalue               AS gross_value,
            d.docenttotdisc             AS discount,
            d.docentnetvalue            AS net_value,
            d.batchno,
            d.gradecd,
            d.locationcd,
            d.aftcurbalqty              AS stock_after
        FROM stktrndtls d
        LEFT JOIN itemmaster i ON i.stockno = d.stockno
        WHERE d.trntype = 1100
          AND d.trnctrlno = :ctrl_no
          AND d.docentvoidind = FALSE
          AND d.tenant_id = :tenant_id
        ORDER BY d.entsrlno
    """)
    result = await db.execute(query, {"ctrl_no": ctrl_no, "tenant_id": current_user.tenant_id})
    rows = result.mappings().all()
    if not rows:
        raise HTTPException(status_code=404, detail=f"GRN {ctrl_no} not found")
    return [dict(r) for r in rows]


@router.get("/purchase-returns/history")
async def list_purchase_return_history(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Purchase Return History from shoper9.stktrnhdr (trntype=2300).
    """
    query = text("""
        SELECT
            h.trnctrlno,
            h.docnoprefix || CAST(h.docno AS VARCHAR)  AS doc_no,
            h.docdt::date                               AS doc_date,
            h.partyid                                   AS vendor_code,
            h.netdocvalue                               AS net_value,
            h.totallineitems                            AS line_count
        FROM stktrnhdr h
        WHERE h.trntype = 2300
          AND h.docvoidind = 0
          AND h.tenant_id = :tenant_id
        ORDER BY h.trnctrlno DESC
        LIMIT :limit
    """)
    result = await db.execute(query, {"limit": limit, "tenant_id": current_user.tenant_id})
    return [dict(r) for r in result.mappings().all()]


@router.get("/stock-transfers/history")
async def list_stock_transfers(
    limit: int = 50,
    transfer_type: str = "both",   # "in", "out", "both"
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Stock Transfer History from shoper9.stktrnhdr.
    trntype 2200 = Transfer Out, 1200 = Transfer In.
    """
    if transfer_type == "in":
        trntypes = "(1200)"
    elif transfer_type == "out":
        trntypes = "(2200)"
    else:
        trntypes = "(1200, 2200)"

    query = text(f"""
        SELECT
            h.trntype,
            CASE h.trntype WHEN 3100 THEN 'Transfer Out' ELSE 'Transfer In' END AS direction,
            h.trnctrlno,
            h.docnoprefix || CAST(h.docno AS VARCHAR)  AS doc_no,
            h.docdt::date                               AS doc_date,
            h.partyid                                   AS party,
            h.netdocvalue                               AS net_value,
            h.totallineitems                            AS line_count
        FROM stktrnhdr h
        WHERE h.trntype IN {trntypes}
          AND h.docvoidind = 0
          AND h.tenant_id = :tenant_id
        ORDER BY h.trnctrlno DESC
        LIMIT :limit
    """)
    result = await db.execute(query, {"limit": limit, "tenant_id": current_user.tenant_id})
    return [dict(r) for r in result.mappings().all()]


@router.get("/item-ledger/{stockno}")
async def get_item_stock_ledger(
    stockno: str,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Full stock movement ledger for any item from shoper9.stktrndtls.
    Shows all IN/OUT across Sales, Purchase, Transfers.
    """
    item_res = await db.execute(select(Itemmaster).where(Itemmaster.stockno == stockno))
    item = item_res.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail=f"Item {stockno} not found in Itemmaster")

    query = text("""
        SELECT
            d.trntype,
            CASE d.trntype
                WHEN 2100 THEN 'Sales'
                WHEN 1300 THEN 'Sales Return'
                WHEN 1100 THEN 'Purchase/GRN'
                WHEN 2300 THEN 'Purchase Return'
                WHEN 2200 THEN 'Transfer Out'
                WHEN 1200 THEN 'Transfer In'
                WHEN 3100 THEN 'Open Stock Loading'
                WHEN 4001 THEN 'Physical Stock'
                ELSE 'Other'
            END AS txn_type,
            h.docnoprefix || CAST(h.docno AS VARCHAR) AS doc_ref,
            h.docdt::date AS doc_date,
            d.phyqtyin,
            d.phyqtyout,
            d.befcurbalqty AS stock_before,
            d.aftcurbalqty AS stock_after,
            d.docentrate AS rate,
            d.docentnetvalue AS net_value,
            d.batchno,
            d.gradecd,
            d.locationcd
        FROM stktrndtls d
        JOIN stktrnhdr h
            ON h.trntype = d.trntype AND h.trnctrlno = d.trnctrlno
        WHERE d.stockno = :stockno
          AND d.tenant_id = :tenant_id
        ORDER BY h.docdt DESC, d.trnctrlno DESC
        LIMIT :limit
    """)
    result = await db.execute(query, {"stockno": stockno, "limit": limit, "tenant_id": current_user.tenant_id})
    rows = result.mappings().all()

    mrp_paise = 0
    if item.retail_price:
        try: mrp_paise = int(float(item.retail_price) * 100)
        except: pass

    stock_res = await db.scalar(
        select(func.sum(Stockmaster.curbalqty)).where(Stockmaster.stockno == stockno)
    )

    return {
        "stockno": stockno,
        "name": item.itemdesc,
        "mrp_paise": mrp_paise,
        "current_stock": float(stock_res or 0),
        "ledger": [dict(r) for r in rows]
    }


@router.get("/vendors")
async def list_vendors(
    q: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """List vendor partners from Shoper9 Vendors table."""
    stmt = select(Vendors)
    if q:
        stmt = stmt.where(
            func.lower(Vendors.nm).like(f"%{q.lower()}%")
        )
    result = await db.execute(stmt.limit(50))
    vendors = result.scalars().all()
    
    return [
        {
            "id": v.code,
            "code": v.code,
            "name": v.nm,
            "type": "Vendor"
        } for v in vendors
    ]




# ─── PURCHASE ORDERS ──────────────────────────────────────────────────────────

@router.get("/orders/config")
async def get_po_config(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """Get PurchOrdConfig to determine UI rendering (Size/Color matrix vs standard)."""
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
    """Generate a new Purchase Order (Hdr + Dtl)."""
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

    tot_tax = Decimal("0")
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
        db.add(dtl)

    await db.commit()
    return {"status": "SUCCESS", "po_no": f"PO{ctrl_no}", "ctrl_no": ctrl_no}


@router.post("/grn/finalize")
async def finalize_grn(
    grn_in: LegacyGRNCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth)
):
    """
    Finalize a Goods Inward (GRN) transaction in Shoper9 legacy format.
    Updates: stktrnhdr, stktrndtls, stockmaster, pthdrsuper, ptinvoicedtl.
    """
    # 1. Get next Transaction Control Number for trntype 1100
    try:
        trn_ctrl_no = await CounterManager.get_next_ctrl_no(db, "1100")
    except Exception:
        # Fallback to max + 1
        res = await db.execute(text("SELECT COALESCE(MAX(trnctrlno), 0) + 1 FROM shoper9.stktrnhdr WHERE trntype = 1100"))
        trn_ctrl_no = res.scalar() or 1

    # 2. Get next Document Number (Institutional)
    doc_no = trn_ctrl_no # Simplified for now

    # Pre-calculate totals with tax
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
    )
    db.add(new_hdr)

    # 4. Create Purchase Header (pthdrsuper)
    new_pt_hdr = Pthdrsuper(
        suppcode=grn_in.vendor_code,
        tenant_id=current_user.tenant_id,
        billno=grn_in.bill_no,
        billdate=datetime.combine(grn_in.bill_date, datetime.min.time()),
        grnno=f"GRN{doc_no}",
        grndate=datetime.now(),
        billamt=sum(item.qty * item.rate for item in grn_in.items),
        purchasevalue=sum(item.qty * item.rate for item in grn_in.items),
        noitems=len(grn_in.items)
    )
    db.add(new_pt_hdr)

    # 5. Process Items
    for i, item_in in enumerate(grn_in.items):
        # Fetch current stock & item info
        stmt = select(Itemmaster).where(Itemmaster.stockno == item_in.stockno)
        res = await db.execute(stmt)
        item_master = res.scalar_one_or_none()
        
        if not item_master:
            continue # Should handle error

        stock_stmt = select(Stockmaster).where(Stockmaster.stockno == item_in.stockno)
        stock_res = await db.execute(stock_stmt)
        stock = stock_res.scalar_one_or_none()
        
        bef_qty = float(stock.curbalqty) if stock else 0.0
        aft_qty = bef_qty + item_in.qty

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
            docentvalue=item_in.qty * item_in.rate,
            docentnetvalue=item_in.qty * item_in.rate,
            befcurbalqty=bef_qty,
            aftcurbalqty=aft_qty,
            batchno=item_in.batchno or "",
            docentvoidind=False
        )
        db.add(new_dtl)

        # B. Purchase Invoice Detail (ptinvoicedtl)
        new_pt_dtl = Ptinvoicedtl(
            suppcode=grn_in.vendor_code,
        tenant_id=current_user.tenant_id,
            billno=grn_in.bill_no,
            billdate=datetime.combine(grn_in.bill_date, datetime.min.time()),
            srlno=i + 1,
            stockno=item_in.stockno,
            qty=item_in.qty,
            rate=item_in.rate,
            itemvalue=item_in.qty * item_in.rate,
            retailprice=item_in.mrp
        )
        db.add(new_pt_dtl)

        # C. Update Stockmaster
        if stock:
            stock.curbalqty = aft_qty
            stock.lastrecdt = datetime.now()
        else:
            new_stock = Stockmaster(
                stockno=item_in.stockno,
                curbalqty=item_in.qty,
                tenant_id=current_user.tenant_id,
                lastrecdt=datetime.now()
            )
            db.add(new_stock)


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


    await db.commit()
    return {"status": "SUCCESS", "grn_no": f"GRN{doc_no}", "ctrl_no": trn_ctrl_no}
