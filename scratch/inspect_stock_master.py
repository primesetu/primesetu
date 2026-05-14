import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def inspect_table(table_name):
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print(f"--- Columns in {table_name} ---")
    cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name}'")
    rows = cursor.fetchall()
    for row in rows:
        print(f"{row[0]}: {row[1]} ({row[2]})")
            
    conn.close()

if __name__ == "__main__":
    inspect_table("StockMaster")
    print("\n")
    inspect_table("StkTrnHdr")
    print("\n")
    inspect_table("StkTrnDtls")
