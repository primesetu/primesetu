# ============================================================
# * PrimeSetu — Shoper9-Based Retail OS
# * Zero Cloud · Sovereign · AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * © 2026 — All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from backend.app.core.database import get_db
from backend.app.models.base import Transaction, TransactionItem, Product
from backend.app.core.security import get_current_user, UserContext
import xml.etree.ElementTree as ET
from datetime import datetime
from typing import Optional, List
import csv
import io

router = APIRouter()

@router.get("/tally-export")
async def export_to_tally(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign Bridge: Generates Tally.ERP 9 / TallyPrime compatible XML.
    Maps Sales transactions to Accounting Vouchers for corporate compliance.
    """
    # Fetch finalized transactions for the current store context
    stmt = (
        select(Transaction)
        .where(Transaction.store_id == current_user.store_id)
        .where(Transaction.status == "Finalized")
    )
    
    # Date filtering logic (Phase 2 enhancement)
    if start_date:
        stmt = stmt.where(Transaction.created_at >= datetime.fromisoformat(start_date))
    if end_date:
        stmt = stmt.where(Transaction.created_at <= datetime.fromisoformat(end_date))

    result = await db.execute(stmt)
    bills = result.scalars().all()

    # Build Tally XML Architecture
    envelope = ET.Element("ENVELOPE")
    header = ET.SubElement(envelope, "HEADER")
    ET.SubElement(header, "TALLYREQUEST").text = "Import Data"
    
    body = ET.SubElement(envelope, "BODY")
    import_data = ET.SubElement(body, "IMPORTDATA")
    
    req_desc = ET.SubElement(import_data, "REQUESTDESC")
    ET.SubElement(req_desc, "REPORTNAME").text = "Vouchers"
    
    req_data = ET.SubElement(import_data, "REQUESTDATA")

    for bill in bills:
        msg = ET.SubElement(req_data, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"})
        vch = ET.SubElement(msg, "VOUCHER", {"VCHTYPE": "Sales", "ACTION": "Create"})
        
        # Voucher Header
        ET.SubElement(vch, "DATE").text = bill.created_at.strftime("%Y%m%d")
        ET.SubElement(vch, "VOUCHERNUMBER").text = bill.bill_number
        ET.SubElement(vch, "PARTYLEDGERNAME").text = "Cash"
        ET.SubElement(vch, "PERSISTEDVIEW").text = "Accounting Voucher View"
        
        # Accounting Entries
        # 1. Party Ledger (Debit)
        all_ledger = ET.SubElement(vch, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(all_ledger, "LEDGERNAME").text = "Cash"
        ET.SubElement(all_ledger, "ISDEEMEDPOSITIVE").text = "Yes"
        ET.SubElement(all_ledger, "AMOUNT").text = str(-bill.total)

        # 2. Sales Ledger (Credit)
        sales_ledger = ET.SubElement(vch, "ALLLEDGERENTRIES.LIST")
        ET.SubElement(sales_ledger, "LEDGERNAME").text = "Sales @ GST 12%"
        ET.SubElement(sales_ledger, "ISDEEMEDPOSITIVE").text = "No"
        ET.SubElement(sales_ledger, "AMOUNT").text = str(bill.total)

    # XML Serialization with Standard Encoding
    xml_str = ET.tostring(envelope, encoding='unicode')
    
    return {
        "filename": f"PrimeSetu_Tally_{datetime.now().strftime('%Y%m%d_%H%M')}.xml",
        "content": xml_str,
        "bill_count": len(bills)
    }

@router.post("/pdt-import")
async def import_pdt_file(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: UserContext = Depends(get_current_user)
):
    """
    Sovereign PDT Integration: Bulk processes inventory counts or audits.
    Accepts high-speed barcode scanner dumps for reconciliation.
    """
    content = await file.read()
    try:
        decoded = content.decode('utf-8')
    except UnicodeDecodeError:
        decoded = content.decode('latin-1') # Fallback for legacy terminal encodings
        
    reader = csv.reader(io.StringIO(decoded))
    
    processed_count = 0
    error_list = []

    # PDT processing usually maps to an 'Audit' session in Shoper9 parity
    for idx, row in enumerate(reader):
        if not row: continue
        try:
            barcode, qty = row[0].strip(), float(row[1].strip())
            # Logic for mapping barcode to internal product_id goes here in Phase 5
            processed_count += 1
        except Exception as e:
            error_list.append(f"Row {idx+1}: Malformed data - {str(e)}")

    return {
        "status": "Success" if processed_count > 0 else "No Data",
        "processed_rows": processed_count,
        "errors": error_list,
        "timestamp": datetime.now().isoformat()
    }
