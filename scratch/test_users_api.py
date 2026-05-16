import httpx
import asyncio

async def test_endpoint():
    async with httpx.AsyncClient() as client:
        # Test the preferences endpoint
        url = "http://localhost:8000/api/v1/users/me/preferences"
        print(f"Testing PATCH {url}...")
        try:
            # We use PATCH as defined in users.py
            # We don't have a token here, so we expect 401/403, NOT 404.
            res = await client.patch(url, json={"theme": "dark"})
            print(f"Status: {res.status_code}")
            print(f"Response: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
