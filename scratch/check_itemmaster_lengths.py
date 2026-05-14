import pyodbc
import os
from dotenv import load_dotenv

load_dotenv("backend/.env")

def check_max_lengths():
    server = 'AITDL'
    database = 'Shoper9X01'
    user = os.getenv("MSSQL_USER")
    password = os.getenv("MSSQL_PASSWORD")
    conn_str = f'DRIVER={{SQL Server}};SERVER={server};DATABASE={database};UID={user};PWD={password};'
    
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    print("Checking Max Lengths in Shoper9X01.ItemMaster:")
    cursor.execute("SELECT MAX(LEN(StockNo)), MAX(LEN(ItemDesc)), MAX(LEN(Class1Cd)), MAX(LEN(Class2Cd)) FROM ItemMaster")
    res = cursor.fetchone()
    print(f"  StockNo: {res[0]}")
    print(f"  ItemDesc: {res[1]}")
    print(f"  Class1Cd: {res[2]}")
    print(f"  Class2Cd: {res[3]}")
    
    conn.close()

if __name__ == "__main__":
    check_max_lengths()
