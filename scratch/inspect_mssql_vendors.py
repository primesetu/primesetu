import pyodbc
import os
from dotenv import load_dotenv

# MSSQL Connection String
MSSQL_RETAIL = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'

def inspect_vendors():
    try:
        conn = pyodbc.connect(MSSQL_RETAIL)
        cursor = conn.cursor()
        
        print("--- INSPECTING MSSQL TABLE: vendors ---")
        for column in cursor.columns(table='vendors'):
            print(f"Column: {column.column_name} ({column.type_name})")
            
        print("\n--- FETCHING 5 ROWS ---")
        cursor.execute("SELECT TOP 5 * FROM vendors")
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        for row in rows:
            print(dict(zip(columns, row)))
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_vendors()
