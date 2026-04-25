import re

file_path = r"d:\IMP\GitHub\primesetu\frontend\src\lib\ModuleRegistry.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Modules to keep as is (they have real endpoints)
keep_modules = ['dashboard', 'sales', 'inventory', 'dayend', 'registry', 'ho', 'analytics', 'settings', 'schemes', 'alerts']

def replace_component(match):
    module_id = match.group(1)
    if module_id in keep_modules:
        return match.group(0) # don't change
    else:
        # replace component: <... /> with component: <ComingSoon />
        return re.sub(r'component:\s*<[^>]+>', 'component: <ComingSoon />', match.group(0))

new_content = re.sub(r"\{\s*id:\s*'([^']+)'[\s\S]*?(?=\n\s*\{|\n\s*\])", replace_component, content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated ModuleRegistry.tsx")
