import pyodbc

def diag_menu():
    db = 'Shoper9CSW'
    print(f"Diagnosing {db}.VAMENU...")
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;')
        cursor = conn.cursor()
        
        # Check a few rows in VAMENU to see if version info is stored there
        cursor.execute("SELECT TOP 20 * FROM VAMENU")
        cols = [column[0] for column in cursor.description]
        print(f"Columns: {cols}")
        for row in cursor.fetchall():
            print(row)
            
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

diag_menu()
