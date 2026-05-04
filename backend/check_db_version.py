import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=Shoper9CSW;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT TOP 5 ExeName, ExeVer, ExeMinor, ExeSubRel FROM VaVerTable ORDER BY ExeSubRel DESC")
for row in cursor.fetchall():
    print(row)
conn.close()
