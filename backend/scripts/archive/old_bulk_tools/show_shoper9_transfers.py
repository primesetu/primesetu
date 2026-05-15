import pyodbc

def show_transfers(database="SHOPER9X01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print("=" * 80)
        print(f"{'TYPE':<15} | {'DOC NO':<10} | {'DATE':<12} | {'VALUE':<10} | {'ITEMS'}")
        print("-" * 80)
        
        # Fetch Transfers
        query = """
            SELECT 
                CASE WHEN TrnType = 1100 THEN 'TRANSFER OUT' ELSE 'TRANSFER IN' END as TType,
                DocNo, 
                CONVERT(VARCHAR, DocDt, 105) as DDate, 
                NetDocValue,
                TrnCtrlNo,
                TrnType
            FROM StkTrnHdr
            WHERE TrnType IN (1100, 1200)
            ORDER BY DocDt DESC
        """
        cursor.execute(query)
        headers = cursor.fetchall()
        
        for h in headers:
            # Count items for each transfer
            cursor.execute("SELECT COUNT(*) FROM StkTrnDtls WHERE TrnCtrlNo = ? AND TrnType = ?", h.TrnCtrlNo, h.TrnType)
            item_count = cursor.fetchone()[0]
            
            print(f"{h.TType:<15} | {h.DocNo:<10} | {h.DDate:<12} | {float(h.NetDocValue):>10.2f} | {item_count} items")
            
        print("=" * 80)
        conn.close()
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    show_transfers()
