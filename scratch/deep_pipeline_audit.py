"""
Deep diagnostic: Simulates the exact API call that the frontend makes
when user selects article 999726 in ARTICLE mode.
"""
import asyncio
import json
from sqlalchemy import text
from app.core.database import engine
from app.core.config import settings

async def run_full_pipeline_audit():
    schema = settings.LEGACY_SCHEMA or "shoper9"
    
    # --- Simulate fetchMatrix payload ---
    article_no = "999726"
    
    print(f"\n{'='*60}")
    print(f"SMRITI-OS Full Pipeline Audit")
    print(f"Schema: {schema} | Article: {article_no}")
    print(f"{'='*60}")

    async with engine.connect() as conn:
        # Step 1: Does search-metadata return results?
        print(f"\n[STEP 1] search-metadata: field=article, query={article_no}")
        q1 = text(f"SELECT DISTINCT subclass1cd FROM {schema}.itemmaster WHERE subclass1cd LIKE :q LIMIT 10")
        r1 = await conn.execute(q1, {"q": f"{article_no}%"})
        meta_results = [row[0] for row in r1.all()]
        print(f"  Result: {meta_results}")
        if not meta_results:
            print("  ⚠️  PROBLEM: search-metadata returns EMPTY! Dropdown won't show article.")
        else:
            print("  ✅ Dropdown suggestion found.")

        # Step 2: Does fetch-print-matrix return data?
        print(f"\n[STEP 2] fetch-print-matrix: mode=ARTICLE, article_no={article_no}")
        where = "i.subclass1cd LIKE :article"
        params = {"article": f"{article_no}%"}
        
        q2 = text(f"""
            SELECT 
                i.stockno as stock_no, 
                i.itemdesc as item_desc, 
                i.retail_price as mrp, 
                COALESCE(s.curbalqty, 0) as qty,
                i.stockno as barcode,
                i.class1cd as class1,
                i.class2cd as class2,
                i.subclass1cd as subclass1,
                i.subclass2cd as subclass2,
                i.sizecd as size_cd
            FROM {schema}.itemmaster i
            LEFT JOIN {schema}.stockmaster s ON i.stockno = s.stockno
            WHERE {where}
            LIMIT 500
        """)
        r2 = await conn.execute(q2, params)
        rows = r2.mappings().all()
        results = [dict(r) for r in rows]
        
        print(f"  Rows returned: {len(results)}")
        if not results:
            print("  ⚠️  PROBLEM: fetch-print-matrix returns EMPTY!")
        else:
            print("  ✅ Data found. Sample rows (as frontend will receive):")
            for r in results[:5]:
                print(f"    {json.dumps(r, default=str)}")

        # Step 3: Verify frontend mapping
        print(f"\n[STEP 3] Frontend data normalization check")
        if results:
            sample = results[0]
            mapped = {
                "id": sample.get("stock_no", ""),
                "stock_no": sample.get("stock_no", ""),
                "item_desc": sample.get("item_desc", "No Description"),
                "class1": sample.get("class1", ""),
                "class2": sample.get("class2", ""),
                "subclass1": sample.get("subclass1", ""),
                "subclass2": sample.get("subclass2", ""),
                "size_cd": sample.get("size_cd", ""),
                "mrp": sample.get("mrp", 0),
                "qty": sample.get("qty", 1),
            }
            print(f"  Grid row that SovereignGrid will display:")
            for k, v in mapped.items():
                print(f"    {k:12s} => {repr(v)}")

        # Step 4: Grid COLUMNS schema match check
        print(f"\n[STEP 4] COLUMNS schema vs data field key match")
        grid_keys = ["stock_no", "class1", "class2", "item_desc", "subclass1", "subclass2", "size_cd", "mrp", "qty"]
        if results:
            data_keys = set(results[0].keys())
            for key in grid_keys:
                if key in data_keys or key in ["id"]:
                    print(f"  ✅ {key}")
                else:
                    print(f"  ⚠️  MISMATCH: grid column '{key}' not in backend response keys: {list(data_keys)}")

    print(f"\n{'='*60}")
    print("Audit Complete.")
    print(f"{'='*60}")

if __name__ == "__main__":
    asyncio.run(run_full_pipeline_audit())
