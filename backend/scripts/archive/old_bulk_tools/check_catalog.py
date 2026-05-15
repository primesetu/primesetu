import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

cursor.execute("SELECT FldName, FldCaption, OthValue1 FROM CatalogSettings WHERE FldName LIKE 'AnalCode%'")
for row in cursor.fetchall():
    print(row)

conn.close()
