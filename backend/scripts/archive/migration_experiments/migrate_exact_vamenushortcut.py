
import pyodbc
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("backend/.env")

async def exact_shortcut_migration():
    # 1. Define exact schema from MSSQL (Simplified for brevity, assuming similar structure)
    # I'll query it first
    mssql_conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    src_conn = pyodbc.connect(mssql_conn_str)
    src_cursor = src_conn.cursor()
    src_cursor.execute("SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'vamenushortcut'")
    mssql_cols_meta = src_cursor.fetchall()
    
    pg_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    pg_conn = await asyncpg.connect(pg_url)

    try:
        await pg_conn.execute("DROP TABLE IF EXISTS shoper9.vamenushortcut CASCADE")
        
        cols_def = []
        for row in mssql_cols_meta:
            name, dtype, nullable, max_len = row
            pg_type = "VARCHAR(255)"
            if dtype == 'int': pg_type = "INTEGER"
            elif dtype == 'varchar': pg_type = f"VARCHAR({max_len if max_len and max_len > 0 else 255})"
            elif dtype == 'bit': pg_type = "BOOLEAN"
            elif dtype == 'datetime': pg_type = "TIMESTAMP"
            
            null_str = "NULL" if nullable == "YES" else "NOT NULL"
            cols_def.append(f'"{name}" {pg_type} {null_str}')
        
        await pg_conn.execute(f"CREATE TABLE shoper9.vamenushortcut ({', '.join(cols_def)})")
        print("Table vamenushortcut created with exact schema.")

        src_cursor.execute("SELECT * FROM vamenushortcut")
        rows = src_cursor.fetchall()
        cols = [c[0] for c in src_cursor.description]
        
        for row in rows:
            record = dict(zip(cols, row))
            # Handle bits and datetimes
            for k, v in record.items():
                if isinstance(v, (int, bool)) and any(c[0] == k and c[1] == 'bit' for c in mssql_cols_meta):
                    record[k] = bool(v)
            
            keys = record.keys()
            cols_str = ", ".join([f'"{k}"' for k in keys])
            placeholders = ", ".join([f"${i+1}" for i in range(len(keys))])
            await pg_conn.execute(f'INSERT INTO shoper9.vamenushortcut ({cols_str}) VALUES ({placeholders})', *record.values())

        print(f"Migrated {len(rows)} shortcuts.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await pg_conn.close()
        src_conn.close()

if __name__ == "__main__":
    asyncio.run(exact_shortcut_migration())
