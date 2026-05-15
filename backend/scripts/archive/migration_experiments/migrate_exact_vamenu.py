
import pyodbc
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

load_dotenv(".env")
load_dotenv("backend/.env")

async def exact_schema_migration():
    # 1. Define exact schema from MSSQL
    schema = {
        "columns": [
            ("MnuNo", "INTEGER", "NOT NULL"),
            ("MenuOPt", "INTEGER", "NOT NULL"),
            ("MnuName", "VARCHAR(50)", "NULL"),
            ("MnuCap", "VARCHAR(50)", "NULL"),
            ("MnuPgm", "VARCHAR(50)", "NULL"),
            ("ExeName", "VARCHAR(50)", "NULL"),
            ("MnuWght", "INTEGER", "NULL"),
            ("AllowWhenTrnClosed", "BOOLEAN", "NOT NULL"),
            ("pgmopt", "INTEGER", "NULL"),
            ("DbInfo", "VARCHAR(16)", "NULL"),
            ("MenuIcon", "VARCHAR(50)", "NULL"),
            ("Menusep", "BOOLEAN", "NOT NULL"),
            ("MenuBold", "BOOLEAN", "NOT NULL"),
            ("MultiInstance", "INTEGER", "NULL")
        ]
    }

    # 2. PostgreSQL Setup
    pg_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    print("Connecting to PostgreSQL...")
    pg_conn = await asyncpg.connect(pg_url)

    try:
        print("Dropping existing shoper9.vamenu...")
        await pg_conn.execute("DROP TABLE IF EXISTS shoper9.vamenu CASCADE")

        print("Creating shoper9.vamenu with EXACT MSSQL schema...")
        cols_sql = ", ".join([f'"{name}" {dtype} {null_str}' for name, dtype, null_str in schema["columns"]])
        await pg_conn.execute(f"CREATE TABLE shoper9.vamenu ({cols_sql})")
        print("Table created successfully.")

        # 3. Connect to MSSQL and Fetch
        mssql_conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
        print("Connecting to MSSQL...")
        src_conn = pyodbc.connect(mssql_conn_str)
        src_cursor = src_conn.cursor()
        src_cursor.execute("SELECT * FROM vamenu")
        
        # We need to map columns by name to ensure correct order
        mssql_cols = [column[0] for column in src_cursor.description]
        rows = src_cursor.fetchall()
        print(f"Fetched {len(rows)} rows from MSSQL.")

        # 4. Migrate Data
        inserted_count = 0
        for row in rows:
            record = dict(zip(mssql_cols, row))
            
            # Prepare values (handle bit/bool conversion)
            final_record = {}
            for col_name, _, _ in schema["columns"]:
                val = record.get(col_name)
                # Bit in MSSQL comes as bool or int. PostgreSQL BOOLEAN wants bool.
                # If it's a bit column in MSSQL, pyodbc might return it as bool.
                final_record[col_name] = val

            keys = final_record.keys()
            cols_str = ", ".join([f'"{k}"' for k in keys])
            placeholders = ", ".join([f"${i+1}" for i in range(len(keys))])
            query = f'INSERT INTO shoper9.vamenu ({cols_str}) VALUES ({placeholders})'
            
            await pg_conn.execute(query, *final_record.values())
            inserted_count += 1

        print(f"Migration completed. {inserted_count} rows migrated with exact schema.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        await pg_conn.close()
        if 'src_conn' in locals():
            src_conn.close()

if __name__ == "__main__":
    asyncio.run(exact_schema_migration())
