# ============================================================
# SMRITI-OS — Sovereign Database Engine Selector
# Supports three modes via STORAGE_MODE env var:
#   CLOUD          → Supabase / PostgreSQL (production default)
#   LOCAL_POSTGRES → Local PostgreSQL (offline / LAN mode)
#   SOVEREIGN      → Local MSSQL (Shoper9 legacy bridge)
# ============================================================
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
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


# ── LOCAL POSTGRES ENGINE (offline / LAN mode) ───────────────────────────────
# Uses a locally installed PostgreSQL instance.
# Identical engine to cloud (asyncpg) → zero SQL dialect friction on sync.
if settings.storage_mode == "LOCAL_POSTGRES":
    engine = _make_async_pg_engine(settings.local_database_url, pool_size=10, max_overflow=5)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async def get_db():
        async with AsyncSessionLocal() as session:
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
    async def get_db_session():
        async with AsyncSessionLocal() as session:
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

    async def get_db():
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
    async def get_db_session():
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
    engine = _make_async_pg_engine(settings.database_url, pool_size=20, max_overflow=10)
    AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async def get_db():
        async with AsyncSessionLocal() as session:
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
    async def get_db_session():
        async with AsyncSessionLocal() as session:
            yield session


class Base(DeclarativeBase):
    pass
