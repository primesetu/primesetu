# ============================================================
# SMRITI-OS ... Shoper9-Based Retail OS
# Zero Cloud .. Sovereign .. AI-Governed
# System Architect   :  Jawahar R Mallah | .(c) 2026
# "Memory, Not Code."
# ============================================================
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str          # Supabase / Postgres URL
    supabase_url: str
    supabase_service_role_key: str
    jwt_secret: str
    supabase_jwt_secret: str = ""
    anthropic_api_key: str = ""
    environment: str = "development"

    # ── HYBRID MODE DNA ──
    # Options: "CLOUD" (Supabase) | "SOVEREIGN" (Local MSSQL)
    storage_mode: str = "CLOUD" 
    
    # Legacy MSSQL Settings
    mssql_server: str = "AITDL"
    mssql_database: str = "SHOPER9WH1"
    mssql_user: str = "sa"
    mssql_password: str = "netmanthan@123"
    mssql_driver: str = "SQL Server"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()  # type: ignore
