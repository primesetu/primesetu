# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import xml.etree.ElementTree as ET
from datetime import datetime
from typing import List, Dict, Any

class TallyBridge:
    """
    Sovereign Tally.ERP9 / TallyPrime Integration Engine.
    Generates XML packets for Shoper9-parity accounting.
    """
    
    @staticmethod
    def generate_sales_xml(transactions: List[Dict[str, Any]]) -> str:
        envelope = ET.Element("ENVELOPE")
        header = ET.SubElement(envelope, "HEADER")
        ET.SubElement(header, "TALLYREQUEST").text = "Import Data"
        
        body = ET.SubElement(envelope, "BODY")
        import_data = ET.SubElement(body, "IMPORTDATA")
        
        request_desc = ET.SubElement(import_data, "REQUESTDESC")
        ET.SubElement(request_desc, "REPORTNAME").text = "Vouchers"
        
        request_data = ET.SubElement(import_data, "REQUESTDATA")
        
        for tx in transactions:
            tally_msg = ET.SubElement(request_data, "TALLYMESSAGE", {"xmlns:UDF": "TallyUDF"})
            voucher = ET.SubElement(tally_msg, "VOUCHER", {
                "VCHTYPE": "Sales",
                "ACTION": "Create",
                "OBJVIEW": "Accounting Voucher View"
            })
            
            # Voucher Header
            date_str = tx['date'].strftime("%Y%m%d") if isinstance(tx['date'], datetime) else tx['date'].replace("-", "")
            ET.SubElement(voucher, "DATE").text = date_str
            ET.SubElement(voucher, "VOUCHERTYPENAME").text = "Sales"
            ET.SubElement(voucher, "VOUCHERNUMBER").text = tx['bill_no']
            ET.SubElement(voucher, "PARTYLEDGERNAME").text = tx.get('customer_name', 'Cash Sales')
            ET.SubElement(voucher, "PERSISTEDVIEW").text = "Accounting Voucher View"
            
            # Party Ledger Entry (Debit)
            all_ledger_entries = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(all_ledger_entries, "LEDGERNAME").text = tx.get('customer_name', 'Cash Sales')
            ET.SubElement(all_ledger_entries, "ISDEEMEDPOSITIVE").text = "Yes"
            ET.SubElement(all_ledger_entries, "AMOUNT").text = f"-{tx['net_amount']}" # Debit is negative in Tally XML
            
            # Sales Ledger Entry (Credit)
            sales_ledger = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
            ET.SubElement(sales_ledger, "LEDGERNAME").text = "Sales Account"
            ET.SubElement(sales_ledger, "ISDEEMEDPOSITIVE").text = "No"
            ET.SubElement(sales_ledger, "AMOUNT").text = f"{tx['net_amount']}"
            
            # Tax Entries if any
            if tx.get('tax_amount', 0) > 0:
                tax_ledger = ET.SubElement(voucher, "ALLLEDGERENTRIES.LIST")
                ET.SubElement(tax_ledger, "LEDGERNAME").text = "Output GST"
                ET.SubElement(tax_ledger, "ISDEEMEDPOSITIVE").text = "No"
                ET.SubElement(tax_ledger, "AMOUNT").text = f"{tx['tax_amount']}"

        return ET.tostring(envelope, encoding="unicode")

    @staticmethod
    def generate_purchase_xml(purchases: List[Dict[str, Any]]) -> str:
        # Similar logic for Purchase Vouchers
        pass
