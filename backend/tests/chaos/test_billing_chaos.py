import pytest
import asyncio
import httpx
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text

# Assuming standard test client setup exists in a conftest.py
# If not, these tests act as the blueprint for the Chaos Suite.

@pytest.mark.asyncio
async def test_duplicate_strike(async_client: httpx.AsyncClient, auth_headers: dict):
    """
    [R9] The Duplicate Strike (Idempotency)
    Fires 5 simultaneous billing requests with the EXACT same Idempotency-Key.
    Expected: 1 succeeds (201 or 200), the rest gracefully return 409 Conflict 
    or the exact same data without duplicating financial entries.
    """
    idempotency_key = str(uuid.uuid4())
    payload = {
        "store_id": "STORE_001",
        "net_payable": 150000,
        "items": [{"item_id": "SKU_001", "qty": 1, "rate_paise": 150000}]
    }
    
    headers = {**auth_headers, "Idempotency-Key": idempotency_key}
    
    # Fire 5 concurrent requests
    tasks = [async_client.post("/api/v1/billing/", json=payload, headers=headers) for _ in range(5)]
    responses = await asyncio.gather(*tasks, return_exceptions=True)
    
    status_codes = [res.status_code for res in responses if not isinstance(res, Exception)]
    
    # Assert exactly 1 success
    successes = [code for code in status_codes if code in (200, 201)]
    conflicts = [code for code in status_codes if code == 409]
    
    assert len(successes) == 1, f"Expected 1 success, got {len(successes)}"
    assert len(conflicts) == 4, f"Expected 4 conflicts, got {len(conflicts)}"

@pytest.mark.asyncio
async def test_stock_contention_strike(async_client: httpx.AsyncClient, auth_headers: dict, db_session: AsyncSession):
    """
    [R9] Stock Contention (Application Level Orchestration)
    Sets a specific SKU stock to 1, then attempts 2 simultaneous purchases from different users.
    Expected: 1 succeeds, 1 returns 400 Bad Request (Insufficient Stock) gracefully.
    """
    # Seed data
    await db_session.execute(text("UPDATE smriti_stock SET qty = 1 WHERE item_id = 'SKU_CONTENTION'"))
    await db_session.commit()
    
    payload = {
        "store_id": "STORE_001",
        "net_payable": 10000,
        "items": [{"item_id": "SKU_CONTENTION", "qty": 1, "rate_paise": 10000}]
    }
    
    # 2 concurrent requests without explicit Idempotency Key (to simulate different carts)
    tasks = [
        async_client.post("/api/v1/billing/", json=payload, headers={**auth_headers, "Idempotency-Key": str(uuid.uuid4())}),
        async_client.post("/api/v1/billing/", json=payload, headers={**auth_headers, "Idempotency-Key": str(uuid.uuid4())})
    ]
    responses = await asyncio.gather(*tasks)
    
    status_codes = [res.status_code for res in responses]
    successes = [code for code in status_codes if code in (200, 201)]
    failures = [code for code in status_codes if code == 400]
    
    assert len(successes) == 1, "Only one transaction should have succeeded"
    assert len(failures) == 1, "One transaction should have failed gracefully due to stock limits"
    
@pytest.mark.asyncio
async def test_power_failure_strike(async_client: httpx.AsyncClient, auth_headers: dict, monkeypatch):
    """
    [R9] Power Failure Strike (Mid-Finalize Transaction)
    Mocks an exception right before db.commit() to simulate a container crash or power loss.
    Expected: The transaction rolls back. Neither the sale, stock deduction, nor the queue dispatch occurs.
    """
    async def mock_commit(*args, **kwargs):
        raise Exception("SIMULATED POWER FAILURE")
    
    # Intercept the session commit
    monkeypatch.setattr("sqlalchemy.ext.asyncio.AsyncSession.commit", mock_commit)
    
    payload = {
        "store_id": "STORE_001",
        "net_payable": 50000,
        "items": [{"item_id": "SKU_001", "qty": 1, "rate_paise": 50000}]
    }
    
    response = await async_client.post("/api/v1/billing/", json=payload, headers={**auth_headers, "Idempotency-Key": str(uuid.uuid4())})
    
    assert response.status_code == 500
    # Additional verification in DB to ensure no partial records exist would go here.
