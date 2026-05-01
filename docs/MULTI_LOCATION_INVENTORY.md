# 🏢 Multi-Location & Grade Inventory Protocol

## 📖 Objective
SMRITI-OS leverages the advanced warehousing architecture of legacy Shoper 9. Inventory is not tracked simply as a global "Total Stock" per item. It is tracked as a multi-dimensional matrix. 

This document defines the strict rules developers must follow when building Inventory, Billing, and Stock Transfer modules to prevent inventory corruption.

---

## 1. The Inventory Matrix
The absolute truth of current stock lives in `public.stockmasterextd01` and `public.stockmasterextd02`. 

The `curbalqty` (Current Balance) is defined by a **Composite Key**:
1.  `stockno` (The SKU/Item)
2.  **`locationcd`** (The physical Location: e.g., 'FRONT_STORE', 'BACK_GODOWN')
3.  **`gradecd`** (The Condition: e.g., 'FRESH', 'DAMAGED', 'TRANSIT')
4.  **`batchno`** (The Batch/Expiry identifier, if applicable)

Because of this matrix, a single `stockno` can have multiple rows representing where the stock physically sits and what condition it is in.

---

## 2. Developer Rules for Implementation

### Rule A: Billing / POS Default Locations
When a cashier makes a standard sale (`TrnType 1300`), the frontend/backend must explicitly declare the `locationcd` (usually defaulting to the `FRONT_STORE`) and `gradecd` (usually `FRESH`). 
*   **Danger:** If a developer executes a sale without specifying `locationcd`, the database will not know which godown to deduct from, causing fatal inventory mismatches.

### Rule B: Sales Returns & Damaged Goods
When a customer returns an item (`TrnType 1301`), the cashier must select a Return Reason.
*   If the reason maps to "Defective" or "Damaged", the backend MUST route the returned inventory into `gradecd = 'DAMAGED'`.
*   **Why?** This automatically quarantines the stock. It ensures a cashier cannot accidentally sell that damaged shirt to the next customer, because the Billing Cart only queries `gradecd = 'FRESH'`.

### Rule C: Stock Transfers (`TrnType 1200`)
Store managers frequently move stock from the Back Godown to the Front Store shelves. 
*   This is executed as a **Stock Transfer**.
*   The backend must process this as a dual-entry transaction:
    *   `-10 Qty` from `locationcd = 'BACK_GODOWN'`
    *   `+10 Qty` to `locationcd = 'FRONT_STORE'`
*   The overall store inventory remains the same, but the matrix shifts.

### Rule D: Audit & Physical Stock Reconciliation
When a physical stock count is performed (Inventory Audit), the auditor counts bins based on location.
*   The frontend `DataTable` must group the audit sheets by `locationcd`. An auditor counts the "Front Store" separately from the "Back Godown". 
*   Any variance (`phyqtyout` or `phyqtyin`) is written back to the specific `locationcd` matrix, NOT just the global item master.

---
*Failure to respect `locationcd` and `gradecd` will result in systemic stock corruption. All `/api/v1/transaction` payloads must explicitly require these fields.*
