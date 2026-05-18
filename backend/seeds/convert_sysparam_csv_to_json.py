"""
One-shot script: convert seeds/sysparam_golden.csv  →  seeds/golden/sysparam_gkp.json

Column mapping (CSV header → JSON key matches GoldenSeedEngine col_map exactly):
    Id, Descr, ParamCode, Boolean, Intg, Txt, Dt, Sng, Cur, Opt, Fixed,
    Changed, Category, CatDescr, DispOrder, Wz, WzType, WzOrder,
    VAUid, VActr, VATermId, VACompCode
"""
import csv
import json
import os

SRC_CSV  = os.path.join(os.path.dirname(__file__), "sysparam_golden.csv")
DST_JSON = os.path.join(os.path.dirname(__file__), "golden", "sysparam_gkp.json")

# GoldenSeedEngine col_map keys (exact capitalisation expected)
KEEP_COLS = {
    "Id", "Descr", "ParamCode",
    "Boolean", "Intg", "Txt", "Dt", "Sng", "Cur", "Opt",
    "Fixed", "Changed",
    "Category", "CatDescr", "DispOrder",
    "Wz", "WzType", "WzOrder",
    "VAUid", "VActr", "VATermId", "VACompCode",
}

def parse_value(key: str, val: str):
    """Coerce blanks → None, numerics to correct Python type."""
    v = val.strip() if val else ""
    if v == "" or v.lower() == "null":
        return None
    # Integer columns
    if key in ("Intg", "DispOrder", "WzOrder", "WzType", "VActr"):
        try:
            return int(v)
        except ValueError:
            return None
    # Float columns
    if key in ("Sng", "Cur"):
        try:
            return float(v)
        except ValueError:
            return None
    # Boolean column
    if key == "Boolean":
        if v in ("1", "True", "true", "T", "Y"):
            return True
        if v in ("0", "False", "false", "F", "N"):
            return False
        return None
    return v  # everything else stays as string


def main():
    if not os.path.exists(SRC_CSV):
        print(f"ERROR: Source CSV not found: {SRC_CSV}")
        return

    content = ""
    for enc in ("utf-8", "cp1252", "latin-1"):
        try:
            with open(SRC_CSV, "r", encoding=enc) as f:
                content = f.read()
            break
        except UnicodeDecodeError:
            continue

    reader = csv.DictReader(content.splitlines())
    rows = []
    skipped = 0
    for row in reader:
        # Normalize header case (some CSVs have varying capitalisation)
        normalized = {}
        for k, v in row.items():
            # Try to find a matching key in KEEP_COLS (case-insensitive)
            matched_key = next((c for c in KEEP_COLS if c.lower() == k.strip().lower()), None)
            if matched_key:
                normalized[matched_key] = parse_value(matched_key, v)

        # Must have a valid paramcode
        if not normalized.get("ParamCode"):
            skipped += 1
            continue

        rows.append(normalized)

    os.makedirs(os.path.dirname(DST_JSON), exist_ok=True)
    with open(DST_JSON, "w", encoding="utf-8") as f:
        json.dump(rows, f, indent=2, ensure_ascii=False, default=str)

    print(f"[OK] Written {len(rows)} rows ({skipped} skipped) -> {DST_JSON}")


if __name__ == "__main__":
    main()
