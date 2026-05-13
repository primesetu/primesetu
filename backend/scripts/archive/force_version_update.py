import pyodbc

# Target Version
TARGET_REL = '904'

def update_db(db_name):
    print(f"\n--- Updating Versions in: {db_name} ---")
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;DATABASE={db_name};Trusted_Connection=yes;', autocommit=True)
        cursor = conn.cursor()
        
        # Update VaVerTable if exists
        try:
            cursor.execute(f"UPDATE VaVerTable SET ExeSubRel = '{TARGET_REL}'")
            print(f"Updated VaVerTable in {db_name}")
        except:
            pass
            
        # Update VersionDtls if exists
        try:
            cursor.execute(f"UPDATE VersionDtls SET ExeSubRel = '{TARGET_REL}'")
            # In VersionDtls, 'P901xxx' format is sometimes used
            cursor.execute(f"UPDATE VersionDtls SET RelId = 'P901{TARGET_REL}' WHERE RelId LIKE 'P%'")
            print(f"Updated VersionDtls in {db_name}")
        except:
            pass
            
        conn.close()
    except Exception as e:
        print(f"Error updating {db_name}: {e}")

dbs = ['tspsysdb9', 'Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
for db in dbs:
    update_db(db)
