import os
import pyodbc
import glob
import shutil

# Config
shoper_path = r"D:\Shoper9"
patch_temp = r"D:\Shoper9\PatchTemp"
conn_str_template = 'DRIVER={SQL Server};SERVER=.;Trusted_Connection=yes;DATABASE='

def get_databases():
    conn = pyodbc.connect('DRIVER={SQL Server};SERVER=.;Trusted_Connection=yes;DATABASE=master', autocommit=True)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sys.databases WHERE name LIKE '%Shoper%' OR name LIKE '%tsp%'")
    dbs = [row[0] for row in cursor.fetchall()]
    conn.close()
    return dbs

def run_sql(db_name, sql):
    try:
        conn = pyodbc.connect(conn_str_template + db_name, autocommit=True)
        cursor = conn.cursor()
        queries = sql.split('-GO-')
        for q in queries:
            q = q.strip()
            if q and not q.lower().endswith('.exe'):
                try:
                    cursor.execute(q)
                except:
                    pass # Ignore errors like "column already exists"
        conn.close()
    except Exception as e:
        print(f"  [!] DB {db_name} Error: {e}")

def apply_patch(patch_dir, databases):
    patch_name = os.path.basename(patch_dir)
    print(f"\n>>> PROCESSING PATCH: {patch_name}")
    
    # 1. Copy Files to Shoper Root
    files = [f for f in os.listdir(patch_dir) if os.path.isfile(os.path.join(patch_dir, f))]
    for f in files:
        src = os.path.join(patch_dir, f)
        dst = os.path.join(shoper_path, f)
        try:
            shutil.copy2(src, dst)
        except:
            pass
            
    # 2. Copy and Run Scripts
    script_subfolder = os.path.join(patch_dir, 'Script')
    if os.path.exists(script_subfolder):
        s9q_files = glob.glob(os.path.join(script_subfolder, "*.S9Q"))
        s9q_files.sort()
        
        for s9q in s9q_files:
            # Copy script to main Script folder
            shutil.copy2(s9q, os.path.join(shoper_path, 'Script', os.path.basename(s9q)))
            
            # Read and parse SQL
            try:
                with open(s9q, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                
                if '<s9qScript>' in content:
                    sql_block = content.split('<s9qScript>')[1].split('</s9qScript>')[0]
                    if '<s9qQryType>DML</s9qQryType>' in content or '<s9qQryType>DDL</s9qQryType>' in content:
                        print(f"  Executing SQL from {os.path.basename(s9q)}...")
                        for db in databases:
                            run_sql(db, sql_block)
            except:
                pass

def main():
    databases = get_databases()
    print(f"Target Databases: {databases}")
    
    patch_dirs = [d for d in glob.glob(os.path.join(patch_temp, "POS_9_0_1_*")) if os.path.isdir(d)]
    # Sort by release number
    patch_dirs.sort(key=lambda x: int(os.path.basename(x).split('_')[-1]))
    
    for pd in patch_dirs:
        apply_patch(pd, databases)

if __name__ == "__main__":
    main()
