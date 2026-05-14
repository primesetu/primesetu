import pyodbc

# Correct Connection string
server = 'AITDL'
database = 'Shoper9X01'
username = 'sa'
password = 'netmanthan@123'
driver = '{SQL Server}'

conn_str = f'DRIVER={driver};SERVER={server};DATABASE={database};UID={username};PWD={password}'

def check_store_data():
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        print(f"--- Connected to Database: {database} ---")
        
        # 1. SysParam
        print("\n[SysParam - Top 5]")
        cursor.execute("SELECT TOP 5 ParamCode, Txt, Boolean FROM SysParam")
        for row in cursor.fetchall(): print(row)
        
        # 2. Class12Combo
        print("\n[Class12Combo - Check]")
        cursor.execute("SELECT TOP 5 * FROM Class12Combo")
        rows = cursor.fetchall()
        if not rows: print("Table exists but is EMPTY.")
        else:
            for row in rows: print(row)
            
        # 3. ItemMaster
        print("\n[ItemMaster - Sample]")
        cursor.execute("SELECT TOP 1 StockNo, ItemDesc, Class1Cd, Class2Cd FROM ItemMaster")
        print(cursor.fetchone())
        
        # 4. GenLookUp
        print("\n[GenLookUp - Sample Types]")
        cursor.execute("SELECT DISTINCT TOP 10 RecType FROM GenLookUp")
        for row in cursor.fetchall(): print(row)
        
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    check_store_data()
