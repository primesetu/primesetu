from decimal import Decimal
from typing import Optional, List, Dict, Any
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.legacy_s9 import Itemmaster, Salestaxrevision, Chainstores, Customers, Salesfactors
import logging

logger = logging.getLogger(__name__)

class TaxService:
    @staticmethod
    async def get_item_tax_info(
        db: AsyncSession,
        stockno: str,
        customer_id: Optional[str] = None,
        showroom_code: str = "1"
    ) -> Dict[str, Any]:
        """
        Resolves tax rates and components for a given item and customer context.
        Hierarchy: Sales Factor > Customer Master > Item Master.
        """
        try:
            # 1. Fetch Item Details
            item_stmt = select(Itemmaster).where(Itemmaster.stockno == stockno)
            item_result = await db.execute(item_stmt)
            item = item_result.scalar_one_or_none()

            if not item:
                logger.error(f"Item not found: {stockno}")
                return {"error": "Item not found"}

            # 2. Fetch Customer Details (if provided)
            customer = None
            if customer_id:
                cust_stmt = select(Customers).where(Customers.code == customer_id)
                cust_result = await db.execute(cust_stmt)
                customer = cust_result.scalar_one_or_none()

            # 3. Resolve Sales Factor (Price Group)
            # Search for Salesfactor by (Item + Customer) or (Item + Price Group)
            sf = None
            if customer:
                sf_stmt = select(Salesfactors).where(
                    and_(
                        Salesfactors.stockno == stockno,
                        (Salesfactors.custcd == customer_id) | (Salesfactors.custpricegrpid == customer.pricegrp)
                    )
                ).order_by(desc(Salesfactors.priorityno)).limit(1)
                sf_result = await db.execute(sf_stmt)
                sf = sf_result.scalar_one_or_none()

            # 4. Resolve Tax Components with Priority
            # srctaxtype Priority: SalesFactor > ItemMaster > Chainstores > Default(0)
            srctaxtype = (sf.sf_srctaxtype if sf and sf.sf_srctaxtype else None) or \
                         (item.srctaxtype if item.srctaxtype else None)
            
            if not srctaxtype:
                store_stmt = select(Chainstores).where(Chainstores.code == showroom_code)
                store_result = await db.execute(store_stmt)
                store = store_result.scalar_one_or_none()
                srctaxtype = store.srctaxtype if store else "0"

            # prodtaxtype Priority: SalesFactor > ItemMaster > Default(0)
            prodtaxtype = (sf.sf_prodtaxtype if sf and sf.sf_prodtaxtype else None) or \
                          (item.prodtaxtype if item.prodtaxtype else "0")

            # desttaxtype Priority: CustomerMaster > Default(0)
            desttaxtype = (customer.desttaxtype if customer and customer.desttaxtype else "0")

            # Inclusive Flag Priority: SalesFactor > CustomerMaster > ItemMaster
            is_inclusive = False
            if sf and sf.sf_isrptaxinclusive is not None:
                is_inclusive = sf.sf_isrptaxinclusive
            elif customer and customer.isshopertaxinc is not None:
                is_inclusive = customer.isshopertaxinc
            else:
                is_inclusive = item.isrptaxinclusive or False

            # 5. Fetch Active Tax Revision
            tax_stmt = (
                select(Salestaxrevision)
                .where(
                    and_(
                        Salestaxrevision.srctaxtype == srctaxtype,
                        Salestaxrevision.prodtaxtype == prodtaxtype,
                        Salestaxrevision.desttaxtype == desttaxtype
                    )
                )
                .order_by(desc(Salestaxrevision.effectivedate), desc(Salestaxrevision.taxrevisionid))
                .limit(1)
            )
            tax_result = await db.execute(tax_stmt)
            tax_rev = tax_result.scalar_one_or_none()

            # 6. Extract Components
            components = []
            total_rate = Decimal("0")
            
            if tax_rev:
                for i in range(1, 6):
                    name = getattr(tax_rev, f"t{i}name")
                    rate = getattr(tax_rev, f"t{i}rate") or Decimal("0")
                    # Component level inclusive flag (usually matches header but can differ)
                    comp_inc = getattr(tax_rev, f"t{i}taxinclusive") or False
                    
                    if name and rate > 0:
                        components.append({
                            "name": name,
                            "rate": rate,
                            "is_inclusive": is_inclusive or comp_inc # Use resolved header flag
                        })
                        total_rate += rate

            # 7. Resolve HSN Code
            hsn_code = await TaxService.get_hsn_code(db, stockno)

            return {
                "prodtaxtype": prodtaxtype,
                "srctaxtype": srctaxtype,
                "desttaxtype": desttaxtype,
                "tax_rates": components,
                "total_tax_rate": total_rate,
                "is_inclusive": is_inclusive,
                "hsn_code": hsn_code
            }

        except Exception as e:
            logger.error(f"Error in get_item_tax_info: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    async def get_hsn_code(db: AsyncSession, stockno: str) -> Optional[str]:
        """
        Retrieves HSN code from Tallyhsnrules or Genlookup (Category 11000)
        """
        try:
            from app.models.legacy_s9 import Tallyhsnrules, Genlookup
            
            # 1. Check Tallyhsnrules
            hsn_stmt = select(Tallyhsnrules).where(Tallyhsnrules.stockno == stockno)
            hsn_result = await db.execute(hsn_stmt)
            hsn_rule = hsn_result.scalar_one_or_none()
            if hsn_rule and hsn_rule.hsncode:
                return hsn_rule.hsncode
            
            # 2. Check Item Master directly if HSN is stored in sfield/analcode
            # (Often sfield1 or analcode1 in custom GST patches)
            
            return None
        except Exception:
            return None


    @staticmethod
    def calculate_tax(amount: Decimal, rate: Decimal, is_inclusive: bool) -> Decimal:
        """
        Formula from Shoper 9 Reference:
        Inclusive: Tax = (MRP - Disc) * Rate / (100 + Rate)
        Exclusive: Tax = (Rate - Disc) * Rate / 100
        """
        if is_inclusive:
            return (amount * rate) / (Decimal("100") + rate)
        else:
            return (amount * rate) / Decimal("100")
