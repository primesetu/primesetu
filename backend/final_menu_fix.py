import pyodbc

def final_fix():
    dbs = ['Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
    for db in dbs:
        print(f"Applying final fix to {db}...")
        try:
            conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;', autocommit=True)
            cursor = conn.cursor()
            
            # Shoper 9 VersionDtls mapping:
            # MiVersion = Minor (e.g. '1.904')
            # MjVersion = Major (e.g. '9')
            # PatchId = Build (e.g. '904')
            # SeriesId = Series (e.g. 'P')
            
            try:
                cursor.execute("UPDATE VersionDtls SET MiVersion = '1.904', PatchId = '904' WHERE MjVersion = '9'")
                print(f"  Updated VersionDtls in {db}")
            except Exception as e:
                print(f"  Error: {e}")
                
            conn.close()
        except Exception as e:
            print(f"  Conn Error: {e}")

final_fix()
