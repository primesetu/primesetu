import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

DATABASE_URL = "postgresql+asyncpg://postgres.obuynyhvvjrtgmaeiroy:MSba108682!%4012@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres"

async def check_supabase_schema():
    engine = create_async_engine(DATABASE_URL)
    async with engine.connect() as conn:
        print("Checking remote_commands table in Supabase...")
        try:
            result = await conn.execute(text("""
                SELECT column_name, data_type 
                FROM information_schema.columns 
                WHERE table_name = 'remote_commands';
            """))
            columns = result.fetchall()
            if not columns:
                print("Table 'remote_commands' not found in Supabase!")
            for col in columns:
                print(f"Column: {col.column_name}, Type: {col.data_type}")
        except Exception as e:
            print(f"Error: {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_supabase_schema())
