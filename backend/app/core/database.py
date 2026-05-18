# ============================================================
# SMRITI-OS — Sovereign Database Engine Selector
# Supports three modes via STORAGE_MODE env var:
#   CLOUD          → Supabase / PostgreSQL (production default)
#   LOCAL_POSTGRES → Local PostgreSQL (offline / LAN mode)
#   SOVEREIGN      → Local MSSQL (Shoper9 legacy bridge)
# ============================================================
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from fastapi import Header
from app.core.config import settings

def _make_async_pg_engine(url: str, pool_size: int = 10, max_overflow: int = 5):
    """Factory: create an async PostgreSQL engine (asyncpg driver)."""
    return create_async_engine(
        url,
        echo=(settings.environment == "development"),
        future=True,
        pool_size=pool_size,
        max_overflow=max_overflow,
    )

# ── DYNAMIC ENGINE CACHE ──
_engines = {}
_session_makers = {}

def get_engine_for_db(db_name: str, base_url: str):
    """Dynamically creates or retrieves a connection pool for the target database."""
    # Safety: ensure db_name contains only alphanumeric/underscores
    safe_db_name = "".join(c for c in db_name if c.isalnum() or c == "_")
    
    if safe_db_name not in _engines:
        from urllib.parse import urlparse
        parsed = urlparse(base_url)
        new_url = parsed._replace(path=f"/{safe_db_name}").geturl()
        _engines[safe_db_name] = _make_async_pg_engine(new_url, pool_size=10, max_overflow=5)
        _session_makers[safe_db_name] = async_sessionmaker(
            bind=_engines[safe_db_name], class_=AsyncSession, expire_on_commit=False
        )
    return _session_makers[safe_db_name]

# ── LOCAL POSTGRES ENGINE (offline / LAN mode) ───────────────────────────────
if settings.storage_mode == "LOCAL_POSTGRES":
    # default local DB from the config URL
    default_db_name = settings.local_database_url.split("/")[-1]

    async def get_db(x_company_db: str = Header(default=default_db_name, alias="X-Company-Db")):
        session_maker = get_engine_for_db(x_company_db, settings.local_database_url)
        async with session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def get_db_session(db_name: str = default_db_name):
        session_maker = get_engine_for_db(db_name, settings.local_database_url)
        async with session_maker() as session:
            yield session

# ── SOVEREIGN ENGINE (Local MSSQL on Windows) ────────────────────────────────
elif settings.storage_mode == "SOVEREIGN":
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker

    params = (
        f"DRIVER={{{settings.mssql_driver}}};"
        f"SERVER={settings.mssql_server};"
        f"DATABASE={settings.mssql_database};"
        f"UID={settings.mssql_user};"
        f"PWD={settings.mssql_password};"
    )
    conn_url = f"mssql+pyodbc:///?odbc_connect={params}"
    engine = create_engine(conn_url, echo=(settings.environment == "development"), pool_size=10, max_overflow=5)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

    async def get_db(x_company_db: str = Header(default="default")):
        # MSSQL multi-tenant can be handled here later
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def get_db_session(db_name: str = "default"):
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

# ── CLOUD ENGINE (Supabase / PostgreSQL — default) ────────────────────────────
else:
    default_cloud_db_name = settings.database_url.split("/")[-1]

    async def get_db(x_company_db: str = Header(default=default_cloud_db_name, alias="X-Company-Db")):
        session_maker = get_engine_for_db(x_company_db, settings.database_url)
        async with session_maker() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    from contextlib import asynccontextmanager
    @asynccontextmanager
    async def get_db_session(db_name: str = default_cloud_db_name):
        session_maker = get_engine_for_db(db_name, settings.database_url)
        async with session_maker() as session:
            yield session


class Base(DeclarativeBase):
    pass
