import os
import csv
import logging
from sqlalchemy import text

logger = logging.getLogger(__name__)

def parse_int(val):
    if val is None or val.strip() == "":
        return None
    try:
        return int(val.strip())
    except ValueError:
        return None

def parse_float(val):
    if val is None or val.strip() == "":
        return None
    try:
        return float(val.strip())
    except ValueError:
        return None

def parse_bool(val):
    if val is None or val.strip() == "":
        return None
    # 1=True, 0=False
    stripped = val.strip()
    if stripped == "1":
        return True
    elif stripped == "0":
        return False
    if stripped.lower() in ("true", "t", "y", "yes"):
        return True
    return False

async def seed_sysparam(conn, tenant_id: str):
    """
    Parses sysparam_golden.csv and batch inserts records into s9.sysparam.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path = os.path.join(current_dir, "sysparam_golden.csv")
    
    if not os.path.exists(csv_path):
        logger.error(f"sysparam_golden.csv not found at {csv_path}")
        return
        
    records = []
    skipped_count = 0
    
    # Robustly handle different potential encodings (UTF-8, cp1252, latin-1)
    content = ""
    try:
        with open(csv_path, "r", encoding="utf-8") as f:
            content = f.read()
    except UnicodeDecodeError:
        try:
            with open(csv_path, "r", encoding="cp1252") as f:
                content = f.read()
        except Exception as e:
            with open(csv_path, "r", encoding="latin-1") as f:
                content = f.read()

    reader = csv.DictReader(content.splitlines())
    for row in reader:
        param_code = row.get("ParamCode")
        if not param_code or param_code.strip() == "":
            skipped_count += 1
            logger.warning("Skipped row: ParamCode is empty or null.")
            continue
            
        records.append({
            "tid": tenant_id,
            "id": row.get("Id"),
            "descr": row.get("Descr"),
            "pcode": param_code.strip(),
            "b": parse_bool(row.get("Boolean")),
            "i": parse_int(row.get("Intg")),
            "t": row.get("Txt"),
            "s": parse_float(row.get("Sng")),
            "c": parse_float(row.get("Cur")),
            "o": row.get("Opt"),
            "vauid": row.get("VAUid"),
            "vactr": parse_int(row.get("VActr")),
            "vatermid": row.get("VATermId"),
            "vacompcode": row.get("VACompCode"),
            "category": row.get("Category"),
            "catdescr": row.get("CatDescr"),
            "disporder": parse_int(row.get("DispOrder"))
        })
        
    logger.info(f"Parsed {len(records)} records from CSV. Skipped {skipped_count} invalid rows.")
    
    # Batch insert in chunks of 100 rows
    chunk_size = 100
    for i in range(0, len(records), chunk_size):
        chunk = records[i:i+chunk_size]
        query = text("""
            INSERT INTO s9.sysparam (
                tenant_id, id, descr, paramcode, boolean, intg, txt, sng, cur, opt,
                vauid, vactr, vatermid, vacompcode, category, catdescr, disporder
            )
            VALUES (
                :tid, :id, :descr, :pcode, :b, :i, :t, :s, :c, :o,
                :vauid, :vactr, :vatermid, :vacompcode, :category, :catdescr, :disporder
            )
            ON CONFLICT (id) DO NOTHING
        """)
        await conn.execute(query, chunk)
        
    logger.info(f"Successfully seeded legacy s9.sysparam with {len(records)} parameters.")
