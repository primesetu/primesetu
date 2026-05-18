import json
import os

path = os.path.join("seeds", "golden", "genlookup_seeds.json")
if not os.path.exists(path):
    path = os.path.join("seeds", "genlookup_seeds.json")

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total rows in GenLookup: {len(data)}")

# Search for RecId 101 or 100 which typically holds TrnTypes
trntypes = [r for r in data if str(r.get("Recid")) in ("100", "101", "102")]

if trntypes:
    print(f"Found {len(trntypes)} transaction types in GenLookup:")
    for t in trntypes:
        print(f"  RecId: {t['Recid']:>3} | Code: {t['Code']:>4} | Desc: {t['Descr']}")
else:
    # If not found under those RecIds, just search for keywords
    print("Looking for keywords (Retail, Sale, Return, Purchase)...")
    for r in data:
        desc = str(r.get("Descr", "")).lower()
        if "retail" in desc or "sale" in desc or "return" in desc or "purchase" in desc:
            print(f"  RecId: {r.get('Recid'):>3} | Code: {r.get('Code'):>4} | Desc: {r.get('Descr')}")
