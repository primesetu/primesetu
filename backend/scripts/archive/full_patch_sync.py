import os
import shutil
import glob

# Source and Destination
source_root = r"D:\Shoper9\PatchTemp"
dest_root = r"D:\Shoper9"

def full_sync_patch(patch_dir):
    patch_name = os.path.basename(patch_dir)
    print(f"--- Syncing Patch: {patch_name} ---")
    
    # Walk through the patch folder structure
    for root, dirs, files in os.walk(patch_dir):
        # Calculate relative path from patch_dir
        rel_path = os.path.relpath(root, patch_dir)
        
        # Determine destination directory
        target_dir = os.path.join(dest_root, rel_path)
        
        # Create target directory if it doesn't exist
        if not os.path.exists(target_dir):
            try:
                os.makedirs(target_dir)
                print(f"  Created Dir: {rel_path}")
            except:
                pass
        
        # Copy all files
        for file in files:
            src_file = os.path.join(root, file)
            dst_file = os.path.join(target_dir, file)
            
            try:
                # Force copy/replace
                shutil.copy2(src_file, dst_file)
            except Exception as e:
                # Locked files are expected if something is running
                print(f"  Skipped {file} (locked or error)")

def main():
    # Get all patch folders
    patch_dirs = [d for d in glob.glob(os.path.join(source_root, "POS_9_0_1_*")) if os.path.isdir(d)]
    # Sort chronologically by build number
    patch_dirs.sort(key=lambda x: int(os.path.basename(x).split('_')[-1]))
    
    for pd in patch_dirs:
        full_sync_patch(pd)
    
    print("\n[!!!] ALL FILES AND FOLDERS SYNCED FROM PATCHTEMP TO SHOPER9 ROOT [!!!]")

if __name__ == "__main__":
    main()
