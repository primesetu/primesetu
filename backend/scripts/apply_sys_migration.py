import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv()

async def apply_migration():
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    conn = await asyncpg.connect(db_url)
    
    with open("scripts/tspsysdb9_migration.sql", "r") as f:
        sql = f.read()
    
    # Split by semicolon to execute one by one
    statements = sql.split(";")
    for stmt in statements:
        stmt = stmt.strip()
        if stmt:
            try:
                await conn.execute(stmt)
            except Exception as e:
                print(f"Error executing statement: {stmt[:50]}... \n {e}")
                
    print("Migration applied successfully.")
    await conn.close()

if __name__ == '__main__':
    asyncio.run(apply_migration())
