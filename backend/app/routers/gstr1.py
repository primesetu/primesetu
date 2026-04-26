# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud · Sovereign · AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# © 2026 — All Rights Reserved
# "Memory, Not Code."
# ============================================================

"""
gstr1.py — GSTR-1 Compliance Export Engine

Generates the government-mandated GSTR-1 return payload:
  - B2B  : Business-to-Business invoices (customer has GSTIN)
  - B2CS : Business-to-Consumer Small (aggregate, taxable value < ₹2.5L)
  - HSN  : HSN-wise summary
  - DOCS : Document summary (invoice count)

Usage:
    GET /api/v1/gstr1/export?month=4&year=2026       → JSON payload
    GET /api/v1/gstr1/export?month=4&year=2026&fmt=csv → CSV download
"""

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.core.security import get_current_user, UserContext
from app.models.base import Transaction, TransactionItem, Item, Store
from datetime import datetime
from typing import Optional
import csv
import io
import json

router = APIRouter(prefix="/api/v1/gstr1", tags=["gstr1"])


# ── Constants ─────────────────────────────────────────────────────────────────
B2B_THRESHOLD = 0          # B2B if customer has GSTIN
B2CS_THRESHOLD = 250000    # B2CS aggregate limit (GST Council)


# ── Helpers ───────────────────────────────────────────────────────────────────
def _compute_gst_split(net_amount: float, tax_rate: float, is_inter_state: bool) -> dict:
    """
    Back-compute CGST/SGST/IGST from a tax-inclusive net amount.
    Formula: taxable = net / (1 + rate/100)
    """
    taxable = round(net_amount / (1 + tax_rate / 100), 2)
    tax_amount = round(net_amount - taxable, 2)

    if is_inter_state:
        return {"taxable": taxable, "igst": tax_amount, "cgst": 0.0, "sgst": 0.0}
    else:
        half = round(tax_amount / 2, 2)
        return {"taxable": taxable, "igst": 0.0, "cgst": half, "sgst": half}


# ── Main Export Endpoint ──────────────────────────────────────────────────────
@router.get("/export")
async def export_gstr1(
    month: int = Query(..., ge=1, le=12, description="Return month (1-12)"),
    year: int = Query(..., ge=2024, le=2030, description="Return year"),
    fmt: str = Query("json", pattern="^(json|csv)$", description="Output format"),
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user),
):
    """
    Generate GSTR-1 export for the specified month/year.
    Classifies invoices as B2B (GSTIN customer) or B2CS (walk-in).
    """
    store_id = current_user.store_id

    # 1. Fetch store GSTIN for state code determination
    store = (await db.execute(
        select(Store).where(Store.id == store_id)
    )).scalar_one_or_none()

    store_gstin = (store.metadata_json or {}).get("gstin", "") if store else ""
    store_state = store_gstin[:2] if store_gstin else "00"

    # 2. Fetch all finalized transactions for the period
    from sqlalchemy import extract
    stmt = (
        select(Transaction)
        .options(selectinload(Transaction.items).selectinload(TransactionItem.item))
        .where(
            Transaction.store_id == store_id,
            Transaction.status == "Finalized",
            Transaction.type == "Sales",
            extract("month", Transaction.created_at) == month,
            extract("year", Transaction.created_at) == year,
        )
        .order_by(Transaction.created_at)
    )
    txns = (await db.execute(stmt)).scalars().all()

    # 3. Build GSTR-1 sections
    b2b_invoices = []
    b2cs_aggregate: dict = {}   # key: "state_code|tax_rate"
    hsn_summary: dict = {}      # key: hsn_code
    
    for tx in txns:
        # Determine if B2B or B2CS
        payments_meta = tx.payments or {}
        customer_gstin = payments_meta.get("customer_gstin", "") if isinstance(payments_meta, dict) else ""
        is_b2b = bool(customer_gstin)
        customer_state = customer_gstin[:2] if customer_gstin else store_state
        is_inter_state = (customer_state != store_state)

        invoice_items = []
        invoice_taxable = 0.0
        invoice_igst = 0.0
        invoice_cgst = 0.0
        invoice_sgst = 0.0

        for i, item in enumerate(tx.items):
            # Get tax rate from item (Shoper9 standard: per line tax)
            tax_rate = float(item.tax_rate or 18.0)
            net = float(item.net_amount or 0)
            split = _compute_gst_split(net, tax_rate, is_inter_state)

            invoice_taxable += split["taxable"]
            invoice_igst += split["igst"]
            invoice_cgst += split["cgst"]
            invoice_sgst += split["sgst"]

            invoice_items.append({
                "num": i + 1, # Row number in invoice
                "txval": split["taxable"],
                "rt": tax_rate,
                "iamt": split["igst"],
                "camt": split["cgst"],
                "samt": split["sgst"],
            })

            # HSN Summary aggregation
            # Use item code or specific HSN attribute if available
            hsn = getattr(item.item, 'hsn_code', item.item.item_code[:4]) if item.item else "0000"
            hsn_key = f"{hsn}|{tax_rate}"
            if hsn_key not in hsn_summary:
                hsn_summary[hsn_key] = {
                    "hsn_sc": hsn,
                    "desc": item.item.item_name[:30] if item.item else "Retail Product",
                    "uqc": "PCS",
                    "qty": 0.0,
                    "val": 0.0,
                    "txval": 0.0,
                    "iamt": 0.0,
                    "camt": 0.0,
                    "samt": 0.0,
                    "rt": tax_rate,
                }
            hsn_summary[hsn_key]["qty"] += float(item.qty)
            hsn_summary[hsn_key]["val"] += net
            hsn_summary[hsn_key]["txval"] += split["taxable"]
            hsn_summary[hsn_key]["iamt"] += split["igst"]
            hsn_summary[hsn_key]["camt"] += split["cgst"]
            hsn_summary[hsn_key]["samt"] += split["sgst"]

        if is_b2b:
            b2b_invoices.append({
                "ctin": customer_gstin,
                "inv": [{
                    "inum": tx.bill_no or str(tx.id)[:8],
                    "idt": tx.created_at.strftime("%d-%m-%Y"),
                    "val": float(tx.net_payable),
                    "pos": customer_state,
                    "rchrg": "N",
                    "inv_typ": "R",
                    "itms": [{"num": 1, "itm_det": it} for it in invoice_items],
                }]
            })
        else:
            # B2CS — aggregate by "state|tax_rate"
            b2cs_key = f"{customer_state}|{invoice_items[0]['rt'] if invoice_items else 18.0}"
            if b2cs_key not in b2cs_aggregate:
                b2cs_aggregate[b2cs_key] = {
                    "sply_ty": "INTER" if is_inter_state else "INTRA",
                    "pos": customer_state,
                    "typ": "OE",
                    "rt": invoice_items[0]['rt'] if invoice_items else 18.0,
                    "txval": 0.0, "iamt": 0.0, "camt": 0.0, "samt": 0.0
                }
            b2cs_aggregate[b2cs_key]["txval"] += invoice_taxable
            b2cs_aggregate[b2cs_key]["iamt"] += invoice_igst
            b2cs_aggregate[b2cs_key]["camt"] += invoice_cgst
            b2cs_aggregate[b2cs_key]["samt"] += invoice_sgst

    # Document summary logic
    total_count = len(txns)
    cancelled_count = (await db.execute(
        select(func.count(Transaction.id)).where(
            Transaction.store_id == store_id,
            Transaction.status == "Cancelled",
            extract("month", Transaction.created_at) == month,
            extract("year", Transaction.created_at) == year,
        )
    )).scalar() or 0

    # 4. Build final GSTR-1 payload
    payload = {
        "gstin": store_gstin,
        "fp": f"{month:02d}{year}",   # Filing Period e.g. "042026"
        "gt": round(sum(float(t.net_payable) for t in txns), 2),
        "cur_gt": round(sum(float(t.net_payable) for t in txns), 2),
        "b2b": b2b_invoices,
        "b2cs": list(b2cs_aggregate.values()),
        "hsn": {"data": list(hsn_summary.values())},
        "doc_issue": {
            "doc_det": [{
                "doc_num": 1,
                "docs": [{
                    "num": 1,
                    "from": "1",
                    "to": str(total_count + cancelled_count),
                    "totnum": total_count + cancelled_count,
                    "cancel": cancelled_count,
                    "net_issue": total_count,
                }]
            }]
        }
    }

    # 5. Return JSON or CSV
    if fmt == "csv":
        return _build_csv_response(payload, month, year)

    return JSONResponse(content=payload)


