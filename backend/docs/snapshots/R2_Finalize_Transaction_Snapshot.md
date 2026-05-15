# R2 Transaction Integrity Snapshots

This document preserves the institutional logic transformation of the `finalize_transaction` endpoint during Phase R2.

## 1. Old `finalize_transaction` (Pre-R2)
*Characteristics: Fragmented commits, out-of-transaction draft clearing, inline loyalty calculation causing point inflation.*

```python
@router.post("/finalize", response_model=TransactionRead)
async def finalize_transaction(
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    # [TRUNCATED FOR BREVITY - FULL SOURCE IN GIT HISTORY]
    # Commit #1: Transaction Header and Items
    db.add(new_txn)
    
    # Loyalty (Inline - caused double accrual)
    if txn_in.customer_id:
        # ... logic ...
        db.add(ledger_entry)

    await db.commit() # FIRST COMMIT

    # Draft Clear (Out of transaction - orphan risk)
    await db.execute(delete(DraftBillItem).where(DraftBillItem.user_id == current_user.id))

    # Commit #2: Payments
    if txn_in.payments:
        # ... Stktrnaddldtls rows ...
        await db.commit() # SECOND COMMIT

    # Loyalty Accrual (Redundant call - caused inflation)
    await LoyaltyEngine.accrue(...)
    await db.commit() # THIRD COMMIT
```

## 2. New `finalize_transaction` (Post-R2)
*Characteristics: Strict atomic `db.begin()` boundary, integrated Idempotency, deferred eventual-consistency tasks.*

```python
@router.post("/finalize", response_model=TransactionRead)
async def finalize_transaction(
    txn_in: TransactionCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_auth)
):
    store_id = current_user.store_id

    # ── [R2] SINGLE ATOMIC TRANSACTION ─────────────────────────────────────
    async with db.begin():
        # STEP 0: Idempotency pre-flight (Clean Replay Path)
        if txn_in.idempotency_key:
            # ... check SmritiIdempotency ...
            
        # STEP 1-5: Headers, Items, S9 Ledger (Stktrndtls)
        # ... identical legacy mappings preserved ...

        # STEP 6: Payment settlement rows (Moved inside transaction)
        # ... Stktrnaddldtls rows ...

        # STEP 7: Draft clear (Moved inside transaction)
        await db.execute(delete(DraftBillItem).where(DraftBillItem.user_id == current_user.id))

        # STEP 8: Idempotency record
        if txn_in.idempotency_key:
            db.add(SmritiIdempotency(key=txn_in.idempotency_key, store_id=store_id, transaction_id=new_txn.id, bill_no=new_bill_no))

    # ── POST-COMMIT: Eventual consistency tasks ─────────────────────────────
    # Loyalty and WhatsApp dispatch non-blocking
    async def _post_commit_tasks():
        # ... LoyaltyEngine.accrue() ...
        # ... WhatsApp dispatch ...
    asyncio.create_task(_post_commit_tasks())

    # Return enriched transaction
    # ...
```

## 3. Rollback Scenarios Validated
- **Inventory Block Rollback**: If `stock_action == "Block"` and quantity is insufficient, a 400 is raised deep inside the item loop. The entire `db.begin()` block is rolled back. No counter is consumed, no headers saved.
- **Data Integrity Rollback**: Simulating a constraint failure (e.g., invalid store_id) causes PostgreSQL to reject the commit, ensuring no orphan payment rows (`Stktrnaddldtls`) are ever left behind without a corresponding bill.

## 4. Crash Recovery Mechanisms
- **PostgreSQL Connection Rollback**: Because of `async with db.begin()`, if the Python worker crashes (e.g., OOM kill) mid-transaction, the connection is dropped and PostgreSQL natively discards all pending uncommitted row-locks and data. 
- **Retry Safety (Idempotency)**: If a client loses network exactly after sending a bill and retries, the `SmritiIdempotency` table traps the `idempotency_key`, preventing double deduction of stock and returning the originally committed bill instead.
