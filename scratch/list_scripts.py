import os
import zipfile

SOURCE_DIR = r"D:\Shoper\Updates"

for filename in os.listdir(SOURCE_DIR):
    if filename.endswith(".zip"):
        zip_path = os.path.join(SOURCE_DIR, filename)
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file in zip_ref.namelist():
                    if file.endswith(".S9Q") or file.endswith(".SQL"):
                        print(f"{filename} -> {file}")
        except:
            pass
