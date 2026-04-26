# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# * ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import json
from datetime import datetime
from typing import Dict, Any

class ComplianceEngine:
    """
    Sovereign E-Invoicing & GST Compliance Engine.
    Generates standard JSON packets for Government Portal (NIC/IRP).
    """

    @staticmethod
    def generate_einvoice_json(bill: Dict[str, Any], store_config: Dict[str, Any]) -> str:
        """
        Generates a standard GSP/ASP compliant JSON packet for E-Invoicing.
        """
        packet = {
            "Version": "1.1",
            "TranDtls": {
                "TaxSch": "GST",
                "SupTyp": "B2B",
                "RegRev": "N",
                "EcmGstin": None,
                "IgstOnIntra": "N"
            },
            "DocDtls": {
                "Typ": "INV",
                "No": bill['bill_no'],
                "Dt": bill['date'].strftime("%d/%m/%Y") if isinstance(bill['date'], datetime) else bill['date']
            },
            "SellerDtls": {
                "Gstin": store_config['gstin'],
                "LglNm": store_config['legal_name'],
                "Addr1": store_config['address'],
                "Loc": store_config['city'],
                "Pin": int(store_config['pincode']),
                "Stcd": store_config['state_code']
            },
            "BuyerDtls": {
                "Gstin": bill.get('customer_gstin', "URP"),
                "LglNm": bill.get('customer_name', "Consumer"),
                "Pos": bill.get('pos_state_code', store_config['state_code']),
                "Addr1": bill.get('customer_address', "NA"),
                "Loc": bill.get('customer_city', "NA"),
                "Stcd": bill.get('pos_state_code', store_config['state_code'])
            },
            "ItemList": [],
            "ValDtls": {
                "AssVal": bill['taxable_amount'],
                "CgstVal": bill['cgst'],
                "SgstVal": bill['sgst'],
                "IgstVal": bill['igst'],
                "CesVal": 0,
                "StCesVal": 0,
                "RndOffAmt": bill.get('round_off', 0),
                "TotInvVal": bill['net_amount']
            }
        }

        # Add Items
        for i, item in enumerate(bill['items']):
            packet["ItemList"].append({
                "SlNo": str(i + 1),
                "PrdDesc": item['name'],
                "IsServc": "N",
                "HsnCd": item['hsn_code'],
                "Qty": item['qty'],
                "Unit": "PCS",
                "UnitPrice": item['unit_price'],
                "TotAmt": item['total_amount'],
                "Discount": item.get('discount', 0),
                "PreTaxVal": item['taxable_amount'],
                "AssAmt": item['taxable_amount'],
                "GstRt": item['tax_rate'],
                "CgstAmt": item['cgst'],
                "SgstAmt": item['sgst'],
                "IgstAmt": item['igst'],
                "TotItemVal": item['net_amount']
            })

        return json.dumps(packet, indent=2)

    @staticmethod
    def generate_eway_bill_packet(bill: Dict[str, Any], transporter: Dict[str, Any]) -> Dict[str, Any]:
        # Logic for E-Way Bill JSON
        return {}
