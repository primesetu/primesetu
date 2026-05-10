# ============================================================
# * SMRITI-OS - Shoper9-Based Retail OS
# * Zero Cloud .. Sovereign .. AI-Governed
# ============================================================
# * System Architect   :  Jawahar R Mallah
# * Organisation       :  AITDL Network
# * Project            :  SMRITI-OS
# * .(c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Hybrid Engine Selection
if settings.storage_mode == "SOVEREIGN":
    # ── SOVEREIGN ENGINE (Local MSSQL on Windows) ──
    # Using mssql+pyodbc (Synchronous wrapper for institutional stability)
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
    
    # Build Connection String for Local MSSQL
    params = f"DRIVER={{{settings.mssql_driver}}};SERVER={settings.mssql_server};DATABASE={settings.mssql_database};UID={settings.mssql_user};PWD={settings.mssql_password};"
    conn_url = f"mssql+pyodbc:///?odbc_connect={params}"
    
    # Sync engine for MSSQL parity
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
        # Fake async for MSSQL parity
        db = SessionLocal()
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()
else:
    # ── CLOUD ENGINE (Supabase / Postgres) ──
    engine = create_async_engine(
        settings.database_url,
        echo=settings.environment == "development",
        future=True,
        pool_size=20,
        max_overflow=10
    )
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
