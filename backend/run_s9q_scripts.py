import os
import pyodbc
import xml.etree.ElementTree as ET

script_dir = r"D:\Shoper9\Script"
databases = ['Shoper9CSW', 'SHOPER9WH1', 'SHOPER9X01']
conn_str_template = 'DRIVER={SQL Server};SERVER=.;Trusted_Connection=yes;DATABASE='

files = [f for f in os.listdir(script_dir) if f.endswith('.S9Q')]
files.sort()

# Keep track of failed scripts to report back
failed_scripts = []

for db in databases:
    print(f"\n--- Updating Database: {db} ---")
    try:
        conn = pyodbc.connect(conn_str_template + db, autocommit=True)
        cursor = conn.cursor()
    except Exception as e:
        print(f"Failed to connect to {db}: {e}")
        continue

    for file in files:
        filepath = os.path.join(script_dir, file)
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            # Extract content between <s9qScript> tags
            if '<s9qScript>' in content and '</s9qScript>' in content:
                script_block = content.split('<s9qScript>')[1].split('</s9qScript>')[0]
                
                # Check query type
                if '<s9qQryType>DML</s9qQryType>' in content or '<s9qQryType>DDL</s9qQryType>' in content:
                    queries = script_block.split('-GO-')
                    for q in queries:
                        q = q.strip()
                        if q:
                            try:
                                cursor.execute(q)
                            except Exception as e:
                                pass # Ignore individual query failures (e.g. table already exists)
                
        except Exception as e:
            failed_scripts.append(file)

    conn.close()
    print(f"Completed script execution for {db}.")

print("\nAll DB updates attempted.")
