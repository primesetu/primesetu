import os
import re
from pathlib import Path

# PrimeSetu Signature Block
SIGNATURE = """/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R Mallah
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */
"""

ROOT_DIR = Path(__file__).parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend" / "src" / "modules"
BACKEND_DIR = ROOT_DIR / "backend" / "app" / "routers"
DOCS_DIR = ROOT_DIR / "docs" / "modules"

def get_modules():
    modules = set()
    if FRONTEND_DIR.exists():
        for item in FRONTEND_DIR.iterdir():
            if item.is_dir():
                modules.add(item.name)
    
    if BACKEND_DIR.exists():
        for item in BACKEND_DIR.iterdir():
            if item.suffix == ".py" and item.stem != "__init__":
                modules.add(item.stem)
    
    return sorted(list(modules))

def detect_s9_usage(module_name):
    # Search in frontend
    fe_path = FRONTEND_DIR / module_name
    be_path = BACKEND_DIR / f"{module_name}.py"
    
    keywords = ["Shoper9 Bridge", "S9 Bridge", "managed via Shoper9", "Shoper9 API", "Shoper9 Standard"]
    usage = []
    
    files_to_check = []
    if fe_path.exists():
        for root, _, files in os.walk(fe_path):
            for file in files:
                if file.endswith((".tsx", ".ts")):
                    files_to_check.append(Path(root) / file)
                    
    if be_path.exists():
        files_to_check.append(be_path)
    
    # Check for specific Shoper9 bridge file
    integration_router = BACKEND_DIR / "integration.py"
    if integration_router.exists():
        with open(integration_router, "r", encoding="utf-8") as f:
            content = f.read()
            if module_name.lower() in content.lower():
                usage.append("Referenced in backend integration.py")

    for file_path in files_to_check:
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content_lines = f.readlines()
                # Skip signature block (first 12 lines)
                content_to_search = "".join(content_lines[12:]) if len(content_lines) > 12 else "".join(content_lines)
                
                for kw in keywords:
                    if kw.lower() in content_to_search.lower():
                        # Find the line in the searched part
                        for line in content_lines[12:]:
                            if kw.lower() in line.lower():
                                clean_line = line.strip()
                                if len(clean_line) > 5 and clean_line not in usage:
                                    usage.append(f"{file_path.name}: {clean_line[:100]}")
                                    break
                        break
        except Exception:
            continue
            
    return usage

def update_module_doc(module_name):
    doc_path = DOCS_DIR / f"{module_name}.md"
    s9_usage = detect_s9_usage(module_name)
    
    fe_path = FRONTEND_DIR / module_name
    be_path = BACKEND_DIR / f"{module_name}.py"
    
    content = f"{SIGNATURE}\n# Module: {module_name.capitalize()}\n\n"
    content += "## Overview\nDocumentation for the implementation of the " + module_name + " module.\n\n"
    
    content += "## Implementation Details\n"
    if fe_path.exists():
        content += f"- **Frontend**: `frontend/src/modules/{module_name}`\n"
    if be_path.exists():
        content += f"- **Backend**: `backend/app/routers/{module_name}.py`\n"
    content += "\n"
    
    content += "## Shoper9 Integration\n"
    if s9_usage:
        content += "This module interacts with Shoper9 via the following points:\n"
        for use in s9_usage:
            content += f"- {use}\n"
    else:
        content += "No direct Shoper9 integration detected in this module's primary files.\n"
    
    content += "\n## Auto-Generated Status\n"
    content += "Synced at: 2026-04-24\n"
    
    # If file exists, we could append or update. For now, let's overwrite to keep it clean, 
    # but we could read existing content to preserve manual notes.
    # To "append" new info, we could look for a specific marker.
    
    DOCS_DIR.mkdir(parents=True, exist_ok=True)
    with open(doc_path, "w", encoding="utf-8") as f:
        f.write(content)
    
    return bool(s9_usage)

def generate_overview(modules_info):
    overview_path = DOCS_DIR / "IMPLEMENTATION.md"
    content = f"{SIGNATURE}\n# PrimeSetu Module Implementation Overview\n\n"
    content += "This document provides a summary of all implemented modules and their dependency on Shoper9.\n\n"
    content += "| Module | Frontend | Backend | Shoper9 Integration |\n"
    content += "|--------|----------|---------|---------------------|\n"
    
    for mod in modules_info:
        name = mod['name']
        fe = "✅" if mod['fe'] else "❌"
        be = "✅" if mod['be'] else "❌"
        s9 = "🔗 Linked" if mod['s9'] else "🏢 Sovereign"
        content += f"| [{name.capitalize()}]({name}.md) | {fe} | {be} | {s9} |\n"
    
    content += "\n\n---\n*Last Updated: 2026-04-24 via scripts/sync_module_docs.py*\n"
    
    with open(overview_path, "w", encoding="utf-8") as f:
        f.write(content)

def main():
    modules = get_modules()
    modules_info = []
    
    print(f"Found {len(modules)} modules. Updating documentation...")
    
    for mod in modules:
        has_s9 = update_module_doc(mod)
        modules_info.append({
            'name': mod,
            'fe': (FRONTEND_DIR / mod).exists(),
            'be': (BACKEND_DIR / f"{mod}.py").exists(),
            's9': has_s9
        })
    
    generate_overview(modules_info)
    print("Documentation updated successfully in docs/modules/")

if __name__ == "__main__":
    main()
