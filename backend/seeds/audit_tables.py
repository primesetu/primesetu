"""
Audit: scan legacy_s9.py and classify every table as:
  SEEDABLE  - static config/master data, good for golden provisioning
  SKIP      - transactional / volatile / log / temp tables
"""
import re, sys
sys.path.insert(0, "..")

import os as _os
content = open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "..", "app", "models", "legacy_s9.py"), encoding="utf-8").read()

# Extract all class definitions with tablename + PK columns
class_blocks = re.split(r"\nclass ", content)

results = []
for block in class_blocks[1:]:
    lines = block.splitlines()
    class_name = lines[0].split("(")[0].strip()
    tbl_match = re.search(r"__tablename__\s*=\s*'([^']+)'", block)
    if not tbl_match:
        continue
    tablename = tbl_match.group(1)
    pk_cols = re.findall(r"(\w+):\s*Mapped\[.*?\].*?primary_key=True", block)
    results.append((tablename, class_name, pk_cols))

# Classification heuristics
TRANSACTIONAL_PATTERNS = [
    "hdr","dtl","trl","trn","log","tmp","audit","queue",
    "history","status","summary","rcpt","draft","billing",
    "cache","token","poscash","sale","purch","delivery",
    "invoice","payment","receipt","return","transfer",
    "stocktakingsc","bulklbl","crmfinal","idempotency",
    "outbox","sync","ledger","gstr","pos_activity",
    "posactivity","stocksummary","balances","opbal","custopbal",
]

SEEDABLE_PATTERNS = [
    "master","config","cat","param","lookup","extd","combo",
    "prefix","paymode","personnel","vendor","season","template",
    "setting","version","currency","terminal","scheme","sizehdrs",
    "sizecatdtls","subclass","agencycath","commconfig","chainstores",
    "accounts","warehouseloc","printconfig","reportconfig","catalogsettings",
    "browsesettings","additionalcharge","confinscheme",
]

def classify(tbl):
    tl = tbl.lower()
    for p in TRANSACTIONAL_PATTERNS:
        if p in tl:
            return "SKIP"
    for p in SEEDABLE_PATTERNS:
        if p in tl:
            return "SEED"
    return "REVIEW"

already_seeded = {
    "sysparam","genlookup","genlookupextd","acceptdisplaydtls",
    "basecomptemplate","class12combo","salestaxcat","paymodeconfig",
    "pospaymodes","prefixmaster","prefixtrnno","personnel",
    "vendors","seasonsmaster",
}

print("{:<40} {:<12} {:<30}".format("TABLE", "STATUS", "PKs"))
print("-" * 86)

by_status = {"SEED": [], "SKIP": [], "REVIEW": []}
for tbl, cls, pks in sorted(results):
    if tbl in already_seeded:
        status = "DONE"
    else:
        status = classify(tbl)
    by_status.setdefault(status, []).append((tbl, cls, pks))

for status in ("SEED", "REVIEW", "SKIP", "DONE"):
    grp = by_status.get(status, [])
    if not grp:
        continue
    print()
    print(f"=== {status} ({len(grp)}) ===")
    for tbl, cls, pks in grp:
        pk_str = ", ".join(pks) if pks else "(no explicit PK)"
        print("  {:<38} {}".format(tbl, pk_str))

print()
total = len(results)
done = len(by_status.get("DONE", []))
seed = len(by_status.get("SEED", []))
review = len(by_status.get("REVIEW", []))
skip = len(by_status.get("SKIP", []))
print(f"TOTAL={total}  DONE={done}  NEW-SEEDABLE={seed}  REVIEW={review}  SKIP={skip}")
