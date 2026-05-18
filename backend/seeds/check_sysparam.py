import json
import os

path = os.path.join("seeds", "golden", "sysparam_gkp.json")
if not os.path.exists(path):
    path = os.path.join("seeds", "sysparam_seeds.json")

with open(path, "r", encoding="utf-8") as f:
    data = json.load(f)

print(f"Total rows in Sysparam: {len(data)}\n")

keywords = ['SALE', 'BILL', 'ROUND', 'TAX', 'STOCK', 'TRN', 'DISC', 'PAY']

print("Important Billing/Stock SysParams:")
print(f"{'ParamCode':<25} | {'Type':<4} | {'ValTxt':<15} | {'ValNum'} | {'Descr'}")
print("-" * 120)

count = 0
for r in data:
    code = r.get("ParamCode", "").upper()
    desc = str(r.get("Descr", "")).upper()
    
    # Check if the param code relates to core billing logic
    if any(k in code for k in keywords):
        v_txt = r.get("Txt") or ""
        v_bool = r.get("Boolean")
        v_int = r.get("Intg")
        v_sng = r.get("Sng")
        
        # Decide which numeric value is relevant based on Opt type
        opt = r.get("Opt", "")
        v_num = ""
        if opt == "B": v_num = str(bool(v_bool))
        elif opt == "I": v_num = str(v_int)
        elif opt == "N": v_num = str(v_sng)
        
        print(f"{code:<25} | {opt:<4} | {str(v_txt):<15} | {v_num:<6} | {r.get('Descr')}")
        count += 1
        
        # Limit to avoid massive output, just want the most critical ones
        if count >= 40:
            print("... (truncated)")
            break
