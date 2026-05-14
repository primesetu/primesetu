import os
import zipfile
import subprocess
import xml.etree.ElementTree as ET
import re

SOURCE_DIR = r"D:\Shoper\Updates"
DB_NAME = "Shoper9CSW"
SQL_INSTANCE = "." # Default instance was working in sqlcmd

def run_sql(sql_command):
    try:
        # Use sqlcmd to run the command
        # -E for trusted connection, -S for server, -d for database, -Q for query
        # We use a temporary file for long scripts to avoid command line length limits
        temp_sql = "temp_patch.sql"
        with open(temp_sql, "w", encoding="utf-8") as f:
            f.write(sql_command)
        
        result = subprocess.run(
            ["sqlcmd", "-S", SQL_INSTANCE, "-E", "-d", DB_NAME, "-i", temp_sql],
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            print(f"SQL Error: {result.stderr}")
            return False
        return True
    except Exception as e:
        print(f"Execution Error: {e}")
        return False

def process_s9q(s9q_path):
    try:
        # S9Q files are XML-like but often have multiple <s9qsqlblk> tags or encoding issues
        with open(s9q_path, 'r', encoding='latin-1') as f:
            content = f.read()
        
        # Extract all <s9qScript> blocks
        scripts = re.findall(r'<s9qScript>(.*?)</s9qScript>', content, re.DOTALL)
        
        for script in scripts:
            # Handle -GO- separator
            blocks = script.split("-GO-")
            for block in blocks:
                block = block.strip()
                if block and not block.startswith("<APPATH>"): # Skip EXE blocks for now
                    print(f"  Executing block ({len(block)} chars)...")
                    run_sql(block)
    except Exception as e:
        print(f"Error parsing S9Q {s9q_path}: {e}")

def get_patch_num(filename):
    match = re.search(r'POS_9_0_1_(\d+)', filename)
    return int(match.group(1)) if match else 0

# List and sort patches
zips = [f for f in os.listdir(SOURCE_DIR) if f.endswith(".zip") and "POS_9_0_1_" in f]
zips.sort(key=get_patch_num)

# Start from 730
start_version = 730
target_zips = [z for z in zips if get_patch_num(z) >= start_version]

print(f"Found {len(target_zips)} patches to apply to {DB_NAME}...")

for zip_name in target_zips:
    ver = get_patch_num(zip_name)
    print(f"Processing Patch {ver} ({zip_name})...")
    zip_path = os.path.join(SOURCE_DIR, zip_name)
    
    extract_dir = f"temp_extract_{ver}"
    if not os.path.exists(extract_dir):
        os.makedirs(extract_dir)
        
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for file in zip_ref.namelist():
            if file.endswith(".S9Q"):
                zip_ref.extract(file, extract_dir)
                s9q_full_path = os.path.join(extract_dir, file)
                print(f" Applying {file}...")
                process_s9q(s9q_full_path)

print("Manual patching completed.")
