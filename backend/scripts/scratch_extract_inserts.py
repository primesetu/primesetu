import os

def main():
    sql_path = r"d:\IMP\GitHub\primesetu\.shoper9trace\FreshShoper9GKP-2.sql"
    if not os.path.exists(sql_path):
        print(f"File not found: {sql_path}")
        return

    print("Extracting INSERT sample statements from trace...")
    try:
        with open(sql_path, "r", encoding="utf-16") as f:
            lines = f.readlines()
            
        print(f"Total lines: {len(lines)}")
        
        # We will collect sample inserts for key tables to show their formats
        sample_inserts = {}
        for line in lines:
            line_strip = line.strip()
            if line_strip.upper().startswith("INSERT"):
                # Extract table name
                parts = line_strip.split()
                table_name = ""
                if "INTO" in line_strip.upper():
                    into_idx = -1
                    for idx, p in enumerate(parts):
                        if p.upper() == "INTO":
                            into_idx = idx
                            break
                    if into_idx != -1 and into_idx + 1 < len(parts):
                        table_name = parts[into_idx + 1]
                else:
                    table_name = parts[1]
                
                table_clean = table_name.replace("[", "").replace("]", "").replace("dbo.", "").split("(")[0].strip()
                
                if table_clean not in sample_inserts:
                    sample_inserts[table_clean] = []
                if len(sample_inserts[table_clean]) < 2:
                    sample_inserts[table_clean].append(line_strip)
                    
        # Let's print sample inserts for important configuration tables
        target_tables = [
            "SysParam", "sysparam", "SYSPARAM", 
            "GenLookUp", "Genlookup", "GENLOOKUP",
            "ACCEPTDISPLAYDTLS", "acceptdisplaydtls",
            "PrefixMaster", "prefixmaster"
        ]
        
        print("\n--- SAMPLE INSERT STATEMENTS FOUND ---")
        for table, samples in sample_inserts.items():
            # If matches our target configuration tables
            if any(t.lower() == table.lower() for t in target_tables):
                print(f"\nTable: {table}")
                for s in samples:
                    print(f"  {s[:160]}...") # truncate if extremely long
                    
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
