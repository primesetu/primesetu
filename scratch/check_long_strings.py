import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def check_long_stockno():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("Checking for StockNo longer than 50 characters...")
    cursor.execute("SELECT StockNo FROM ItemMaster WHERE LEN(StockNo) > 50")
    rows = cursor.fetchall()
    if not rows:
        print("No StockNo found longer than 50 characters.")
    else:
        for row in rows:
            print(f"Long StockNo found: {row[0]} (Length: {len(row[0])})")
    
    print("\nChecking for ItemDesc longer than 255 characters...")
    cursor.execute("SELECT ItemDesc FROM ItemMaster WHERE LEN(ItemDesc) > 255")
    rows = cursor.fetchall()
    if not rows:
        print("No ItemDesc found longer than 255 characters.")
    else:
        for row in rows:
            print(f"Long ItemDesc found: {row[0]} (Length: {len(row[0])})")
            
    conn.close()

if __name__ == "__main__":
    check_long_stockno()
