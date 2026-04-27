import httpx
import asyncio

async def test():
    url = "https://openlibrary.org/search.json?q=Dune&limit=1"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            print(f"Status: {response.status_code}")
            print(f"Body: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test())
