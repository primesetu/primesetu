# ============================================================
# PrimeSetu â€” Shoper9-Based Retail OS
# Zero Cloud Â. Sovereign Â. AI-Governed
# System Architect   :  Jawahar R. M. | Â(c) 2026
# "Memory, Not Code."
# ============================================================
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    supabase_url: str
    supabase_service_role_key: str
    jwt_secret: str
    anthropic_api_key: str
    environment: str = "development"

    class Config:
        env_file = ".env"

settings = Settings()  # type: ignore
