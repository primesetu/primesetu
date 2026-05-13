import asyncio
from sqlalchemy import text
from sqlalchemy.ext.asyncio import create_async_engine
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    LOCAL_DATABASE_URL: str
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()

async def check_local():
    # Use port 5434 as per .env LOCAL_DATABASE_URL
    local_engine = create_async_engine(settings.LOCAL_DATABASE_URL)
    async with local_engine.connect() as conn:
        try:
            res = await conn.execute(text("SELECT COUNT(*) FROM shoper9.itemmaster"))
            print(f"LOCAL [shoper9.itemmaster] count: {res.scalar()}")
        except Exception as e:
            print(f"LOCAL check failed: {e}")
    await local_engine.dispose()

asyncio.run(check_local())
