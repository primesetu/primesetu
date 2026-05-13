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
    # Options:
    #   "CLOUD"          → Supabase / PostgreSQL (primary cloud production mode)
    #   "SOVEREIGN"      → Local MSSQL (Shoper9 legacy bridge)
    #   "LOCAL_POSTGRES" → Local PostgreSQL (offline/LAN mode — same engine as cloud)
    #
    # LOCAL_POSTGRES is the recommended offline mode. It uses an identical
    # PostgreSQL schema locally (via asyncpg), ensuring zero type friction
    # on sync — unlike SQLite which has loose typing and limited SQL support.
    storage_mode: str = "LOCAL_POSTGRES"

    # ── LOCAL POSTGRES Configuration (OFFLINE mode) ──
    # Install PostgreSQL locally: https://www.postgresql.org/download/
    # Then create a DB: createdb smriti_local
    local_database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/smriti_local"
    offline_sync_interval: int = 30  # Seconds between cloud sync attempts

    # ── Legacy MSSQL Settings ──
    mssql_server: str = "AITDL"
    mssql_database: str = "SHOPER9WH1"
    mssql_user: str = "sa"
    mssql_password: str = "netmanthan@123"
    mssql_driver: str = "SQL Server"

    # ── Legacy Schema Configuration (PostgreSQL side) ──
    # The schema name in PostgreSQL where legacy data is mirrored.
    # Default is 'shoper9', but can be 's9', 'legacy', etc.
    legacy_schema: str = "shoper9"
    
    @property
    def LEGACY_SCHEMA(self) -> str:
        return self.legacy_schema

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()  # type: ignore
