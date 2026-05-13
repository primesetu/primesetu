import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=Shoper9CSW;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT Id, Descr, ParamCode, Boolean, Intg, Txt FROM SysParam WHERE Descr LIKE '%promo%' OR ParamCode LIKE '%promo%'")
rows = cursor.fetchall()
for row in rows:
    print(row)
