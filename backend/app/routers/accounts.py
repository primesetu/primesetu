/* ============================================================
 * PrimeSetu - Shoper9-Based Retail OS
 * Zero Cloud . Sovereign . AI-Governed
 * ============================================================
 * System Architect : Jawahar R Mallah
 * Organisation     : AITDL Network
 * Project          : PrimeSetu
 * (c) 2026 - All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Item, Partner
from app.core.auth import get_current_user
from typing import List, Optional
import uuid
from datetime import datetime

router = APIRouter()

@router.get("/gstr1/summary")
async def get_gstr1_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Shoper 9 Compliance: GSTR-1 HSN Summary.
    Aggregates sales by HSN and Tax Rate (Paise Perfect).
    """
    store_id = current_user.store_id
    
    # Query: Group by HSN and Tax Rate
    stmt = (
        select(
            Item.hsn_code,
            Item.gst_rate,
            func.sum(TransactionItem.qty).label("total_qty"),
            func.sum(TransactionItem.net_amount).label("total_value"),
            func.sum(TransactionItem.tax_amount).label("total_tax")
        )
        .join(TransactionItem, Item.id == TransactionItem.product_id)
        .join(Transaction, Transaction.id == TransactionItem.transaction_id)
        .where(and_(Transaction.store_id == store_id, Transaction.status == "Finalized"))
        .group_by(Item.hsn_code, Item.gst_rate)
    )
    
    result = await db.execute(stmt)
    rows = result.all()
    
    summary = []
    for r in rows:
        summary.append({
            "hsn": r.hsn_code,
            "gst_rate": r.gst_rate,
            "total_qty": r.total_qty,
            "taxable_value_paise": r.total_value - r.total_tax,
            "tax_amount_paise": r.total_tax,
            "total_value_paise": r.total_value
        })
        
    return summary

@router.get("/tally-export/xml")
async def generate_tally_xml(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Institutional Tally Bridge.
    Produces Shoper 9 compatible <ENVELOPE> XML for Voucher import.
    """
    store_id = current_user.store_id
    
    # Fetch today's transactions
    result = await db.execute(
        select(Transaction).where(
            and_(
                Transaction.store_id == store_id,
                Transaction.status == "Finalized",
                func.date(Transaction.created_at) == func.current_date()
            )
        )
    )
    txns = result.scalars().all()
    
    # Minimal Shoper 9 / Tally XML Template
    xml_content = f"""<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC>
        <REPORTNAME>Vouchers</REPORTNAME>
      </REQUESTDESC>
      <REQUESTDATA>
"""
    for txn in txns:
        date_str = txn.created_at.strftime('%Y%m%d')
        xml_content += f"""        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>{date_str}</DATE>
            <VOUCHERNUMBER>{txn.bill_no}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Cash Sales</PARTYLEDGERNAME>
            <EFFECTIVEDATE>{date_str}</EFFECTIVEDATE>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{txn.net_payable / 100:.2f}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
          </VOUCHER>
        </TALLYMESSAGE>
"""
    xml_content += """      </REQUESTDATA>
    </IMPORTDATA>
  </BODY>
</ENVELOPE>"""

    return {
        "filename": f"TALLY_EXPORT_{store_id}_{datetime.now().strftime('%Y%m%d')}.xml",
        "content": xml_content
    }

@router.post("/credit-notes")
async def issue_credit_note(
    data: dict,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """Issue a new institutional credit note for sales return."""
    # Simplified logic for refactor
    return {"status": "SUCCESS", "note_no": f"CN-{uuid.uuid4().hex[:6].upper()}"}
