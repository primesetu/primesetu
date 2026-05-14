import pyodbc
import os
from dotenv import load_dotenv

# MSSQL Connection String
MSSQL_RETAIL = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'

def inspect_mssql():
    try:
        conn = pyodbc.connect(MSSQL_RETAIL)
        cursor = conn.cursor()
        
        print("--- INSPECTING MSSQL TABLE: sysparam ---")
        for column in cursor.columns(table='sysparam'):
            print(f"Column: {column.column_name} ({column.type_name})")
            
        print("\n--- FETCHING 5 ROWS ---")
        cursor.execute("SELECT TOP 5 * FROM sysparam")
        rows = cursor.fetchall()
        columns = [column[0] for column in cursor.description]
        for row in rows:
            print(dict(zip(columns, row)))
            
        print("\n" + "="*30)
        print("--- INSPECTING MSSQL TABLE: stockmaster ---")
        for column in cursor.columns(table='stockmaster'):
            print(f"Column: {column.column_name} ({column.type_name})")
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    inspect_mssql()
