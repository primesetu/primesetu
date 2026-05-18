# ============================================================
# SMRITI-OS - Seed Files Label Refactoring Script
# Replaces "Shoper" and "Shoper9" with "SMRITI" in CSV and JSON
# seed files so future company DBs are provisioned clean.
# ============================================================
import os

def refactor_file_content(file_path):
    if not os.path.exists(file_path):
        print(f"[WARN] File not found: {file_path}")
        return
        
    print(f"Refactoring seed file: {file_path}...")
    
    # Try reading as UTF-8
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(file_path, "r", encoding="cp1252") as f:
                content = f.read()
        except Exception as e:
            with open(file_path, "r", encoding="latin-1") as f:
                content = f.read()
                
    # Perform case-sensitive replacements
    new_content = content
    
    # 1. Specific Prefix/Suffix Upper Case mappings
    new_content = new_content.replace("SHOPERAppSeg", "SMRITIAppSeg")
    new_content = new_content.replace("SHOPERSysDt", "SMRITISysDt")
    new_content = new_content.replace("SHOPERSysStat", "SMRITISysStat")
    new_content = new_content.replace("SHOPEREnv", "SMRITIEnv")
    
    # 2. General brand replacements with casing preserved
    new_content = new_content.replace("Shoper9", "SMRITI")
    new_content = new_content.replace("Shoper 9", "SMRITI")
    new_content = new_content.replace("Shoper", "SMRITI")
    
    new_content = new_content.replace("shoper9", "smriti")
    new_content = new_content.replace("shoper 9", "smriti")
    new_content = new_content.replace("shoper", "smriti")
    
    new_content = new_content.replace("SHOPER9", "SMRITI")
    new_content = new_content.replace("SHOPER 9", "SMRITI")
    new_content = new_content.replace("SHOPER", "SMRITI")
    
    if new_content != content:
        # Write back safely
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"[OK] Successfully refactored {file_path}.")
    else:
        print(f"[INFO] No changes needed in {file_path}.")

def main():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    backend_root = os.path.dirname(current_dir)
    
    seed_files = [
        os.path.join(backend_root, "app", "services", "seeds", "sysparam_seeds.json"),
        os.path.join(backend_root, "app", "services", "seeds", "genlookup_seeds.json"),
        os.path.join(backend_root, "seeds", "genlookup_seeds.json"),
        os.path.join(backend_root, "seeds", "sysparam_golden.csv"),
        os.path.join(backend_root, "seeds", "basecomptemplate_seeds.json"),
        
        # Root and MySkillSet Template Files
        os.path.join(backend_root, "..", "Retail_tmp.txt"),
        os.path.join(backend_root, "..", "MySkillSet", "Templates", "Retail_tmp.txt"),
        os.path.join(backend_root, "..", "MySkillSet", "Templates", "Retail.Sy"),
        os.path.join(backend_root, "..", "MySkillSet", "Templates", "Distributor_tmp.txt"),
        os.path.join(backend_root, "..", "MySkillSet", "Templates", "Distributor.Sy"),
    ]
    
    for f in seed_files:
        refactor_file_content(f)
        
    print("All seed files refactored successfully!")

if __name__ == "__main__":
    main()

