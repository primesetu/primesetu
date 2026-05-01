import pyodbc
import os
import re

def get_mssql_tables():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'")
    tables = {row.TABLE_NAME.lower() for row in cursor.fetchall()}
    conn.close()
    return tables

def get_ported_tables():
    s9_dir = r"d:\IMP\GitHub\primesetu\docs\reference\Shoper9\ini"
    unique_tables = set()
    for filename in os.listdir(s9_dir):
        if filename.endswith(".S9Q"):
            with open(os.path.join(s9_dir, filename), 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
                matches = re.findall(r'CREATE TABLE\s+(?:\[dbo\]\.)?\[?(\w+)\]?', content, re.IGNORECASE)
                for m in matches:
                    unique_tables.add(m.lower())
    return unique_tables

def compare_tables():
    mssql_tables = get_mssql_tables()
    ported_tables = get_ported_tables()
    
    common = mssql_tables.intersection(ported_tables)
    only_mssql = mssql_tables - ported_tables
    only_ported = ported_tables - mssql_tables
    
    print("--- TABLE COMPARISON REPORT ---")
    print(f"Tables in Live MSSQL (SHOPER9WH1): {len(mssql_tables)}")
    print(f"Tables Ported from Reference Docs: {len(ported_tables)}")
    print(f"Common Tables (Active & Ported):   {len(common)}")
    print(f"Tables in MSSQL but NOT in Ported: {len(only_mssql)}")
    print(f"Tables in Ported but NOT in MSSQL: {len(only_ported)}")
    
    if only_mssql:
        print("\n--- SAMPLE MISSING FROM PORTED (Top 10) ---")
        for t in sorted(list(only_mssql))[:10]:
            print(f"- {t}")
            
    if only_ported:
        print("\n--- SAMPLE REFERENCE ONLY (Top 10) ---")
        for t in sorted(list(only_ported))[:10]:
            print(f"- {t}")

if __name__ == '__main__':
    compare_tables()
