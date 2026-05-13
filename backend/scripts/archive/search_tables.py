import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=Shoper9CSW;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT name FROM sysobjects WHERE name LIKE '%Ver%'")
for row in cursor.fetchall():
    print(row)
conn.close()
