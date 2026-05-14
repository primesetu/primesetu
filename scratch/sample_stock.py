import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def sample_stock():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("--- StockMaster Samples ---")
    cursor.execute("SELECT TOP 5 StockNo, LocnId, CurBalQty FROM StockMaster")
    for r in cursor.fetchall():
        print(f"SKU: {r.StockNo}, Loc: {r.LocnId}, Qty: {r.CurBalQty}")
            
    conn.close()

if __name__ == "__main__":
    sample_stock()
