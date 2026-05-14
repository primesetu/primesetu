import os
import zipfile

SOURCE_DIR = r"D:\Shoper\Updates"
SEARCH_PATTERN = "xtmptblsingleitemvalidpromodtls"

for filename in os.listdir(SOURCE_DIR):
    if filename.endswith(".zip"):
        zip_path = os.path.join(SOURCE_DIR, filename)
        try:
            with zipfile.ZipFile(zip_path, 'r') as zip_ref:
                for file in zip_ref.namelist():
                    if file.endswith(".S9Q"):
                        with zip_ref.open(file) as f:
                            content = f.read().decode('latin-1', errors='ignore')
                            if SEARCH_PATTERN in content:
                                print(f"FOUND IN {filename} -> {file}")
        except:
            pass
