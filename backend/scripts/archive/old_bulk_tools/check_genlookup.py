import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

cursor.execute("SELECT TOP 20 * FROM GenLookUp WHERE Code IN ('ASST', 'LADY')")
for row in cursor.fetchall():
    print(row)

conn.close()
