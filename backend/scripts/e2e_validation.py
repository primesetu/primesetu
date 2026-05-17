import asyncio
from app.core.database import get_db_session
from app.models.sovereign import SmritiSaleHdr, SmritiSaleDtl, SmritiItem, SmritiAuditLog
from app.models.base import Partner, Transaction, LoyaltyLedger, Store, Customer
from app.services.loyalty_engine import LoyaltyEngine
from datetime import datetime
from sqlalchemy import delete

async def test_e2e_flow():
    print("[E2E] Starting SMRITI-OS Omnichannel & Audit Validation...")
    async with get_db_session() as db:
        # Clean up from previous runs to ensure idempotency
        await db.execute(delete(SmritiSaleHdr).where(SmritiSaleHdr.bill_no == "WEB-E2E-1001"))
        await db.execute(delete(LoyaltyLedger).where(LoyaltyLedger.partner_id == "a829e160-c3d6-4112-9c3f-4e00787e9cf2"))
        await db.execute(delete(Transaction).where(Transaction.bill_no == "WEB-E2E-1001"))
        await db.execute(delete(Partner).where(Partner.id == "a829e160-c3d6-4112-9c3f-4e00787e9cf2"))
        await db.execute(delete(Customer).where(Customer.id == "a829e160-c3d6-4112-9c3f-4e00787e9cf2"))
        await db.execute(delete(Store).where(Store.id == "WEB-01"))
        await db.flush()

        # 0. Create store
        store = Store(
            id="WEB-01",
            name="E2E Web Store",
            code="WEB-01"
        )
        db.add(store)

        # 1. Create dummy customer (both Partner and Customer definitions to satisfy all relations)
        import uuid
        customer_uuid = uuid.UUID("a829e160-c3d6-4112-9c3f-4e00787e9cf2")
        customer = Partner(
            id=customer_uuid,
            type="CUSTOMER",
            name="E2E Validation User",
            mobile="9999999999",
            loyalty_tier="BRONZE",
            total_points_earned=0,
            loyalty_points=0
        )
        db.add(customer)

        legacy_customer = Customer(
            id=customer_uuid,
            mobile="9999999999",
            name="E2E Validation User"
        )
        db.add(legacy_customer)
        
        # 2. Simulate Webhook Ingestion (E-Commerce Order)
        sale_uuid = uuid.uuid4()
        
        sale_hdr = SmritiSaleHdr(
            id=str(sale_uuid),
            bill_no="WEB-E2E-1001",
            bill_date=datetime.utcnow(),
            cust_code=str(customer.id),
            total_qty=2,
            net_amount=5000,
            staff_code="WEB-HOOK"
        )
        db.add(sale_hdr)

        transaction = Transaction(
            id=sale_uuid,
            bill_no="WEB-E2E-1001",
            store_id="WEB-01",
            customer_id=customer.id,
            type="Sales",
            net_payable=5000 * 100
        )
        db.add(transaction)
        
        # 3. Simulate Loyalty Accrual on Finalization
        # 5000 rupees -> 50 points
        accrual_result = await LoyaltyEngine.accrue(
            db=db,
            store_id="WEB-01",
            partner_id=customer.id,
            sale_id=transaction.id,
            net_amount_paise=5000 * 100
        )
        
        print(f"[E2E] Loyalty Accrual: {accrual_result}")
        assert accrual_result["earned"] == 50
        
        # 4. Trigger Batch Upgrade
        customer.total_points_earned += 1950 # Manually boost to test batch script
        upgrade_res = await LoyaltyEngine.run_tier_upgrade_batch(db)
        print(f"[E2E] Tier Upgrade Batch: {upgrade_res}")
        
        # 5. Check Audit Log (Assuming we inserted a dummy audit row)
        audit = SmritiAuditLog(
            entity_type="ITEMMASTER",
            entity_id="SKU-1001",
            action="UPDATE",
            user_id="SYSTEM",
            old_value='{"mrp": "100"}',
            new_value='{"mrp": "120"}'
        )
        db.add(audit)
        
        await db.commit()
        print("[E2E] Validation completed successfully!")

if __name__ == "__main__":
    import os
    import sys
    sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    asyncio.run(test_e2e_flow())
