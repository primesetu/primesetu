import pyodbc
conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;DATABASE=Shoper9CSW;Trusted_Connection=yes;')
cursor = conn.cursor()
cursor.execute("SELECT * FROM sysobjects WHERE name = 'xtmptblsingleitemvalidpromodtls2100super'")
print("Table exists:", cursor.fetchall())
