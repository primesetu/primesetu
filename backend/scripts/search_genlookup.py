import pyodbc

conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
conn = pyodbc.connect(conn_str)
cursor = conn.cursor()

cursor.execute("SELECT Code, Descr FROM GenLookUp WHERE Recid=0 AND (Descr LIKE '%Anal%' OR Code BETWEEN '60' AND '100')")
for row in cursor.fetchall():
    print(row)

conn.close()
