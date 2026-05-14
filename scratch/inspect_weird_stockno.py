import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def inspect_weird_stockno():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("Searching for SKUs with potential GS1/control characters:")
    cursor.execute("SELECT TOP 10 StockNo FROM ItemMaster WHERE StockNo LIKE ']%'")
    for row in cursor.fetchall():
        s = row[0]
        print(f"StockNo: '{s}' | Length: {len(s)} | Hex: {s.encode('utf-8').hex()}")
    
    conn.close()

if __name__ == "__main__":
    inspect_weird_stockno()
