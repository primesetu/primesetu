import pyodbc

def show_tax_catalogue(database="SHOPER9X01"):
    conn_str = f'DRIVER={{SQL Server}};SERVER=.;DATABASE={database};Trusted_Connection=yes;'
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        print("=" * 100)
        print(f"{'TAX CATEGORY':<25} | {'COMPONENT 1':<15} | {'RATE 1':<8} | {'COMPONENT 2':<15} | {'RATE 2':<8}")
        print("-" * 100)
        
        query = """
            SELECT 
                TaxDesc,
                T1Name, T1Rate,
                T2Name, T2Rate,
                T1Type, T1DerivedFormula
            FROM SalesTaxCat
        """
        cursor.execute(query)
        rows = cursor.fetchall()
        
        for r in rows:
            desc = str(r.TaxDesc).strip()
            t1_name = str(r.T1Name).strip() if r.T1Name else ""
            t1_rate = f"{float(r.T1Rate):.2f}%" if r.T1Rate and r.T1Type != 'D' else "SLAB"
            t2_name = str(r.T2Name).strip() if r.T2Name else ""
            t2_rate = f"{float(r.T2Rate):.2f}%" if r.T2Rate and r.T1Type != 'D' else "SLAB"
            
            print(f"{desc:<25} | {t1_name:<15} | {t1_rate:<8} | {t2_name:<15} | {t2_rate:<8}")
            
            if r.T1Type == 'D':
                print(f"   [SLAB LOGIC]: {r.T1DerivedFormula}")
            
        print("=" * 100)
        conn.close()
    except Exception as e:
        print(f"Tax Error: {e}")

if __name__ == "__main__":
    show_tax_catalogue()
