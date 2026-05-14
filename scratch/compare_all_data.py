import pyodbc
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

def compare_all_data():
    MSSQL_CONN_STR = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=localhost;DATABASE=SHOPER9X01;UID=sa;PWD=netmanthan@123;"
    PG_URL = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    ms_conn = pyodbc.connect(MSSQL_CONN_STR)
    ms_cursor = ms_conn.cursor()
    
    pg_conn = psycopg2.connect(PG_URL)
    pg_cursor = pg_conn.cursor()
    
    # Get all tables from PG shoper9 schema
    pg_cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'shoper9'")
    tables = [row[0] for row in pg_cursor.fetchall()]
    
    report = [
        "# SMRITI-OS: Full Data Parity Audit Report",
        f"Source: MSSQL (SHOPER9X01) | Target: PostgreSQL (shoper9 schema)",
        "",
        "| Table Name | MSSQL Count | PG Count | Status |",
        "| :--- | :--- | :--- | :--- |"
    ]
    
    mismatches = 0
    total_rows_ms = 0
    total_rows_pg = 0
    
    print("Auditing all tables... Please wait.")
    
    for table in sorted(tables):
        # Count MSSQL
        try:
            ms_cursor.execute(f"SELECT count(*) FROM [{table}]")
            ms_count = ms_cursor.fetchone()[0]
        except:
            ms_count = "ERR"
            
        # Count PG
        pg_cursor.execute(f"SELECT count(*) FROM shoper9.{table}")
        pg_count = pg_cursor.fetchone()[0]
        
        status = "✅ MATCH" if ms_count == pg_count else "❌ MISMATCH"
        if status == "❌ MISMATCH":
            mismatches += 1
            
        if isinstance(ms_count, int): total_rows_ms += ms_count
        total_rows_pg += pg_count
        
        report.append(f"| {table} | {ms_count} | {pg_count} | {status} |")

    report.insert(3, f"**Summary:** Total Tables: {len(tables)} | Mismatches: {mismatches}")
    report.insert(4, f"**Total Data Volume:** MSSQL: {total_rows_ms} rows | PostgreSQL: {total_rows_pg} rows")
    report.insert(5, "")

    with open('full_data_audit_report.md', 'w', encoding='utf-8') as f:
        f.write("\n".join(report))
    
    print(f"Audit Complete! Mismatches: {mismatches}")
    ms_conn.close()
    pg_conn.close()

if __name__ == "__main__":
    compare_all_data()
