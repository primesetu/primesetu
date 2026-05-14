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

# PostgreSQL Connection (Target) - Convert asyncpg URL to psycopg2 compatible URL
PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")

def migrate_data():
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
        # Shoper9 table names are lowercase in PG, but might be PascalCase in MSSQL
        # We search case-insensitively in MSSQL
        ms_cursor.execute(f"SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = ?", (table,))
        res = ms_cursor.fetchone()
        if not res:
            print(f"WARNING: Table {table} not found in MSSQL. Skipping.")
            continue
            
        ms_table_name = res.TABLE_NAME
        print(f"Migrating {ms_table_name} -> shoper9.{table}...")
        
        # Get column names in correct order from PG
        pg_cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_schema = 'shoper9' AND table_name = '{table}' ORDER BY ordinal_position")
        pg_cols = [row[0] for row in pg_cursor.fetchall()]
        
        # Note: If our model added an 'id' column, we shouldn't try to pull it from MSSQL
        # But our generator adds it only if no PK.
        # Let's filter out 'id' if it's the first column and not in MSSQL
        ms_cursor.execute(f"SELECT TOP 0 * FROM [{ms_table_name}]")
        ms_cols = [col[0].lower() for col in ms_cursor.description]
        
        final_cols = [c for c in pg_cols if c in ms_cols]
        col_str = ", ".join([f"[{c}]" for c in final_cols])
        pg_col_str = ", ".join(final_cols)
        
        # Fetch and Insert in batches
        ms_cursor.execute(f"SELECT {col_str} FROM [{ms_table_name}]")
        
        while True:
            rows = ms_cursor.fetchmany(5000)
            if not rows:
                break
                
            # Convert rows to list of tuples and handle NULL vacompcode
            data = []
            for row in rows:
                row_list = list(row)
                if 'vacompcode' in final_cols:
                    idx = final_cols.index('vacompcode')
                    if row_list[idx] is None or str(row_list[idx]).strip() == '':
                        row_list[idx] = '01' # Default for shopr9X01
                data.append(tuple(row_list))
            
            # Bulk Insert
            insert_query = f"INSERT INTO shoper9.{table} ({pg_col_str}) VALUES %s ON CONFLICT DO NOTHING"
            execute_values(pg_cursor, insert_query, data)
            pg_conn.commit()
            
        print(f"{ms_table_name} Migrated.")

    ms_conn.close()
    pg_conn.close()
    print("ALL DATA MIGRATED AS IS!")

if __name__ == "__main__":
    migrate_data()
