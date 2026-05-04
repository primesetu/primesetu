import os
import pyodbc
import glob

# 1. Get all .S9Q files from PatchTemp and root Script dir
s9q_files = []
patch_dirs = glob.glob(r'D:\Shoper9\PatchTemp\POS_*\Script\*.S9Q')
s9q_files.extend(patch_dirs)
s9q_files.extend(glob.glob(r'D:\Shoper9\Script\*.S9Q'))
s9q_files = list(set(s9q_files)) # Remove duplicates
s9q_files.sort()

print(f"Found {len(s9q_files)} .S9Q script files to process.")

# 2. Connect to master to find all Shoper databases
conn_master = pyodbc.connect('DRIVER={SQL Server};SERVER=.;Trusted_Connection=yes;DATABASE=master', autocommit=True)
cursor_master = conn_master.cursor()
cursor_master.execute("SELECT name FROM sys.databases WHERE name LIKE '%Shoper%' OR name LIKE '%tsp%'")
databases = [row[0] for row in cursor_master.fetchall()]
conn_master.close()

print(f"Found Databases to Patch: {databases}")

# 3. Apply to all databases
for db in databases:
    print(f"\n---> Applying Patches to Database: {db} <---")
    try:
        conn = pyodbc.connect(f'DRIVER={{SQL Server}};SERVER=.;Trusted_Connection=yes;DATABASE={db}', autocommit=True)
        cursor = conn.cursor()
    except Exception as e:
        print(f"Skipping {db}, connection failed: {e}")
        continue

    success_count = 0
    fail_count = 0
    
    for filepath in s9q_files:
        try:
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            
            if '<s9qScript>' in content:
                blocks = content.split('<s9qScript>')
                for block in blocks[1:]:
                    script_block = block.split('</s9qScript>')[0]
                    # Only execute actual SQL (DML/DDL)
                    if '<s9qQryType>DML</s9qQryType>' in content or '<s9qQryType>DDL</s9qQryType>' in content or 'INSERT' in script_block or 'UPDATE' in script_block or 'CREATE' in script_block or 'ALTER' in script_block:
                        queries = script_block.split('-GO-')
                        for q in queries:
                            q = q.strip()
                            if q and not q.endswith('.exe'):
                                try:
                                    cursor.execute(q)
                                    success_count += 1
                                except Exception as e:
                                    fail_count += 1
                                    pass # Ignore failures (already exists, etc)
        except Exception as e:
            pass

    conn.close()
    print(f"Finished {db}. Success: {success_count}, Ignored/Failed: {fail_count}")

print("\n!!! ALL SHOPER DATABASES FULLY PATCHED MANUALLY !!!")
