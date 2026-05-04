import re
import os

TRACE_FILE = r"d:\IMP\GitHub\primesetu\.shoper9trace\Company Creation GKP Fresh.trc"
OUTPUT_FILE = r"d:\IMP\GitHub\primesetu\Shoper9GKP_Postgres_Full.sql"


def clean_sql_text(text):
    return "".join(
        char
        for char in text
        if ord(char) < 128 and (char.isprintable() or char in "\n\r\t")
    )


def translate_mssql_to_pg(sql):
    sql = clean_sql_text(sql)
    sql = re.sub(r"\[dbo\]\.", "", sql, flags=re.IGNORECASE)
    sql = sql.replace("[", "").replace("]", "")

    # Precise replacements
    reps = {
        r"\bDATETIME\b": "TIMESTAMP",
        r"\bNVARCHAR\b": "VARCHAR",
        r"\bIMAGE\b": "BYTEA",
        r"\bMONEY\b": "NUMERIC(19,4)",
        r"\bTINYINT\b": "SMALLINT",
        r"\bBIT\b": "BOOLEAN",
        r"\bFLOAT\b": "DOUBLE PRECISION",
        r"(\w+)int\b": r"\1 INTEGER",
        r"(\w+)varchar\b": r"\1 VARCHAR",
        r"(\w+)datetime\b": r"\1 TIMESTAMP",
        r"\bINT\b": "INTEGER",
    }

    for pattern, replacement in reps.items():
        sql = re.sub(pattern, replacement, sql, flags=re.IGNORECASE)

    sql = re.sub(r"ON\s+PRIMARY", "", sql, flags=re.IGNORECASE)
    return sql


def parse_trace():
    print(f"Reading trace file: {TRACE_FILE}")
    with open(TRACE_FILE, "rb") as f:
        raw_data = f.read()

    raw_text = raw_data.decode("utf-16le", errors="ignore")

    # Use a simpler but more effective split logic
    # Find all CREATE TABLE indices
    starts = [m.start() for m in re.finditer(r"CREATE TABLE", raw_text, re.IGNORECASE)]

    with open(OUTPUT_FILE, "w", encoding="utf-8") as out:
        out.write("-- SMRITI-OS: Shoper9GKP PostgreSQL Migration Script\n\n")
        out.write("CREATE SCHEMA IF NOT EXISTS shoper9;\n")
        out.write("SET search_path TO shoper9, public;\n\n")

        unique_tables = set()
        for i in range(len(starts)):
            start = starts[i]
            end = starts[i + 1] if i + 1 < len(starts) else len(raw_text)
            chunk = raw_text[start:end]

            # Find the first closing bracket that is followed by something other than a column definition
            # Or just take everything until the first 'INSERT' or 'ALTER' or 'GO'
            match = re.search(
                r"(CREATE TABLE\s+(\w+)\s*\(.*?\))(?=\s*(?:CREATE|INSERT|ALTER|GO|DROP|GRANT|\Z))",
                chunk,
                re.DOTALL | re.IGNORECASE,
            )
            if match:
                clean_sql = translate_mssql_to_pg(match.group(1))
                tname = match.group(2).lower()
                if tname not in unique_tables and not tname.startswith("tmp"):
                    out.write(clean_sql + ";\n\n")
                    unique_tables.add(tname)

        # Re-scan for INSERTS (already worked well)
        insert_matches = re.finditer(r"INSERT INTO\s+.*?\n", raw_text, re.IGNORECASE)
        out.write("\n-- ── DATA ──────────────────────────────────────────────\n")
        for m in insert_matches:
            clean_sql = translate_mssql_to_pg(m.group(0))
            if "VALUES" in clean_sql.upper() and "tmp" not in clean_sql.lower():
                out.write(clean_sql.strip().split(";")[0] + ";\n")

    print(f"Done! Unique Tables: {len(unique_tables)}")


if __name__ == "__main__":
    parse_trace()
