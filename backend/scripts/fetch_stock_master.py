import pyodbc

def show_stock_master():
    conn_str = 'DRIVER={SQL Server};SERVER=.;DATABASE=SHOPER9WH1;Trusted_Connection=yes;'
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()
    
    cursor.execute("SELECT TOP 5 * FROM StockMaster")
    columns = [column[0] for column in cursor.description]
    
    print("--- SHOPER9WH1 (StockMaster) SCHEMA ---")
    for i, col in enumerate(columns):
        print(f"{i+1}. {col}")
        
    print("\n--- SHOPER9WH1 (StockMaster) TOP 5 ROWS ---")
    rows = cursor.fetchall()
    for r in rows:
        row_dict = dict(zip(columns, r))
        print(f"StockNo: {row_dict.get('StockNo')} | CurBalQty: {row_dict.get('CurBalQty')} | PrevBalQty: {row_dict.get('PrevBalQty')} | MinQty: {row_dict.get('MinQty')} | MaxQty: {row_dict.get('MaxQty')}")
        
    conn.close()

if __name__ == '__main__':
    show_stock_master()
