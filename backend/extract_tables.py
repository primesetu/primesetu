import re
text = open('app/models/legacy_s9.py', encoding='utf-8').read()
tables = re.findall(r"__tablename__\s*=\s*'([^']+)'", text)
with open('tables.txt', 'w', encoding='utf-8') as f:
    for t in tables:
        f.write(t + '\n')
print(f"Extracted {len(tables)} tables.")
