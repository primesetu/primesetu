
import pyodbc
import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# Load env from root or backend
load_dotenv(".env")
load_dotenv("backend/.env")

async def migrate_vamenushortcut():
    # 1. Connect to MSSQL
    mssql_conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=tspsysdb9;Trusted_Connection=yes;'
    print(f"Connecting to MSSQL: {mssql_conn_str}")
    try:
        src_conn = pyodbc.connect(mssql_conn_str)
        src_cursor = src_conn.cursor()
        src_cursor.execute("SELECT * FROM vamenushortcut")
        columns = [column[0].lower() for column in src_cursor.description]
        rows = src_cursor.fetchall()
        print(f"Fetched {len(rows)} shortcuts from MSSQL.")
    except Exception as e:
        print(f"MSSQL Error: {e}")
        return

    # 2. Connect to PostgreSQL
    pg_url = os.getenv("DATABASE_URL")
    if not pg_url:
        print("DATABASE_URL not found in env.")
        return
    
    pg_url = pg_url.replace("postgresql+asyncpg://", "postgresql://")
    
    print("Connecting to PostgreSQL...")
    try:
        pg_conn = await asyncpg.connect(pg_url)
        
        # 3. Clear existing data
        print("Truncating shoper9.vamenushortcut...")
        await pg_conn.execute("TRUNCATE shoper9.vamenushortcut CASCADE")

        # 4. Insert data
        inserted_count = 0
        from datetime import datetime
        
        for row in rows:
            record = dict(zip(columns, row))
            
            # Type conversion for PostgreSQL
            clean_record = {}
            for k, v in record.items():
                if isinstance(v, datetime):
                    clean_record[k] = v.isoformat()
                else:
                    clean_record[k] = v

            # Prepare query
            keys = clean_record.keys()
            cols_str = ", ".join([f'"{k}"' for k in keys])
            placeholders = ", ".join([f"${i+1}" for i in range(len(keys))])
            
            query = f'INSERT INTO shoper9.vamenushortcut ({cols_str}) VALUES ({placeholders})'
            
            try:
                await pg_conn.execute(query, *clean_record.values())
                inserted_count += 1
            except Exception as e:
                print(f"Error inserting row: {e}")
        
        print(f"Successfully migrated {inserted_count} shortcuts to PostgreSQL.")
        await pg_conn.close()
    except Exception as e:
        print(f"PostgreSQL Error: {e}")
    finally:
        src_conn.close()

if __name__ == "__main__":
    asyncio.run(migrate_vamenushortcut())
