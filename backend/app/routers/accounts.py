# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.core.database import get_db
from app.models.base import Transaction, TransactionItem, Item, Partner, CreditNote
from app.core.security import require_auth
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
    current_user = Depends(require_auth)
):
    """
    Sovereign Tally Bridge: Industrial XML Export.
    Produces Shoper 9 compatible <ENVELOPE> with full Item & Tax breakdown.
    """
    store_id = current_user.store_id
    
    # Fetch today's transactions with items
    stmt = (
        select(Transaction)
        .options(joinedload(Transaction.items))
        .where(
            and_(
                Transaction.store_id == store_id,
                Transaction.status == "Finalized",
                func.date(Transaction.created_at) == func.current_date()
            )
        )
    )
    result = await db.execute(stmt)
    txns = result.unique().scalars().all()

    xml_content = f"""<ENVELOPE>
  <HEADER>
    <TALLYREQUEST>Import Data</TALLYREQUEST>
  </HEADER>
  <BODY>
    <IMPORTDATA>
      <REQUESTDESC><REPORTNAME>Vouchers</REPORTNAME></REQUESTDESC>
      <REQUESTDATA>
"""
    for txn in txns:
        date_str = txn.created_at.strftime('%Y%m%d')
        net_amt = txn.net_payable / 100
        tax_amt = txn.tax_amount / 100
        salesman = txn.salesman_id or "GENERAL"
        
        xml_content += f"""        <TALLYMESSAGE xmlns:UDF="TallyUDF">
          <VOUCHER VCHTYPE="Sales" ACTION="Create">
            <DATE>{date_str}</DATE>
            <VOUCHERNUMBER>{txn.bill_no}</VOUCHERNUMBER>
            <PARTYLEDGERNAME>Cash Sales</PARTYLEDGERNAME>
            <EFFECTIVEDATE>{date_str}</EFFECTIVEDATE>
            <NARRATION>Staff: {salesman} | SMRITI-OS Export</NARRATION>
            
            <!-- Dr Cash / Party -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Cash</LEDGERNAME>
              <ISDEEMEDPOSITIVE>Yes</ISDEEMEDPOSITIVE>
              <AMOUNT>-{net_amt:.2f}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Cr Sales -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Sales Account</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{(net_amt - tax_amt):.2f}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            
            <!-- Cr GST -->
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output CGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{(tax_amt / 2):.2f}</AMOUNT>
            </ALLLEDGERENTRIES.LIST>
            <ALLLEDGERENTRIES.LIST>
              <LEDGERNAME>Output SGST</LEDGERNAME>
              <ISDEEMEDPOSITIVE>No</ISDEEMEDPOSITIVE>
              <AMOUNT>{(tax_amt / 2):.2f}</AMOUNT>
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
    current_user = Depends(require_auth)
):
    """Issue a new institutional credit note for sales return."""
    note_no = f"CN-{uuid.uuid4().hex[:6].upper()}"
    new_cn = CreditNote(
        store_id=current_user.store_id,
        customer_id=uuid.UUID(data['customer_id']),
        note_no=note_no,
        original_sale_id=uuid.UUID(data['sale_id']) if 'sale_id' in data else None,
        amount_paise=data['amount_paise'],
        balance_paise=data['amount_paise'],
        status="Active"
    )
    db.add(new_cn)
    await db.commit()
    return {"status": "SUCCESS", "note_no": note_no, "amount": data['amount_paise']}

@router.get("/credit-notes/{customer_id}")
async def get_customer_credit_notes(
    customer_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    """Fetch active credit notes for a customer."""
    stmt = select(CreditNote).where(
        and_(
            CreditNote.customer_id == uuid.UUID(customer_id),
            CreditNote.status == "Active"
        )
    )
    result = await db.execute(stmt)
    return result.scalars().all()
