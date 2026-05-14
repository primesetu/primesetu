import pyodbc
try:
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=AITDL;UID=sa;PWD=netmanthan@123;DATABASE=SMRITISETU10256789')
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM AcceptDisplayDtls")
    count = cursor.fetchone()[0]
    print(f'Total rows in AcceptDisplayDtls: {count}')
    
    if count > 0:
        cursor.execute("SELECT TOP 10 * FROM AcceptDisplayDtls")
        rows = cursor.fetchall()
        for row in rows:
            print(row)
    else:
        print("Table is empty.")
    conn.close()
except Exception as e:
    print('Error:', e)
