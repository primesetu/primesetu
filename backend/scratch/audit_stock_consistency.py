import asyncio
import asyncpg
import os
from dotenv import load_dotenv

# ============================================================
# SMRITI-OS - Stock Consistency Auditor
# Purpose: Verify that Transactions tally with Current Balance
# Formula: Sum(QtyIn) - Sum(QtyOut) == Current Balance
# ============================================================

load_dotenv()

async def audit_consistency():
    print("Starting Stock Consistency Audit...")
    db_url = os.getenv("DATABASE_URL").replace("postgresql+asyncpg://", "postgresql://")
    
    try:
        conn = await asyncpg.connect(db_url)
        await conn.execute("SET search_path TO shoper9, public")
        
        # 1. Fetch Summary Comparison
        # We join StockMaster with a subquery of summed transactions
        query = """
            WITH TrnSummary AS (
                SELECT 
                    stockno,
                    SUM(COALESCE(phyqtyin, 0)) as total_in,
                    SUM(COALESCE(phyqtyout, 0)) as total_out
                FROM stktrndtls
                GROUP BY stockno
            )
            SELECT 
                s.stockno,
                s.curbalqty as current_stock,
                (t.total_in - t.total_out) as calculated_stock,
                ABS(s.curbalqty - (t.total_in - t.total_out)) as variance
            FROM stockmaster s
            JOIN TrnSummary t ON s.stockno = t.stockno
            ORDER BY variance DESC
            LIMIT 50
        """
        
        results = await conn.fetch(query)
        
        print(f"{'StockNo':<15} | {'Current':<10} | {'Calculated':<10} | {'Variance':<10}")
        print("-" * 55)
        
        match_count = 0
        mismatch_count = 0
        total_variance = 0
        
        all_results = await conn.fetch("""
            WITH TrnSummary AS (
                SELECT 
                    stockno,
                    SUM(COALESCE(phyqtyin, 0)) as total_in,
                    SUM(COALESCE(phyqtyout, 0)) as total_out
                FROM stktrndtls
                GROUP BY stockno
            )
            SELECT 
                s.stockno,
                s.curbalqty,
                (t.total_in - t.total_out) as calculated
            FROM stockmaster s
            JOIN TrnSummary t ON s.stockno = t.stockno
        """)

        for r in all_results:
            curr = float(r['curbalqty'] or 0)
            calc = float(r['calculated'] or 0)
            if abs(curr - calc) < 0.001:
                match_count += 1
            else:
                mismatch_count += 1
                total_variance += abs(curr - calc)

        # Display Top 10 Variances
        for r in results[:10]:
            print(f"{r['stockno']:<15} | {r['current_stock']:<10.2f} | {r['calculated_stock']:<10.2f} | {r['variance']:<10.2f}")

        print("-" * 55)
        print(f"Total Matches: {match_count}")
        print(f"Total Mismatches: {mismatch_count}")
        if mismatch_count > 0:
            print(f"Average Variance on Mismatches: {total_variance/mismatch_count:.2f}")
        
        await conn.close()
        
    except Exception as e:
        print(f"Audit Error: {e}")

if __name__ == '__main__':
    asyncio.run(audit_consistency())
