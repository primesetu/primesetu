import pyodbc
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def final_audit():
    MSSQL_CONN_STR = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=SHOPER9X01;UID=sa;PWD=netmanthan@123;"
    PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    ms_conn = pyodbc.connect(MSSQL_CONN_STR)
    ms_cursor = ms_conn.cursor()
    
    pg_conn = psycopg2.connect(PG_URL)
    pg_cursor = pg_conn.cursor()
    
    # Get MSSQL Tables
    ms_cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
    ms_tables = set(row.TABLE_NAME.lower() for row in ms_cursor.fetchall())
    
    # Get PG Tables
    pg_cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'shoper9'")
    pg_tables = set(row[0].lower() for row in pg_cursor.fetchall())
    
    missing = ms_tables - pg_tables
    
    print("-" * 50)
    print(f"MSSQL Total Tables (SHOPER9X01): {len(ms_tables)}")
    print(f"PostgreSQL Tables (shoper9 schema): {len(pg_tables)}")
    print("-" * 50)
    
    if not missing:
        print("✅ SUCCESS: Every single table from MSSQL is now in PostgreSQL!")
    else:
        print(f"⚠️ Missing Tables: {missing}")
        
    # Sample Row Counts
    sample_tables = ['itemmaster', 'stockmaster', 'customers', 'sysparam', 'genlookup']
    print("\n[Row Count Verification]")
    for table in sample_tables:
        ms_cursor.execute(f"SELECT count(*) FROM [{table}]")
        ms_count = ms_cursor.fetchone()[0]
        
        pg_cursor.execute(f"SELECT count(*) FROM shoper9.{table}")
        pg_count = pg_cursor.fetchone()[0]
        
        status = "✅ MATCH" if ms_count == pg_count else "❌ MISMATCH"
        print(f"{table.capitalize():<15} | MSSQL: {ms_count:<6} | PG: {pg_count:<6} | {status}")

    ms_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    final_audit()
