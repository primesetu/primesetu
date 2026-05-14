import pyodbc

conn = pyodbc.connect('DRIVER={SQL Server};SERVER=AITDL;DATABASE=Shoper9X01;UID=sa;PWD=netmanthan@123')
cursor = conn.cursor()

query = """
SELECT ParamCode, Descr, Txt, Boolean, Intg 
FROM SysParam 
WHERE ParamCode LIKE '%Class%' 
   OR ParamCode LIKE '%Tax%' 
   OR ParamCode LIKE '%Price%' 
   OR ParamCode LIKE '%Stock%'
   OR ParamCode LIKE '%Item%'
"""

cursor.execute(query)
print(f"{'ParamCode':<35} | {'Txt':<20} | {'Bool':<5} | {'Intg':<5} | {'Description'}")
print("-" * 100)
for row in cursor.fetchall():
    print(f"{str(row[0]):<35} | {str(row[2]):<20} | {str(row[3]):<5} | {str(row[4]):<5} | {row[1]}")

conn.close()
