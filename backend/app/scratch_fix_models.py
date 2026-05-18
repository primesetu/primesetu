import os

file_path = r"d:\IMP\GitHub\primesetu\backend\app\models\legacy_s9.py"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix Decimal import
if "from decimal import Decimal" not in content:
    # Find the first import block and insert it
    content = content.replace("from sqlalchemy import", "from decimal import Decimal\nfrom sqlalchemy import", 1)

# Remove duplicates of the Purchase Order block if I accidentally appended it multiple times
block = "# =========================================================================\n# Purchase Order Tables (Added for Smriti Purchase Protocol v2.0)\n# ========================================================================="

count = content.count(block)
if count > 1:
    print(f"Found {count} duplicates, cleaning up...")
    parts = content.split(block)
    # Keep everything before the first block, and only one copy of the block
    clean_content = parts[0] + block + parts[1]
    content = clean_content

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
print("legacy_s9.py patched for Decimal import and duplicates.")
