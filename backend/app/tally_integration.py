/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
import xml.etree.ElementTree as ET
from xml.dom import minidom
from datetime import date
from models import Transaction

def generate_tally_xml(transactions: list[Transaction], company_name: str) -> str:
    """
    Generates Tally XML (TallyMessage/Voucher) for PrimeSetu Sales Transactions.
    Ensures structural compliance for Tally Prime import.
    """
    envelope = ET.Element('ENVELOPE')
    
    header = ET.SubElement(envelope, 'HEADER')
    ET.SubElement(header, 'TALLYREQUEST').text = 'Import Data'
    
    body = ET.SubElement(envelope, 'BODY')
    import_data = ET.SubElement(body, 'IMPORTDATA')
    
    req_desc = ET.SubElement(import_data, 'REQUESTDESC')
    ET.SubElement(req_desc, 'REPORTNAME').text = 'Vouchers'
    
    static_vars = ET.SubElement(req_desc, 'STATICVARIABLES')
    ET.SubElement(static_vars, 'SVCURRENTCOMPANY').text = company_name
    
    req_data = ET.SubElement(import_data, 'REQUESTDATA')
    
    for txn in transactions:
        tally_msg = ET.SubElement(req_data, 'TALLYMESSAGE', xmlnsUDF="TallyUDF")
        voucher = ET.SubElement(tally_msg, 'VOUCHER', VCHTYPE="Sales", ACTION="Create", OBJVIEW="Accounting Voucher View")
        
        ET.SubElement(voucher, 'DATE').text = txn.created_at.strftime('%Y%m%d') if txn.created_at else date.today().strftime('%Y%m%d')
        ET.SubElement(voucher, 'VOUCHERTYPENAME').text = 'Sales'
        ET.SubElement(voucher, 'VOUCHERNUMBER').text = txn.bill_number
        ET.SubElement(voucher, 'PARTYLEDGERNAME').text = 'Cash' # Defaulting to Cash Sales
        ET.SubElement(voucher, 'PERSISTEDVIEW').text = 'Accounting Voucher View'
        
        # Credit Sales Account
        all_ledger = ET.SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
        ET.SubElement(all_ledger, 'LEDGERNAME').text = 'Sales Account'
        ET.SubElement(all_ledger, 'ISDEEMEDPOSITIVE').text = 'No'
        ET.SubElement(all_ledger, 'LEDGERFROMITEM').text = 'No'
        ET.SubElement(all_ledger, 'REMOVEZEROENTRIES').text = 'No'
        ET.SubElement(all_ledger, 'ISPARTYLEDGER').text = 'No'
        ET.SubElement(all_ledger, 'AMOUNT').text = str(txn.total_amount) # Credit is positive in Tally XML or negative depending on version
        
        # Debit Cash/Party Account
        party_ledger = ET.SubElement(voucher, 'ALLLEDGERENTRIES.LIST')
        ET.SubElement(party_ledger, 'LEDGERNAME').text = 'Cash'
        ET.SubElement(party_ledger, 'ISDEEMEDPOSITIVE').text = 'Yes'
        ET.SubElement(party_ledger, 'LEDGERFROMITEM').text = 'No'
        ET.SubElement(party_ledger, 'REMOVEZEROENTRIES').text = 'No'
        ET.SubElement(party_ledger, 'ISPARTYLEDGER').text = 'Yes'
        ET.SubElement(party_ledger, 'AMOUNT').text = f"-{txn.total_amount}" # Debit is negative in Tally XML
        
    xml_str = ET.tostring(envelope, encoding='utf-8')
    parsed_xml = minidom.parseString(xml_str)
    return parsed_xml.toprettyxml(indent="  ")
