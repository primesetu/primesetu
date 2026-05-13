"""
inspect_mssql_tables.py
─────────────────────────────────────────────────────────────
Lists Shoper9 MSSQL tables matching key retail patterns.
Connects to Hyper-V machine AITDL via mssql_connect helper.
"""

from mssql_connect import get_conn

def inspect():
    conn   = get_conn()
    cursor = conn.cursor()

    patterns = ['%trn%', '%pos%', '%vouch%', '%item%', '%sale%', '%stk%']
    print("Finding tables matching patterns in SHOPER9WH1 (AITDL)...\n")

    for p in patterns:
        cursor.execute(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE ?", p
        )
        tables = cursor.fetchall()
        if tables:
            print(f"Pattern: {p}")
            for t in tables:
                print(f"  - {t[0]}")

    conn.close()
    print("\n✅ Done.")

if __name__ == "__main__":
    inspect()
