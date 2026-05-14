import pyodbc
import psycopg2
from psycopg2.extras import execute_values
import os
from dotenv import load_dotenv

load_dotenv()

# MSSQL Connection (Source)
MSSQL_CONN_STR = (
    "DRIVER={ODBC Driver 17 for SQL Server};"
    "SERVER=localhost;"
    "DATABASE=SHOPER9X01;"
    "UID=sa;"
    "PWD=netmanthan@123;"
)

# PostgreSQL Connection (Target)
PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

def migrate_data_pure():
    ms_conn = pyodbc.connect(MSSQL_CONN_STR)
    ms_cursor = ms_conn.cursor()
    
    pg_conn = psycopg2.connect(PG_URL)
    pg_cursor = pg_conn.cursor()
    
    # Get all tables in shoper9 schema
    pg_cursor.execute("""
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'shoper9'
    """)
    tables = [row[0] for row in pg_cursor.fetchall()]
    
    for table in sorted(tables):
        ms_cursor.execute(f"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?", (table,))
        res = ms_cursor.fetchone()
        if not res:
            continue
            
        ms_table_name = res.TABLE_NAME
        print(f"Migrating {ms_table_name} (PURE AS-IS)...")
        
        # Get column names in correct order from PG, excluding our synthetic smriti_id
        pg_cursor.execute(f"""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'shoper9' 
            AND table_name = '{table}' 
            AND column_name != 'smriti_id'
            ORDER BY ordinal_position
        """)
        pg_cols = [row[0] for row in pg_cursor.fetchall()]
        
        # Get MSSQL columns
        ms_cursor.execute(f"SELECT TOP 0 * FROM [{ms_table_name}]")
        ms_cols = [col[0].lower() for col in ms_cursor.description]
        
        # Only migrate columns that exist in both
        final_cols = [c for c in pg_cols if c in ms_cols]
        col_str = ", ".join([f"[{c}]" for c in final_cols])
        pg_col_str = ", ".join(final_cols)
        
        # Fetch and Insert
        ms_cursor.execute(f"SELECT {col_str} FROM [{ms_table_name}]")
        
        while True:
            rows = ms_cursor.fetchmany(10000)
            if not rows:
                break
                
            data = [tuple(row) for row in rows]
            
            # Pure insert - no conflict handling (should be identical to MSSQL)
            insert_query = f"INSERT INTO shoper9.{table} ({pg_col_str}) VALUES %s"
            execute_values(pg_cursor, insert_query, data)
            pg_conn.commit()
            
        print(f"DONE: {ms_table_name}")

    ms_conn.close()
    pg_conn.close()
    print("ALL DATA MIGRATED IN PURE LEGACY FORMAT!")

if __name__ == "__main__":
    migrate_data_pure()
