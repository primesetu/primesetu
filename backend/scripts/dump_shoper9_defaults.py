import os
import pyodbc
import json
from decimal import Decimal
import datetime

# Helper to serialize decimals and datetimes
def json_default(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    if isinstance(obj, datetime.datetime):
        return obj.isoformat()
    raise TypeError

def main():
    server = "AITDL"
    database = "Shoper9GKP"
    user = "sa"
    password = "netmanthan@123"
    driver = "SQL Server"

    conn_str = f"DRIVER={{{driver}}};SERVER={server};DATABASE={database};UID={user};PWD={password};"

    print("Connecting to MSSQL database to dump clean default template data...")
    try:
        conn = pyodbc.connect(conn_str, timeout=10)
        cursor = conn.cursor()
        
        # Ensure target seeds directory exists
        seeds_dir = r"d:\IMP\GitHub\primesetu\backend\app\services\seeds"
        os.makedirs(seeds_dir, exist_ok=True)
        
        # 1. Dump SysParam
        print("Dumping SysParam...")
        cursor.execute("SELECT Id, Descr, ParamCode, Boolean, Intg, Txt, Dt, Sng, Cur, Opt FROM SysParam")
        sys_cols = [c[0] for c in cursor.description]
        sys_rows = [dict(zip(sys_cols, row)) for row in cursor.fetchall()]
        
        # 2. Dump GenLookUp
        print("Dumping GenLookUp...")
        cursor.execute("SELECT Recid, Code, Descr, Flag, Number FROM GenLookUp")
        lookup_cols = [c[0] for c in cursor.description]
        lookup_rows = [dict(zip(lookup_cols, row)) for row in cursor.fetchall()]
        
        # 3. Dump AcceptDisplayDtls
        print("Dumping AcceptDisplayDtls...")
        cursor.execute("""
            SELECT TrnType, [Index], AcptCap, DispCap, AcptVisible, DispVisible, 
                   AcptPos, DispPos, AcptDataType, DispDataType, AcptWidth, DispWidth, 
                   AcptAlign, DispAlign 
            FROM AcceptDisplayDtls
        """)
        ad_cols = [c[0] for c in cursor.description]
        ad_rows = [dict(zip(ad_cols, row)) for row in cursor.fetchall()]
        
        # Save to JSON
        with open(os.path.join(seeds_dir, "sysparam_seeds.json"), "w", encoding="utf-8") as f:
            json.dump(sys_rows, f, default=json_default, indent=2)
            
        with open(os.path.join(seeds_dir, "genlookup_seeds.json"), "w", encoding="utf-8") as f:
            json.dump(lookup_rows, f, default=json_default, indent=2)
            
        with open(os.path.join(seeds_dir, "ad_seeds.json"), "w", encoding="utf-8") as f:
            json.dump(ad_rows, f, default=json_default, indent=2)
            
        print(f"\n[SUCCESS] Baseline template data dumped successfully into {seeds_dir}!")
        print(f" - SysParam: {len(sys_rows)} rows dumped")
        print(f" - GenLookUp: {len(lookup_rows)} rows dumped")
        print(f" - AcceptDisplayDtls: {len(ad_rows)} rows dumped")
        
        conn.close()
    except Exception as e:
        print(f"[ERROR] Failed to dump Shoper9GKP baseline: {e}")

if __name__ == "__main__":
    main()
