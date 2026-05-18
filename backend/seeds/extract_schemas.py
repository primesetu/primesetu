"""Extract column schemas for Phase 3 tables from legacy_s9.py"""
import re, os

MODEL_FILE = os.path.join(os.path.dirname(__file__), "..", "app", "models", "legacy_s9.py")
content = open(MODEL_FILE, encoding="utf-8").read()

TARGETS = [
    "printtemplateconfigdtls",
    "printnodetrnconfigmaster",
    "confinschemedtls",
    "additionalchargedtls",
    "transactioncomponentsdtls",
    "browsesettings",
    "catalogsettings",
    "salesfactors",
]

for tgt in TARGETS:
    pattern = r"__tablename__\s*=\s*'" + tgt + r"'"
    m = re.search(pattern, content, re.IGNORECASE)
    if not m:
        print("--- {}: NOT FOUND IN MODEL ---\n".format(tgt))
        continue
    start = content.rfind("\nclass ", 0, m.start())
    next_class = re.search(r"\nclass ", content[start+1:])
    block = content[start: start + 1 + (next_class.start() if next_class else 2000)]
    pks  = re.findall(r"(\w+):\s*Mapped\[.*?primary_key=True", block)
    cols = re.findall(r"    (\w+):\s*Mapped\[", block)
    types = {}
    for cm in re.finditer(r"    (\w+):\s*Mapped\[Optional\[(\w+)\]\]|    (\w+):\s*Mapped\[(\w+)\]", block):
        col = cm.group(1) or cm.group(3)
        typ = cm.group(2) or cm.group(4)
        if col and typ:
            types[col] = typ
    print("--- {} ---  PKs: {}".format(tgt, pks))
    for c in cols:
        print("    {}: {}{}".format(c, types.get(c,"?"), " [PK]" if c in pks else ""))
    print()
