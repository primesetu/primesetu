# ============================================================
# * PrimeSetu - Shoper9-Based Retail OS
# * Zero Cloud . Sovereign . AI-Governed
# ============================================================
# * System Architect   :  Jawahar R. M.
# * Organisation       :  AITDL Network
# * Project            :  PrimeSetu
# * (c) 2026 - All Rights Reserved
# * "Memory, Not Code."
# ============================================================ #

import os
import zipfile
import shutil
import re
from datetime import datetime

# Configuration
SOURCE_DIR = r"D:\Shoper\Updates"
DEST_DIR = r"D:\shoper9"
PATCH_LIST_FILE = os.path.join(SOURCE_DIR, "DownloadedPatchList.ini")
TEMP_EXTRACT_DIR = os.path.join(SOURCE_DIR, "temp_extract")

def log(message):
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {message}")

def get_patch_sequence():
    """Reads the patch list file and returns a list of zip filenames in order."""
    if not os.path.exists(PATCH_LIST_FILE):
        log(f"Error: Patch list file not found at {PATCH_LIST_FILE}")
        return []
    
    patches = []
    with open(PATCH_LIST_FILE, 'r') as f:
        for line in f:
            match = re.search(r"File Downloaded\s+(.*\.zip)", line, re.IGNORECASE)
            if match:
                patches.append(match.group(1).strip())
    return patches

def apply_update(zip_filename):
    """Extracts a zip file and copies its contents to the destination."""
    zip_path = os.path.join(SOURCE_DIR, zip_filename)
    
    if not os.path.exists(zip_path):
        log(f"Warning: Zip file {zip_filename} not found in {SOURCE_DIR}. Skipping.")
        return False

    log(f"Applying update: {zip_filename}...")
    
    # Clear and create temp directory
    if os.path.exists(TEMP_EXTRACT_DIR):
        shutil.rmtree(TEMP_EXTRACT_DIR)
    os.makedirs(TEMP_EXTRACT_DIR)

    try:
        # Extract
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(TEMP_EXTRACT_DIR)
        
        # Copy files
        for root, dirs, files in os.walk(TEMP_EXTRACT_DIR):
            # Calculate relative path
            rel_path = os.path.relpath(root, TEMP_EXTRACT_DIR)
            if rel_path == ".":
                target_root = DEST_DIR
            else:
                target_root = os.path.join(DEST_DIR, rel_path)
            
            # Ensure target directory exists
            if not os.path.exists(target_root):
                os.makedirs(target_root)
                log(f"  Created directory: {rel_path}")
            
            for file in files:
                source_file = os.path.join(root, file)
                target_file = os.path.join(target_root, file)
                
                try:
                    shutil.copy2(source_file, target_file)
                    # log(f"  Updated: {os.path.join(rel_path, file)}")
                except PermissionError:
                    log(f"  Error: Permission denied for {target_file}. File might be in use.")
                except Exception as e:
                    log(f"  Error copying {file}: {str(e)}")
        
        return True
    except Exception as e:
        log(f"  Failed to process {zip_filename}: {str(e)}")
        return False
    finally:
        # Cleanup temp directory
        if os.path.exists(TEMP_EXTRACT_DIR):
            shutil.rmtree(TEMP_EXTRACT_DIR)

def main():
    log("Starting Shoper9 Automated Update...")
    
    if not os.path.exists(DEST_DIR):
        log(f"Error: Destination directory {DEST_DIR} does not exist.")
        return

    patches = get_patch_sequence()
    if not patches:
        log("No patches found to apply.")
        return

    log(f"Found {len(patches)} patches in sequence.")
    
    success_count = 0
    for patch in patches:
        if apply_update(patch):
            success_count += 1
    
    log(f"Update completed. {success_count}/{len(patches)} patches applied successfully.")

if __name__ == "__main__":
    main()
