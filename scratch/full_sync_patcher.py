# ============================================================
# PrimeSetu - Shoper9-Based Retail OS
# Zero Cloud . Sovereign . AI-Governed
# ============================================================
# System Architect   :  Jawahar R Mallah
# Organisation       :  AITDL Network
# Project            :  PrimeSetu
# (c) 2026 - All Rights Reserved
# "Memory, Not Code."
# ============================================================

import os
import zipfile
import re

SOURCE_DIR = r"D:\Shoper\Updates"
TARGET_DIR = r"D:\shoper9"

def get_patch_num(filename):
    match = re.search(r'POS_9_0_1_(\d+)', filename)
    return int(match.group(1)) if match else 0

def full_sync():
    zips = [f for f in os.listdir(SOURCE_DIR) if f.endswith(".zip") and "POS_9_0_1_" in f]
    zips.sort(key=get_patch_num)

    # Start from 730 as requested by user previously
    start_version = 730
    target_zips = [z for z in zips if get_patch_num(z) >= start_version]

    print(f"Starting full synchronization from {len(target_zips)} patches...")

    for zip_name in target_zips:
        ver = get_patch_num(zip_name)
        print(f"Processing Patch {ver}...")
        zip_path = os.path.join(SOURCE_DIR, zip_name)
        
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                # Extract all files, overwriting existing ones
                # Note: Shoper9 patches use relative paths like 'Script/', 'SIS/', etc.
                for file_info in zip_ref.infolist():
                    try:
                        zip_ref.extract(file_info, TARGET_DIR)
                    except Exception as e:
                        print(f"  Error extracting {file_info.filename}: {e}")
        except Exception as e:
            print(f"Error opening {zip_name}: {e}")

    print("Full synchronization completed.")

if __name__ == "__main__":
    full_sync()
