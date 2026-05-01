import os
import re

s9_dir = r"d:\IMP\GitHub\primesetu\docs\reference\Shoper9\ini"
unique_tables = set()

for filename in os.listdir(s9_dir):
    if filename.endswith(".S9Q"):
        with open(os.path.join(s9_dir, filename), 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()
            # Match CREATE TABLE [name]
            matches = re.findall(r'CREATE TABLE\s+(?:\[dbo\]\.)?\[?(\w+)\]?', content, re.IGNORECASE)
            for m in matches:
                unique_tables.add(m.lower())

print(f"Total Unique Tables in Reference Docs: {len(unique_tables)}")
