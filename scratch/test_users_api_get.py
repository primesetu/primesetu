import httpx
import asyncio

async def test_endpoint():
    async with httpx.AsyncClient() as client:
        # Test the preferences endpoint (GET)
        url = "http://localhost:8000/api/v1/users/me/preferences"
        print(f"Testing GET {url}...")
        try:
            res = await client.get(url)
            print(f"Status: {res.status_code}")
            print(f"Response: {res.text}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_endpoint())
