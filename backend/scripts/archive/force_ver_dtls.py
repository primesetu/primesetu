import pyodbc

def force_update():
    dbs = ['Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
    for db in dbs:
        print(f"Force updating {db}...")
        try:
            conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db};Trusted_Connection=yes;', autocommit=True)
            cursor = conn.cursor()
            
            # Update VersionDtls with index-based columns if names are tricky
            # According to diag: Col 2 = Major, Col 3 = Minor, Col 5 = RelId, Col 7 = VerSrl
            # Let's try to update by column name first
            try:
                cursor.execute("UPDATE VersionDtls SET RelId = 'P901904', Minor = '1.904', VerSrl = 904")
                print(f"  Updated VersionDtls in {db}")
            except Exception as e:
                print(f"  Failed update in {db}: {e}")
                
            conn.close()
        except Exception as e:
            print(f"  Error: {e}")

force_update()
