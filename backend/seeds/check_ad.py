import json
import os

path = os.path.join("seeds", "golden", "ad_seeds.json")
if not os.path.exists(path):
    path = os.path.join("seeds", "ad_seeds.json")

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

def print_ad_for_trn(trntype_code, label):
    # Filter rows matching the trntype
    rows = [r for r in data if str(r.get("trntype", r.get("TrnType"))) == str(trntype_code)]
    
    # Filter only those that are visible in Accept or Display
    # AcceptVisible indicates it's an input field, DispVisible means it shows in the grid
    visible_rows = [r for r in rows if r.get("AcptVisible") or r.get("DispVisible") or r.get("visible", False)]
    
    # Sort by DispPos to see the grid order
    visible_rows.sort(key=lambda x: int(x.get("DispPos", x.get("position", 999))))
    
    print(f"\n=== {label} (TrnType {trntype_code}) - Visible Columns in Grid ===")
    print(f"{'Idx':<4} | {'AcptCap':<15} | {'DispCap':<15} | {'DispPos':<7} | {'AcptVis':<7} | {'DispVis'}")
    print("-" * 75)
    
    for r in visible_rows:
        idx = r.get("Index", r.get("index", ""))
        acap = str(r.get("AcptCap", ""))
        dcap = str(r.get("DispCap", ""))
        dpos = r.get("DispPos", r.get("position", ""))
        avis = "Y" if r.get("AcptVisible", r.get("visible")) else "N"
        dvis = "Y" if r.get("DispVisible", r.get("visible")) else "N"
        
        print(f"{idx:<4} | {acap:<15} | {dcap:<15} | {dpos:<7} | {avis:<7} | {dvis}")

print(f"Total rows in AcceptDisplayDtls: {len(data)}")

print_ad_for_trn(2100, "RETAIL SALES")
print_ad_for_trn(1100, "PURCHASE / GIR")
print_ad_for_trn(1300, "SALES RETURN")

