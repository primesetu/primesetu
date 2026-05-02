from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.models.legacy_s9 import (
    Personnel, PromoMnHeader, PromoMnItemLvlDiscDtls, 
    PromoMnBillLvlDiscDtls, Itemmaster
)
from datetime import datetime
from decimal import Decimal
from typing import List, Dict, Any

class PromoService:
    @staticmethod
    async def evaluate_promotions(db: AsyncSession, items: List[Dict[str, Any]], bill_total: Decimal) -> Dict[str, Any]:
        """
        Sovereign Promotion Engine: Evaluates legacy Shoper9 promos against the current cart.
        """
        now = datetime.now()
        
        # 1. Fetch Active Promotions
        # (Assuming 'active' flag or date check)
        # Note: Shoper9 often uses validfrom/validto
        stmt = select(PromoMnHeader).where(
            and_(
                PromoMnHeader.validfrom <= now,
                PromoMnHeader.validto >= now
            )
        )
        res = await db.execute(stmt)
        active_promos = res.scalars().all()
        promo_codes = [p.salespromocode for p in active_promos]
        
        if not promo_codes:
            return {"applied_promos": [], "item_discounts": {}, "bill_discount": Decimal(0)}

        # 2. Fetch Details
        item_stmt = select(PromoMnItemLvlDiscDtls).where(PromoMnItemLvlDiscDtls.salespromocode.in_(promo_codes))
        bill_stmt = select(PromoMnBillLvlDiscDtls).where(PromoMnBillLvlDiscDtls.salespromocode.in_(promo_codes))
        
        item_rules = (await db.execute(item_stmt)).scalars().all()
        bill_rules = (await db.execute(bill_stmt)).scalars().all()
        
        applied_promos = []
        item_discounts = {} # { stock_no: { disc_amt, promo_code } }
        
        # 3. Evaluate Item Level Discounts
        for item in items:
            stock_no = item.get('stock_no')
            rate = Decimal(str(item.get('unit_price', 0)))
            qty = Decimal(str(item.get('qty', 0)))
            
            best_disc = Decimal(0)
            best_promo = None
            
            # Simple matching: Shoper9 uses item category/brand in these rules too, 
            # but for now we look for direct matches or catch-all
            for rule in item_rules:
                # Check if rule applies to this item (this needs more complex mapping usually)
                # For now, let's assume global item rules for demo purposes or direct match
                # Real Shoper9 uses Item_Class_1, Item_Class_2 etc.
                
                # Apply Percent
                if rule.itemdiscpercent:
                    disc = (rate * qty * Decimal(str(rule.itemdiscpercent))) / 100
                    if disc > best_disc:
                        best_disc = disc
                        best_promo = rule.salespromocode
                
                # Apply Amount
                if rule.itemdiscamount:
                    disc = Decimal(str(rule.itemdiscamount)) * qty
                    if disc > best_disc:
                        best_disc = disc
                        best_promo = rule.salespromocode
                        
            if best_disc > 0:
                item_discounts[stock_no] = {
                    "amount": best_disc,
                    "promo_code": best_promo
                }
                if best_promo not in applied_promos:
                    applied_promos.append(best_promo)

        # 4. Evaluate Bill Level Discounts
        total_bill_disc = Decimal(0)
        for rule in bill_rules:
            if bill_total >= Decimal(str(rule.billvalueabove or 0)) and \
               (not rule.billvalueupto or bill_total <= Decimal(str(rule.billvalueupto))):
                
                if rule.billdiscpercent:
                    disc = (bill_total * Decimal(str(rule.billdiscpercent))) / 100
                    if disc > total_bill_disc:
                        total_bill_disc = disc
                        if rule.salespromocode not in applied_promos:
                            applied_promos.append(rule.salespromocode)
                
                if rule.billdiscamount:
                    disc = Decimal(str(rule.billdiscamount))
                    if disc > total_bill_disc:
                        total_bill_disc = disc
                        if rule.salespromocode not in applied_promos:
                            applied_promos.append(rule.salespromocode)

        return {
            "applied_promos": applied_promos,
            "item_discounts": item_discounts,
            "bill_discount": total_bill_disc
        }
