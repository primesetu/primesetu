import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

async def show_top_10_postgres():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        print("DATABASE_URL not found in .env")
        return

    # Replace asyncpg prefix if present for compatibility (though asyncpg needs it)
    if database_url.startswith("postgresql+asyncpg://"):
        database_url = database_url.replace("postgresql+asyncpg://", "postgresql://")

    try:
        conn = await asyncpg.connect(database_url)
        
        # Set search path to include shoper9 schema
        await conn.execute("SET search_path TO shoper9, public")
        
        query = "SELECT class1cd, class2cd, billable, sizegroup, retailmarkup, prodtaxtype FROM class12combo LIMIT 10"
        rows = await conn.fetch(query)
        
        if not rows:
            print("No records found in class12combo table.")
            await conn.close()
            return

        columns = rows[0].keys()
        
        print(f"\nTop 10 Records from Smriti-OS (PostgreSQL) class12combo:\n")
        header = " | ".join(str(col).upper().ljust(15) for col in columns)
        print(header)
        print("-" * len(header))
        
        for row in rows:
            print(" | ".join(str(val).ljust(15) for val in row.values()))
            
        await conn.close()
    except Exception as e:
        print(f"PostgreSQL Error: {e}")

if __name__ == "__main__":
    asyncio.run(show_top_10_postgres())
