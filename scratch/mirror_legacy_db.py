import pyodbc
import os
import asyncio
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from decimal import Decimal
from datetime import datetime

load_dotenv("backend/.env")

# MSSQL Connection
MSSQL_CONN_STR = f'DRIVER={{SQL Server}};SERVER=AITDL;DATABASE=Shoper9X01;UID={os.getenv("MSSQL_USER")};PWD={os.getenv("MSSQL_PASSWORD")};'

# Postgres Connection
PG_URL = "postgresql+asyncpg://postgres:MSba108682%21%40@localhost:5434/smriti_local"

def map_type(mssql_type, length, precision, scale):
    mssql_type = mssql_type.lower()
    if 'int' in mssql_type or 'bit' in mssql_type:
        return 'INTEGER'
    elif 'date' in mssql_type or 'time' in mssql_type:
        return 'TIMESTAMP'
    elif 'money' in mssql_type or 'decimal' in mssql_type or 'numeric' in mssql_type:
        return 'NUMERIC'
    elif 'float' in mssql_type or 'real' in mssql_type:
        return 'DOUBLE PRECISION'
    elif 'image' in mssql_type or 'binary' in mssql_type:
        return 'BYTEA'
    else:
        return 'TEXT'

async def mirror_database():
    engine = create_async_engine(PG_URL)
    
    # Create schema
    async with engine.begin() as conn:
        await conn.execute(text("CREATE SCHEMA IF NOT EXISTS legacy;"))

    try:
        mssql_conn = pyodbc.connect(MSSQL_CONN_STR)
        cursor = mssql_conn.cursor()
        
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
        tables = [r[0] for r in cursor.fetchall()]
        print(f"Found {len(tables)} tables to mirror.")
        
        for table_name in tables:
            print(f"\nProcessing table: {table_name}")
            
            # 1. Get Schema
            cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name}'")
            columns = cursor.fetchall()
            
            pg_cols = []
            col_names = []
            for col in columns:
                col_name = col.COLUMN_NAME
                pg_type = map_type(col.DATA_TYPE, col.CHARACTER_MAXIMUM_LENGTH, col.NUMERIC_PRECISION, col.NUMERIC_SCALE)
                pg_cols.append(f'"{col_name}" {pg_type}')
                col_names.append(col_name)
                
            create_stmt = f"CREATE TABLE IF NOT EXISTS legacy.\"{table_name}\" ({', '.join(pg_cols)});"
            
            async with engine.begin() as pg_conn:
                # Drop table if exists to start fresh, or just create if not exists
                # Since we want to ensure full sync, let's drop it first for a clean copy
                await pg_conn.execute(text(f"DROP TABLE IF EXISTS legacy.\"{table_name}\";"))
                await pg_conn.execute(text(create_stmt))
                
            # 2. Fetch Data
            try:
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()
                print(f"Fetched {len(rows)} rows from {table_name}")
                
                if not rows:
                    continue
                    
                # 3. Insert Data
                insert_stmt = f"INSERT INTO legacy.\"{table_name}\" (\"{('\", \"').join(col_names)}\") VALUES ({', '.join([':' + c for c in col_names])})"
                
                batch_size = 1000
                total_inserted = 0
                
                async with engine.connect() as pg_conn:
                    for i in range(0, len(rows), batch_size):
                        batch = rows[i:i+batch_size]
                        pg_batch = []
                        for row in batch:
                            row_dict = {}
                            for idx, c_name in enumerate(col_names):
                                val = row[idx]
                                # Handle binary or incompatible types if needed.
                                # pyodbc handles most standard conversions well.
                                if isinstance(val, memoryview):
                                    val = val.tobytes()
                                row_dict[c_name] = val
                            pg_batch.append(row_dict)
                            
                        async with pg_conn.begin():
                            await pg_conn.execute(text(insert_stmt), pg_batch)
                        total_inserted += len(pg_batch)
                        print(f"  Inserted {total_inserted}/{len(rows)}...")
                        
            except Exception as e:
                print(f"Error migrating data for {table_name}: {e}")
                
    except Exception as e:
        print(f"Critical error: {e}")
    finally:
        await engine.dispose()
        mssql_conn.close()

if __name__ == "__main__":
    asyncio.run(mirror_database())
