import pyodbc

dbs = ['Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
conn_str = 'DRIVER={SQL Server};SERVER=.;Trusted_Connection=yes;DATABASE='

for db in dbs:
    try:
        conn = pyodbc.connect(conn_str + db)
        cursor = conn.cursor()
        cursor.execute("UPDATE SysParam SET Boolean = 0 WHERE ParamCode = 'ApplyNewSalesPromotion'")
        conn.commit()
        print(f"Disabled Promo Validation in {db}")
    except Exception as e:
        print(f"Failed in {db}: {e}")
