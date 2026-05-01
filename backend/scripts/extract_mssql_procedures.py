import pyodbc
import os

def extract_procedures(db_name, output_dir):
    # Standard Shoper 9 Connection String (Trusted)
    conn_str = f"DRIVER={{SQL Server}};SERVER=.;DATABASE={db_name};Trusted_Connection=yes;"
    print(f"--- DATABASE: {db_name} ---")
    
    try:
        conn = pyodbc.connect(conn_str)
        cursor = conn.cursor()
        
        # Query: sys.sql_modules contains the full text of the procedure
        query = """
        SELECT 
            o.name,
            m.definition
        FROM sys.sql_modules m
        JOIN sys.objects o ON m.object_id = o.object_id
        WHERE o.type = 'P'
        ORDER BY o.name
        """
        
        cursor.execute(query)
        rows = cursor.fetchall()
        
        if not os.path.exists(output_dir):
            os.makedirs(output_dir, exist_ok=True)
            
        print(f"Found {len(rows)} procedures. Writing to {output_dir}...")
        
        for name, definition in rows:
            # Handle potential None definitions (e.g. encrypted)
            if not definition:
                print(f"  [!] Skipped {name} (definition is NULL or Encrypted)")
                continue
                
            # Sanitize filename (though SP names are usually safe)
            safe_name = "".join([c for c in name if c.isalnum() or c in (' ', '.', '_')]).rstrip()
            file_path = os.path.join(output_dir, f"{safe_name}.sql")
            
            try:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(definition)
            except Exception as fe:
                print(f"  [!] Failed to write {name}: {fe}")
                
        conn.close()
        print(f"Extraction complete for {db_name}.\n")
        
    except Exception as e:
        print(f"Critical Error connecting to {db_name}: {e}\n")

if __name__ == "__main__":
    # Base path for legacy extraction
    BASE_PATH = "d:/IMP/GitHub/primesetu/backend/legacy_data/procedures"
    
    # 1. Shoper 9 Retail DB
    extract_procedures("Shoper9x01", f"{BASE_PATH}/Shoper9x01")
    
    # 2. Shoper 9 System DB
    extract_procedures("tspsysdb9", f"{BASE_PATH}/tspsysdb9")
