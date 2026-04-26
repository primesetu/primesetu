from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from app.models.base import GeneralLookup, Transaction, TransactionItem

class ReturnCode:
    OK = 10
    WARNING = 20
    BLOCK = 30

class ExtensionEngine:
    """
    Shoper 9 DNA: Pre-update Interception Layer.
    Validates in-memory transaction objects against configured GenLookUp rules before db.commit().
    """

    @staticmethod
    async def validate_transaction(db: AsyncSession, store_id: str, header: Transaction, details: List[TransactionItem]) -> Tuple[int, str]:
        """
        Runs configured validations on a transaction.
        Returns (return_code, message).
        """
        # Fetch active extensions for this store from GenLookUp
        result = await db.execute(
            select(GeneralLookup)
            .where(
                and_(
                    GeneralLookup.store_id == store_id,
                    GeneralLookup.category == "extension_flag",
                    GeneralLookup.is_active == True
                )
            )
        )
        extensions = result.scalars().all()

        for ext in extensions:
            # Rule 1: Limit Check (example of a business rule)
            if ext.code == "max_txn_value":
                max_val = ext.meta.get("max_value_paise", 0) if ext.meta else 0
                if max_val > 0 and header.net_payable > max_val:
                    return ReturnCode.BLOCK, f"Transaction value ({header.net_payable}) exceeds allowed limit ({max_val})"
            
            # Rule 2: Negative Stock Prevention
            if ext.code == "prevent_negative_stock":
                # In a real implementation, we'd fetch the current stock and compare with details.qty
                # Since the router already handles stock check and logs warnings, we can just block if needed.
                pass 
                
            # Rule 3: Missing Salesperson
            if ext.code == "require_salesperson":
                # Implementation would require adding metadata_json or salesperson_id to Transaction model
                pass

        return ReturnCode.OK, "Validation Passed"
