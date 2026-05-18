import json
import os
from sqlalchemy import text

async def seed_extended_tables(conn, tenant_id: str):
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Seed GenLookUp
    genlookup_file = os.path.join(current_dir, "genlookup_seeds.json")
    if os.path.exists(genlookup_file):
        with open(genlookup_file, "r", encoding="utf-8") as f:
            gen_seeds = json.load(f)
            
        gen_dicts = []
        for seed in gen_seeds:
            gen_dicts.append({
                "tid": tenant_id,
                "rid": int(seed.get("Recid") or 0),
                "code": str(seed.get("Code") or ""),
                "descr": str(seed.get("Descr") or ""),
                "num": int(seed.get("Number") or 0)
            })
            
        if gen_dicts:
            # Chunking to avoid parameter limits
            batch_size = 100
            for i in range(0, len(gen_dicts), batch_size):
                batch = gen_dicts[i:i+batch_size]
                # legacy_s9.py defines: recid, code, descr, number
                await conn.execute(text("""
                    INSERT INTO s9.genlookup (tenant_id, recid, code, descr, number)
                    VALUES (:tid, :rid, :code, :descr, :num)
                    ON CONFLICT (recid, code) DO NOTHING
                """), batch)

    # 2. Seed GenLookUpExtd
    genextd_file = os.path.join(current_dir, "genlookupextd_seeds.json")
    if os.path.exists(genextd_file):
        with open(genextd_file, "r", encoding="utf-8") as f:
            extd_seeds = json.load(f)
            
        extd_dicts = []
        for seed in extd_seeds:
            extd_dicts.append({
                "tid": tenant_id,
                "rid": int(seed.get("RecID") or 0),
                "code": str(seed.get("Category") or ""),
                "e1c": str(seed.get("Additional1") or ""),
                "e1d": str(seed.get("Description") or ""),
                "e2c": str(seed.get("Additional2") or ""),
                "e2d": ""
            })
            
        if extd_dicts:
            batch_size = 100
            for i in range(0, len(extd_dicts), batch_size):
                batch = extd_dicts[i:i+batch_size]
                await conn.execute(text("""
                    INSERT INTO s9.genlookupextd (tenant_id, recid, code, extdcode1, extddescr1, extdcode2, extddescr2)
                    VALUES (:tid, :rid, :code, :e1c, :e1d, :e2c, :e2d)
                    ON CONFLICT (recid, code) DO NOTHING
                """), batch)

    # 3. Seed AcceptDisplayDtls
    ad_file = os.path.join(current_dir, "ad_seeds.json")
    if os.path.exists(ad_file):
        with open(ad_file, "r", encoding="utf-8") as f:
            ad_seeds = json.load(f)
            
        ad_dicts = []
        for seed in ad_seeds:
            ad_dicts.append({
                "tid": tenant_id,
                "trntype": int(seed.get("trntype") or seed.get("TrnType") or 0),
                "idx": int(seed.get("Index") or seed.get("index") or 0),
                "acptcap": str(seed.get("AcptCap") or ""),
                "dispcap": str(seed.get("DispCap") or ""),
                "acptvis": bool(seed.get("AcptVisible")),
                "dispvis": bool(seed.get("DispVisible")),
                "acptpos": int(seed.get("AcptPos") or 0),
                "disppos": int(seed.get("DispPos") or 0),
                "acptdtype": int(seed.get("AcptDataType") or 0),
                "dispdtype": int(seed.get("DispDataType") or 0),
                "acptwidth": float(seed.get("AcptWidth") or 0.0),
                "dispwidth": float(seed.get("DispWidth") or 0.0),
                "acptalign": int(seed.get("AcptAlign") or 0),
                "dispalign": int(seed.get("DispAlign") or 0)
            })
            
        if ad_dicts:
            batch_size = 100
            for i in range(0, len(ad_dicts), batch_size):
                batch = ad_dicts[i:i+batch_size]
                await conn.execute(text("""
                    INSERT INTO s9.acceptdisplaydtls (tenant_id, trntype, index, acptcap, dispcap, acptvisible, dispvisible, acptpos, disppos, acptdatatype, dispdatatype, acptwidth, dispwidth, acptalign, dispalign)
                    VALUES (:tid, :trntype, :idx, :acptcap, :dispcap, :acptvis, :dispvis, :acptpos, :disppos, :acptdtype, :dispdtype, :acptwidth, :dispwidth, :acptalign, :dispalign)
                    ON CONFLICT (trntype, index) DO NOTHING
                """), batch)

    # 4. Seed BaseCompTemplate
    bct_file = os.path.join(current_dir, "basecomptemplate_seeds.json")
    if os.path.exists(bct_file):
        with open(bct_file, "r", encoding="utf-8") as f:
            bct_seeds = json.load(f)
            
        bct_dicts = []
        for seed in bct_seeds:
            bct_dicts.append({
                "tid": tenant_id,
                "tmplidno": int(seed.get("TMPLIDNO") or 0),
                "tmplextn": str(seed.get("TMPLEXTN") or ""),
                "srlno": int(seed.get("SRLNO") or 0),
                "tmplfiledtls": str(seed.get("TMPLFILEDTLS") or ""),
                "tmplcomptype": str(seed.get("TMPLCOMPTYPE") or ""),
                "tmpllinedtls": str(seed.get("TMPLLINEDTLS") or "")
            })
            
        if bct_dicts:
            batch_size = 100
            for i in range(0, len(bct_dicts), batch_size):
                batch = bct_dicts[i:i+batch_size]
                await conn.execute(text("""
                    INSERT INTO s9.basecomptemplate (tenant_id, tmplidno, tmplextn, srlno, tmplfiledtls, tmplcomptype, tmpllinedtls)
                    VALUES (:tid, :tmplidno, :tmplextn, :srlno, :tmplfiledtls, :tmplcomptype, :tmpllinedtls)
                    ON CONFLICT DO NOTHING
                """), batch)

    # 5. Seed Class12Combo
    c12_file = os.path.join(current_dir, "class12combo_seeds.json")
    if os.path.exists(c12_file):
        with open(c12_file, "r", encoding="utf-8") as f:
            c12_seeds = json.load(f)
            
        c12_dicts = []
        for seed in c12_seeds:
            billable_str = str(seed.get("Billable") or "Y").upper()
            billable_bool = billable_str in ["Y", "TRUE", "1"]
            c12_dicts.append({
                "tid": tenant_id,
                "class1cd": str(seed.get("Class1Cd") or ""),
                "class2cd": str(seed.get("Class2Cd") or ""),
                "billable": billable_bool,
                "sizegroup": str(seed.get("SizeGroup") or ""),
                "retailmarkup": float(seed.get("RetailMarkUp") or 0.0),
                "dealermarkup": float(seed.get("DealerMarkUp") or 0.0),
                "prodtaxtype": str(seed.get("ProdTaxType") or ""),
                "superclass1": str(seed.get("SuperClass1") or ""),
                "superclass2": str(seed.get("SuperClass2") or "")
            })
            
        if c12_dicts:
            batch_size = 100
            for i in range(0, len(c12_dicts), batch_size):
                batch = c12_dicts[i:i+batch_size]
                await conn.execute(text("""
                    INSERT INTO s9.class12combo (tenant_id, class1cd, class2cd, billable, sizegroup, retailmarkup, dealermarkup, prodtaxtype, superclass1, superclass2)
                    VALUES (:tid, :class1cd, :class2cd, :billable, :sizegroup, :retailmarkup, :dealermarkup, :prodtaxtype, :superclass1, :superclass2)
                    ON CONFLICT DO NOTHING
                """), batch)
