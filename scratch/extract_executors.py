import os
import zipfile
import subprocess
import re

SOURCE_DIR = r"D:\Shoper\Updates"
TARGET_DIR = r"D:\shoper9"

def get_patch_num(filename):
    match = re.search(r'POS_9_0_1_(\d+)', filename)
    return int(match.group(1)) if match else 0

zips = [f for f in os.listdir(SOURCE_DIR) if f.endswith(".zip") and "POS_9_0_1_" in f]
zips.sort(key=get_patch_num)

# Start from 730
target_zips = [z for z in zips if get_patch_num(z) >= 730]

print(f"Searching for executors in {len(target_zips)} patches...")

for zip_name in target_zips:
    ver = get_patch_num(zip_name)
    zip_path = os.path.join(SOURCE_DIR, zip_name)
    
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        for file in zip_ref.namelist():
            if file.endswith(".exe") and ("ScriptExec" in file or "POS" in file and "Rel" in file):
                print(f"FOUND EXECUTOR in {zip_name}: {file}")
                # Extract to TARGET_DIR
                zip_ref.extract(file, TARGET_DIR)
                print(f"  Extracted {file} to {TARGET_DIR}")
