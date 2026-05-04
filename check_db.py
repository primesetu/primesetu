import pyodbc
try:
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=AITDL;UID=sa;PWD=netmanthan@123;DATABASE=master')
    cursor = conn.cursor()
    cursor.execute('SELECT name FROM sys.databases WHERE name=?', 'SMRITISETU10256789')
    print('Database exists:', bool(cursor.fetchone()))
    conn.close()

    conn2 = pyodbc.connect('DRIVER={SQL Server};SERVER=AITDL;UID=sa;PWD=netmanthan@123;DATABASE=SMRITISETU10256789')
    cursor2 = conn2.cursor()
    cursor2.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE'")
    rows = cursor2.fetchall()
    print('Total tables in new DB:', len(rows))
    conn2.close()
except Exception as e:
    print('Error:', e)
