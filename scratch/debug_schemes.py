import asyncio
import httpx

async def debug_schemes():
    print("=== PrimeSetu Schemes Deep Debug ===")
    BASE_URL = "http://localhost:8000/api/v1"

    # 1. List Schemes
    print("\n[1/3] Fetching active schemes...")
    async with httpx.AsyncClient() as client:
        resp = await client.get(f"{BASE_URL}/schemes")
        schemes = resp.json()
        print(f"Found {len(schemes)} schemes.")
        for s in schemes:
            status = "ACTIVE" if s["is_active"] else "INACTIVE"
            print(f"- {s['name']} | {s['type']} | {status}")

    # 2. Create New Scheme
    print("\n[2/3] Creating new Debug Scheme...")
    new_scheme = {
        "name": "Debug BOGO 2026",
        "type": "bogo",
        "value": 0.0,
        "min_amount": 999.0,
        "is_active": True
    }
    async with httpx.AsyncClient() as client:
        resp = await client.post(f"{BASE_URL}/schemes", json=new_scheme)
        if resp.status_code == 200:
            created = resp.json()
            scheme_id = created["id"]
            print(f"[OK] Scheme Created. ID: {scheme_id}")
        else:
            print(f"[FAIL] {resp.text}")
            return

    # 3. Toggle Status (Deactivate)
    print("\n[3/3] Deactivating newly created scheme...")
    async with httpx.AsyncClient() as client:
        resp = await client.patch(f"{BASE_URL}/schemes/{scheme_id}", json={"is_active": False})
        if resp.status_code == 200:
            updated = resp.json()
            print(f"[OK] Scheme {scheme_id} deactivated. Status: {updated['is_active']}")
        else:
            print(f"[FAIL] {resp.text}")

if __name__ == "__main__":
    asyncio.run(debug_schemes())
