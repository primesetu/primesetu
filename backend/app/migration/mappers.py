# ============================================================
# SMRITI-OS - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect : Jawahar R Mallah
# Organisation     : AITDL Network
# Project          : SMRITI-OS
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

import uuid
from datetime import datetime
from typing import Dict, Any, Optional
from app.models.base import Item, Partner, StockTransaction, StockTransactionItem

class ShoperMapper:
    """The Transformation Logic for Shoper9 to SMRITI-OS Migration"""

    @staticmethod
    def map_item(row: Any, store_id: str, dept_id: uuid.UUID) -> Item:
        """Maps Shoper9 Items table to SMRITI-OS Item model"""
        return Item(
            store_id=store_id,
            item_code=row.StockNo,
            item_name=row.Descr[:40],
            department_id=dept_id,
            mrp_paise=int(row.MRP * 100) if row.MRP else 0,
            cost_paise=int(row.PurchRate * 100) if row.PurchRate else 0,
            gst_rate=int(row.TaxRate) if hasattr(row, 'TaxRate') else 0,
            hsn_code=row.HSNCode if hasattr(row, 'HSNCode') else "0000",
            external_id=row.StockNo,
            shoper_recid=getattr(row, 'RecId', None),
            anal_codes={
                f"anal_{i}": getattr(row, f"AnalCode{i}", None) 
                for i in range(1, 33) if getattr(row, f"AnalCode{i}", None)
            }
        )

    @staticmethod
    def map_partner(row: Any, store_id: str, is_vendor: bool = False) -> Partner:
        """Maps Shoper9 Vendors/Customers to Partner model"""
        return Partner(
            store_id=store_id,
            name=row.Name if hasattr(row, 'Name') else row.VendorName,
            mobile=getattr(row, 'Mobile', None),
            address=getattr(row, 'Address', None),
            gst_no=getattr(row, 'GSTNo', None),
            external_id=row.VendorId if is_vendor else row.CustCode,
            buying_factor=1.0,
            selling_factor=1.0
        )

    @staticmethod
    def map_transaction(row: Any, store_id: str) -> StockTransaction:
        """Maps Shoper9 StkTrnHdr to StockTransaction"""
        return StockTransaction(
            store_id=store_id,
            ref_no=row.DocNo,
            txn_type=row.DocType, # e.g. 'PUR', 'SAL', 'RTN'
            txn_date=row.DocDate,
            status="Completed",
            total_qty=row.TotalQty,
            total_amount_paise=int(row.TotalVal * 100),
            external_id=row.DocNo
        )
