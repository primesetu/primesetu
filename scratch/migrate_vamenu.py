import pyodbc
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

load_dotenv()

# MSSQL Connection (Source: tspsysdb9)
MSSQL_CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost;"
    "DATABASE=tspsysdb9;"
    "UID=sa;"
    "PWD=netmanthan@123;"
)

# PostgreSQL Connection (Target: shoper9 schema)
PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

def migrate_system_tables():
    ms_conn = pyodbc.connect(MSSQL_CONN_STR)
    ms_cursor = ms_conn.cursor()
    
    pg_conn = psycopg2.connect(PG_URL)
    pg_cursor = pg_conn.cursor()
    
    tables_to_migrate = ['vaMenu', 'vaMenuShortcut']
    
    for table in tables_to_migrate:
        print(f"Migrating {table} from tspsysdb9...")
        
        # 1. Fetch metadata
        ms_cursor.execute(f"SELECT TOP 0 * FROM {table}")
        cols = [col[0] for col in ms_cursor.description]
        col_str = ", ".join([f"[{c}]" for c in cols])
        pg_col_str = ", ".join([c.lower() for c in cols])
        
        # 2. Recreate table in PG (if not exists)
        # We'll use simple types for system tables
        create_cols = []
        for col in ms_cursor.description:
            name = col[0].lower()
            typ = "VARCHAR"
            if col[1] == int: typ = "INTEGER"
            elif col[1] == bool: typ = "BOOLEAN"
            create_cols.append(f"{name} {typ}")
            
        pg_cursor.execute(f"DROP TABLE IF EXISTS shoper9.{table.lower()} CASCADE")
        pg_cursor.execute(f"CREATE TABLE shoper9.{table.lower()} ({', '.join(create_cols)})")
        
        # 3. Fetch data
        ms_cursor.execute(f"SELECT {col_str} FROM {table}")
        rows = ms_cursor.fetchall()
        data = [tuple(row) for row in rows]
        
        # 4. Insert data
        insert_query = f"INSERT INTO shoper9.{table.lower()} ({pg_col_str}) VALUES %s"
        execute_values(pg_cursor, insert_query, data)
        pg_conn.commit()
        print(f"DONE: {table} ({len(data)} rows)")

    ms_conn.close()
    pg_conn.close()
    print("SYSTEM TABLES MIGRATED SUCCESSFULLY!")

if __name__ == "__main__":
    migrate_system_tables()
