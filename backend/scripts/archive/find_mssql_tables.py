from mssql_connect import get_conn

def find():
    conn = get_conn()
    cur = conn.cursor()
    patterns = ['%barcode%', '%stock%', '%look%', '%cust%', '%combo%']
    for p in patterns:
        cur.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE ?", p)
        print(f"{p}: {[r[0] for r in cur.fetchall()]}")
    conn.close()

if __name__ == "__main__":
    find()
