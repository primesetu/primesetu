import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

async def main():
    # Load .env
    workspace_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    load_dotenv(os.path.join(workspace_dir, ".env"))
    
    local_url = os.environ.get("LOCAL_DATABASE_URL")
    if not local_url:
        raise ValueError("LOCAL_DATABASE_URL not found in .env")
        
    # Dynamically change the database to 'postgres'
    if "smriti_local" in local_url:
        url = local_url.replace("smriti_local", "postgres")
    else:
        parts = local_url.rsplit("/", 1)
        url = parts[0] + "/postgres"
        
    print("Connecting to database server using URL from .env...")
    engine = create_async_engine(url, isolation_level="AUTOCOMMIT")
    async with engine.connect() as conn:
        print("Force-terminating all other active connections to 'smriti_local'...")
        terminate_sql = """
        SELECT pg_terminate_backend(pg_stat_activity.pid)
        FROM pg_stat_activity
        WHERE pg_stat_activity.datname = 'smriti_local'
          AND pid <> pg_backend_pid();
        """
        result = await conn.execute(text(terminate_sql))
        terminated_count = len(list(result))
        print(f"Closed active database sessions.")
        
        print("Dropping database 'smriti_local'...")
        await conn.execute(text("DROP DATABASE IF EXISTS smriti_local;"))
        print("Creating database 'smriti_local'...")
        await conn.execute(text("CREATE DATABASE smriti_local;"))
    await engine.dispose()
    print("Database 'smriti_local' recreated successfully!")

if __name__ == "__main__":
    asyncio.run(main())
