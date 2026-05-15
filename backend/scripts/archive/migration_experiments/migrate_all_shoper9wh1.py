
import pyodbc
import asyncio
import asyncpg
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("backend/.env")

def map_mssql_to_pg(dtype, max_len, precision, scale):
    dtype = dtype.lower()
    if dtype in ['int', 'smallint', 'tinyint']: return "INTEGER"
    if dtype == 'bigint': return "BIGINT"
    if dtype in ['varchar', 'nvarchar', 'char', 'nchar']:
        if max_len == -1 or max_len > 4000: return "TEXT"
        return f"VARCHAR({max_len if max_len and max_len > 0 else 255})"
    if dtype == 'bit': return "BOOLEAN"
    if dtype in ['datetime', 'smalldatetime']: return "TIMESTAMP"
    if dtype in ['decimal', 'numeric', 'money']:
        return f"NUMERIC({precision if precision else 18}, {scale if scale else 2})"
    if dtype in ['text', 'ntext']: return "TEXT"
    if dtype == 'uniqueidentifier': return "UUID"
    return "TEXT"

async def migrate_all_shoper9wh1():
    # 1. Connect to MSSQL
    mssql_conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    print(f"Connecting to MSSQL: {mssql_conn_str}")
    src_conn = pyodbc.connect(mssql_conn_str)
    src_cursor = src_conn.cursor()
    
    # 2. Connect to PostgreSQL
    pg_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    print("Connecting to PostgreSQL...")
    pg_conn = await asyncpg.connect(pg_url)
    
    # Ensure schema exists
    await pg_conn.execute("CREATE SCHEMA IF NOT EXISTS shoper9")

    # 3. Get all tables
    src_cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA = 'dbo'")
    tables = [row.TABLE_NAME for row in src_cursor.fetchall()]
    print(f"Found {len(tables)} tables to migrate.")

    for table_name in tables:
        # Check count first
        src_cursor.execute(f"SELECT COUNT(*) FROM [{table_name}]")
        count = src_cursor.fetchone()[0]
        
        if count > 50000:
            print(f"Skipping large table {table_name} ({count} rows) for manual phase.")
            continue
            
        print(f"\n--- Migrating {table_name} ({count} rows) ---")
        try:
            # 4. Get Column Info
            src_cursor.execute(f"""
                SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH, NUMERIC_PRECISION, NUMERIC_SCALE
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME = '{table_name}'
                ORDER BY ORDINAL_POSITION
            """)
            cols_meta = src_cursor.fetchall()
            
            # 5. Build Create Table SQL
            cols_def = []
            col_names = []
            for row in cols_meta:
                name, dtype, nullable, max_len, prec, scale = row
                col_names.append(name)
                pg_type = map_mssql_to_pg(dtype, max_len, prec, scale)
                null_str = "NULL" if nullable == "YES" else "NOT NULL"
                cols_def.append(f'"{name}" {pg_type} {null_str}')
            
            # 6. Recreate table
            await pg_conn.execute(f'DROP TABLE IF EXISTS shoper9."{table_name}" CASCADE')
            await pg_conn.execute(f'CREATE TABLE shoper9."{table_name}" ({", ".join(cols_def)})')
            
            # 7. Fetch and Insert Data
            src_cursor.execute(f"SELECT * FROM [{table_name}]")
            rows = src_cursor.fetchall()
            
            if not rows:
                continue

            placeholders = ", ".join([f"${i+1}" for i in range(len(col_names))])
            cols_str = ", ".join([f'"{c}"' for c in col_names])
            insert_query = f'INSERT INTO shoper9."{table_name}" ({cols_str}) VALUES ({placeholders})'
            
            records_to_insert = []
            for row in rows:
                clean_row = []
                for i, val in enumerate(row):
                    col_meta = cols_meta[i]
                    if col_meta[1].lower() == 'bit':
                        clean_row.append(bool(val) if val is not None else None)
                    elif isinstance(val, datetime):
                        clean_row.append(val)
                    elif isinstance(val, bytes):
                        clean_row.append(val.hex())
                    else:
                        clean_row.append(val)
                records_to_insert.append(tuple(clean_row))
            
            # Batch insert
            batch_size = 1000
            for i in range(0, len(records_to_insert), batch_size):
                batch = records_to_insert[i:i+batch_size]
                await pg_conn.executemany(insert_query, batch)
                
            print(f"Migrated {len(records_to_insert)} rows to shoper9.\"{table_name}\".")

        except Exception as e:
            print(f"Error migrating {table_name}: {e}")

    await pg_conn.close()
    src_conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_all_shoper9wh1())