def _build_csv_response(payload: dict, month: int, year: int) -> StreamingResponse:
    """Generate a human-readable CSV summary of the GSTR-1 return."""
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(["PrimeSetu — GSTR-1 Export"])
    writer.writerow([f"GSTIN: {payload['gstin']}",
                     f"Period: {month:02d}/{year}",
                     f"Grand Total: ₹{payload['gt']:,.2f}"])
    writer.writerow([])

    # B2B Section
    writer.writerow(["=== B2B INVOICES ==="])
    writer.writerow(["Customer GSTIN", "Invoice No", "Date", "Value", "Taxable", "IGST", "CGST", "SGST"])
    for entry in payload.get("b2b", []):
        for inv in entry.get("inv", []):
            taxable = sum(i["txval"] for i in inv.get("itms", []))
            igst = sum(i["igst"] for i in inv.get("itms", []))
            cgst = sum(i["cgst"] for i in inv.get("itms", []))
            sgst = sum(i["sgst"] for i in inv.get("itms", []))
            writer.writerow([entry["ctin"], inv["inum"], inv["idt"],
                             inv["val"], taxable, igst, cgst, sgst])
    writer.writerow([])

    # B2CS Section
    writer.writerow(["=== B2CS (Walk-in Sales Aggregate) ==="])
    writer.writerow(["Supply Type", "State", "Tax Rate", "Taxable", "IGST", "CGST", "SGST"])
    for b in payload.get("b2cs", []):
        writer.writerow([b["sply_ty"], b["pos"], b["rt"],
                         b["txval"], b["iamt"], b["camt"], b["samt"]])
    writer.writerow([])

    # HSN Section
    writer.writerow(["=== HSN SUMMARY ==="])
    writer.writerow(["HSN Code", "Description", "UQC", "Qty", "Value", "Taxable", "IGST", "CGST", "SGST"])
    for h in payload.get("hsn", {}).get("data", []):
        writer.writerow([h["hsn_sc"], h["desc"], h["uqc"], h["qty"],
                         h["val"], h["txval"], h["iamt"], h["camt"], h["samt"]])

    output.seek(0)
    filename = f"GSTR1_{payload['gstin']}_{month:02d}{year}.csv"
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
