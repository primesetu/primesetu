import re

file_path = r"d:\IMP\GitHub\primesetu\frontend\src\lib\ModuleRegistry.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Replace all occurrences of showInSidebar: false with showInSidebar: true
new_content = content.replace("showInSidebar: false", "showInSidebar: true")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(new_content)

print("Updated ModuleRegistry.tsx to show all menus in sidebar")
