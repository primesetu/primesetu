import pyodbc

def show_top_10():
    # Credentials from .env
    conn_str = 'DRIVER={SQL Server};SERVER=AITDL;DATABASE=Shoper9X01;UID=sa;PWD=netmanthan@123;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        query = "SELECT TOP 10 Class1Cd, Class2Cd, Billable, SizeGroup, RetailMarkup, ProdTaxType FROM Class12Combo"
        cursor.execute(query)
        
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        
        print(f"\nTop 10 Records from Class12Combo (Database: Shoper9X01):\n")
        print(f"{' | '.join(columns)}")
        print("-" * 100)
        for row in rows:
            print(f"{' | '.join(str(val).ljust(15) for val in row)}")
        
        conn.close()
    except Exception as e:
        print(f"Error connecting to MSSQL: {e}")

if __name__ == "__main__":
    show_top_10()
