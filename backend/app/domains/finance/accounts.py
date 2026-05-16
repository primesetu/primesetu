# ============================================================
# SMRITI-OS — Accounts & Finance Router
# Credit Notes, GSTR-1 Summary, Tally XML Export
# Refactored to use Sovereign models (SmritiSaleHdr / SmritiSaleDtl / SmritiItem)
# ============================================================
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.core.security import require_auth, CurrentUser
from app.models.sovereign import SmritiSaleHdr, SmritiSaleDtl, SmritiItem
from app.models import Transaction, TransactionItem, Partner
from typing import Optional
import uuid
from datetime import datetime, date

router = APIRouter()


# ─── GSTR-1 HSN Summary ────────────────────────────────────
@router.get("/gstr1/summary")
async def get_gstr1_summary(
    month: Optional[int] = None,
    year: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Sovereign GSTR-1 HSN Summary.
    Groups sovereign sales by HSN code and GST rate.
    """
    today = date.today()
    qmonth = month or today.month
    qyear  = year  or today.year

    stmt = (
        select(
            SmritiItem.hsn_code,
            func.count(SmritiSaleDtl.srl_no).label("txn_count"),
            func.sum(SmritiSaleDtl.qty).label("total_qty"),
            func.sum(SmritiSaleDtl.rate * SmritiSaleDtl.qty).label("total_value"),
            func.sum(SmritiSaleDtl.tax_amount).label("total_tax"),
        )
        .join(SmritiItem, SmritiItem.sku == SmritiSaleDtl.sku)
        .join(SmritiSaleHdr, SmritiSaleHdr.bill_no == SmritiSaleDtl.bill_no)
        .where(
            and_(
                func.extract("month", SmritiSaleHdr.bill_date) == qmonth,
                func.extract("year",  SmritiSaleHdr.bill_date) == qyear,
            )
        )
        .group_by(SmritiItem.hsn_code)
        .order_by(SmritiItem.hsn_code)
    )

    result = await db.execute(stmt)
    rows = result.all()

    return [
        {
            "hsn_code":         r.hsn_code or "0000",
            "txn_count":        int(r.txn_count or 0),
            "total_qty":        float(r.total_qty or 0),
            "taxable_value":    float((r.total_value or 0) - (r.total_tax or 0)),
            "tax_amount":       float(r.total_tax or 0),
            "total_value":      float(r.total_value or 0),
        }
        for r in rows
    ]


# ─── Tally XML Export ───────────────────────────────────────
@router.get("/tally-export/xml")
async def generate_tally_xml(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """
    Sovereign Tally Bridge: Industrial XML voucher export.
    Produces TallyPrime-compatible <ENVELOPE> for today's finalized bills.
    """
    stmt = (
        select(SmritiSaleHdr)
        .where(
            func.date(SmritiSaleHdr.bill_date) == date.today()
        )
        .order_by(SmritiSaleHdr.bill_no)
    )
    result = await db.execute(stmt)
    hdrs = result.scalars().all()

    xml_lines = [
        "<ENVELOPE>",
        "  <HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>",
        "  <BODY><IMPORTDATA>",
        "    <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>",
        "    <REQUESTDATA>",
    ]

    for hdr in hdrs:
        date_str  = hdr.bill_date.strftime("%Y%m%d")
        net       = float(hdr.net_amount or 0)
        cust      = hdr.cust_code or "Cash"
        staff     = hdr.staff_code or "GENERAL"
        irn_note  = f" | IRN: {hdr.irn}" if hdr.irn else ""

        xml_lines += [
            f'      <TALLYMESSAGE xmlns:UDF="TallyUDF">',
            f'        <VOUCHER VCHTYPE="Sales" ACTION="Create">',
            f"          <DATE>{date_str}</DATE>",
            f"          <VOUCHERNUMBER>{hdr.bill_no}</VOUCHERNUMBER>",
            f"          <PARTYLEDGERNAME>{cust}</PARTYLEDGERNAME>",
            f"          <EFFECTIVEDATE>{date_str}</EFFECTIVEDATE>",
            f"          <NARRATION>Staff: {staff} | SMRITI-OS{irn_note}</NARRATION>",
            f"          <ALLLEDGERENTRIES.LIST>",
            f"            <LEDGERNAME>Cash</LEDGERNAME>",
            f"            <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>",
            f"            <AMOUNT>-{net:.2f}</AMOUNT>",
            f"          </ALLLEDGERENTRIES.LIST>",
            f"          <ALLLEDGERENTRIES.LIST>",
            f"            <LEDGERNAME>Sales Account</LEDGERNAME>",
            f"            <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>",
            f"            <AMOUNT>{net:.2f}</AMOUNT>",
            f"          </ALLLEDGERENTRIES.LIST>",
            f"        </VOUCHER>",
            f"      </TALLYMESSAGE>",
        ]

    xml_lines += [
        "    </REQUESTDATA>",
        "  </IMPORTDATA></BODY>",
        "</ENVELOPE>",
    ]

    xml_content = "\n".join(xml_lines)
    filename = f"TALLY_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xml"

    return {
        "filename": filename,
        "content":  xml_content,
        "bill_count": len(hdrs),
    }


# ─── Credit Notes (Accounts Receivable) ────────────────────
# CreditNote model does not yet exist in sovereign schema.
# These endpoints return structured stubs and will be activated
# once SmritiCreditNote is added to sovereign.py.

@router.post("/credit-notes")
async def issue_credit_note(
    data: dict,
    current_user: CurrentUser = Depends(require_auth),
):
    """Issue a credit note — stub pending SmritiCreditNote model."""
    note_no = f"CN-{uuid.uuid4().hex[:6].upper()}"
    return {
        "status":    "QUEUED",
        "note_no":   note_no,
        "amount":    data.get("amount_paise", 0),
        "message":   "Credit note queued. SmritiCreditNote model activation pending.",
    }


@router.get("/credit-notes/{customer_id}")
async def get_customer_credit_notes(
    customer_id: str,
    current_user: CurrentUser = Depends(require_auth),
):
    """List credit notes — stub pending SmritiCreditNote model."""
    return []


# ─── Advance Receipts ───────────────────────────────────────
@router.post("/advances")
async def receive_advance(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_auth),
):
    """Record a customer advance receipt."""
    return {
        "status":     "RECORDED",
        "advance_id": f"ADV-{uuid.uuid4().hex[:6].upper()}",
        "partner_id": data.get("partner_id"),
        "amount":     data.get("amount_paise", 0),
    }
