import pyodbc

def check_db(db_name):
    print(f"\n--- Checking Database: {db_name} ---")
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db_name};Trusted_Connection=yes;')
        cursor = conn.cursor()
        
        # Check for any version table
        cursor.execute("SELECT name FROM sysobjects WHERE name LIKE '%Ver%' AND type='U'")
        tables = [row[0] for row in cursor.fetchall()]
        print(f"Version tables found: {tables}")
        
        for table in tables:
            try:
                cursor.execute(f"SELECT TOP 5 * FROM {table}")
                rows = cursor.fetchall()
                print(f"\nData in {table}:")
                for row in rows:
                    print(row)
            except Exception as e:
                print(f"Could not read {table}: {e}")
                
        conn.close()
    except Exception as e:
        print(f"Error connecting to {db_name}: {e}")

check_db('Shoper9CSW')
check_db('SHOPER9WH1')
check_db('SHOPER9X01')
check_db('tspsysdb9')
