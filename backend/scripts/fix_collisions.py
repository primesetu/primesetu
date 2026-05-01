import os

file_path = r"d:\IMP\GitHub\primesetu\backend\app\models\legacy_s9.py"
with open(file_path, 'r') as f:
    content = f.read()

# Replace colliding table names
replacements = {
    '__tablename__ = "customers"': '__tablename__ = "s9_customers"',
    '__tablename__ = "vendors"': '__tablename__ = "s9_vendors"',
    '__tablename__ = "users"': '__tablename__ = "s9_users"',
    '__tablename__ = "stores"': '__tablename__ = "s9_stores"',
    '__tablename__ = "menu_items"': '__tablename__ = "s9_menu_items"',
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w') as f:
    f.write(content)

print("Legacy table names updated to avoid native collisions.")
