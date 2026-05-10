import json
import uuid
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.sovereign import SmritiSaleHdr, SmritiSaleDtl
from app.models.legacy_s9 import Itemmaster

class EInvoiceService:
    @staticmethod
    async def generate_irn(bill_no: str, db: AsyncSession):
        """
        Background task to generate IRN for a given SmritiSaleHdr bill_no.
        Connects to NIC IRP APIs.
        """
        # 1. Fetch Header
        hdr_res = await db.execute(select(SmritiSaleHdr).where(SmritiSaleHdr.bill_no == bill_no))
        header = hdr_res.scalar_one_or_none()
        
        if not header:
            raise Exception(f"Invoice {bill_no} not found")
            
        if header.irn:
            return {"status": "success", "message": "IRN already generated", "irn": header.irn}
            
        # 2. Fetch Details
        dtl_res = await db.execute(select(SmritiSaleDtl).where(SmritiSaleDtl.bill_no == bill_no))
        details = dtl_res.scalars().all()
        
        # 3. Construct JSON Payload (As per NIC standard)
        # Note: B2B/B2C logic should be applied. B2C is normally exempt but we'll demonstrate.
        payload = {
            "Version": "1.1",
            "TranDtls": {
                "TaxSch": "GST",
                "SupTyp": "B2B",
                "RegRev": "N"
            },
            "DocDtls": {
                "Typ": "INV",
                "No": header.bill_no,
                "Dt": header.bill_date.strftime("%d/%m/%Y")
            },
            # Dummy seller/buyer details for testing
            "SellerDtls": {
                "Gstin": "27AAAAA0000A1Z5",
                "LglNm": "SMRITI RETAIL",
                "Loc": "MUMBAI",
                "Pin": 400001,
                "Stcd": "27"
            },
            "BuyerDtls": {
                "Gstin": "29BBBBB0000B1Z5",
                "LglNm": "END CUSTOMER",
                "Loc": "BANGALORE",
                "Pin": 560001,
                "Stcd": "29"
            },
            "ValDtls": {
                "AssVal": float(header.net_amount),
                "CgstVal": 0,
                "SgstVal": 0,
                "IgstVal": 0,
                "TotInvVal": float(header.net_amount)
            },
            "ItemList": []
        }
        
        for d in details:
            payload["ItemList"].append({
                "SlNo": str(d.srl_no),
                "PrdDesc": f"Item {d.sku}",
                "IsServc": "N",
                "HsnCd": "999999", # Need actual HSN from Itemmaster
                "Qty": float(d.qty),
                "Unit": "NOS",
                "UnitPrice": float(d.rate),
                "TotAmt": float(d.qty * d.rate),
                "AssAmt": float(d.qty * d.rate),
                "GstRt": 18,
                "IgstAmt": 0,
                "CgstAmt": 0,
                "SgstAmt": 0,
                "TotItemVal": float(d.qty * d.rate)
            })

        # 4. NIC API Handshake (Simulated)
        # In production: requests.post(url, json=payload, headers=auth_headers)
        
        simulated_irn = str(uuid.uuid4()).replace("-", "") * 2 # 64 char string
        simulated_ack_no = f"ACK{int(datetime.utcnow().timestamp())}"
        simulated_qr = f"SMRITI-QR-{simulated_irn}"
        
        # 5. Save back to database
        header.irn = simulated_irn
        header.irn_ack_no = simulated_ack_no
        header.irn_ack_dt = datetime.utcnow()
        header.qr_code_data = simulated_qr
        
        await db.commit()
        
        return {
            "status": "success",
            "message": "IRN generated successfully",
            "irn": simulated_irn,
            "ack_no": simulated_ack_no,
            "qr_code_data": simulated_qr
        }

    @staticmethod
    async def cancel_irn(bill_no: str, cancel_reason: str, db: AsyncSession):
        """
        Cancel IRN within 24 hours.
        """
        hdr_res = await db.execute(select(SmritiSaleHdr).where(SmritiSaleHdr.bill_no == bill_no))
        header = hdr_res.scalar_one_or_none()
        
        if not header or not header.irn:
            raise Exception("IRN not found for this invoice")
            
        # Simulate NIC API cancellation request
        
        header.irn = None
        header.irn_ack_no = None
        header.irn_ack_dt = None
        header.qr_code_data = None
        
        await db.commit()
        
        return {"status": "success", "message": f"IRN for {bill_no} cancelled successfully."}
