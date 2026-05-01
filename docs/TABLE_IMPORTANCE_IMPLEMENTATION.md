# 📊 Core Retail Tables: Importance & Implementation Strategy

## 📖 Objective
This document evaluates the most critical tables in the SMRITI-OS PostgreSQL schema (`SalesFactors`, `SalesTaxCat`, `SalesTaxRevision`, `stktrnhdr`, `StockMaster`, `StockCreditNote`, and `promo*`). It outlines their business importance and provides strict implementation strategies for the frontend development team.

---

## 1. `SalesFactors` (Dynamic Pricing Engine)
*   **Importance: HIGH.** This table controls dynamic price manipulation. It dictates how the base MRP of an item shifts based on external conditions (e.g., Wholesale Customer vs. Retail Customer, Happy Hour discounts). If ignored, the store will sell items at the wrong price, leading to financial loss or customer disputes.
*   **Implementation Strategy:** 
    *   The `BillingModule.tsx` must hook into this table *before* an item is added to the cart. 
    *   When an item is scanned, the API must check `SalesFactors` passing the `Customer ID` and `Item ID`. If a factor matches, the frontend must override the default `Rate` in the grid with the calculated factor price.

## 2. `SalesTaxCat` & `SalesTaxRevision` (Taxation Engine)
*   **Importance: CRITICAL (LEGAL).** These tables govern statutory tax compliance (GST, VAT). `SalesTaxCat` groups items (e.g., "Electronics @ 18%"). `SalesTaxRevision` acts as a time-machine for tax rules (e.g., "Before July 1st, it was 15%"). If this fails, the business violates tax laws and faces severe penalties.
*   **Implementation Strategy:** 
    *   Frontend developers must **NEVER** write math like `price * 0.18` in React. 
    *   The Billing/PO cart engine must query the `SalesTaxRevision` table using the `Date of Transaction`. It must dynamically distribute the tax across `taxcomp1` (CGST), `taxcomp2` (SGST), etc., exactly as the revision dictates, and save it to the database row.

## 3. `stktrnhdr` & `stktrndtls` (Unified Transaction Core)
*   *(Note: Legacy `SaleTrnHdr` does not exist in SMRITI-OS; all transactions route through `stktrnhdr`).*
*   **Importance: THE HEARTBEAT.** Every financial and inventory movement in the business (Sales, Returns, Purchases, Stock Transfers) lives here. If this is corrupted, the company has no record of its business.
*   **Implementation Strategy:** 
    *   All data submissions must go through a unified, heavily validated `/api/v1/transaction` endpoint. 
    *   The frontend relies on the `TrnType` (1300 = Sale, 1100 = GRN) to tell the backend what to do. The backend must strictly wrap the insertions of `hdr` and `dtls` in a **PostgreSQL Transaction** (`BEGIN; ... COMMIT;`). If the header saves but details fail, the transaction must roll back.

## 4. `StockMaster` (Inventory Ledger)
*   **Importance: CRITICAL.** This is the ultimate source of truth for the physical reality of the store. It tracks `curbalqty` (Current Balance Quantity) and `curbalval` (Current Balance Value). If it is inaccurate, customers can't buy goods, or the store thinks it has goods it actually lost.
*   **Implementation Strategy:** 
    *   The frontend must **never** directly write to `StockMaster`. 
    *   `StockMaster` must ONLY be updated via backend SQL triggers or stored procedures reacting to insertions in `stktrndtls`. When a Sale (`TrnType 1300`) is inserted, the backend trigger automatically decrements `StockMaster`.

## 5. `StockCreditNote` (Customer Financial Liability)
*   **Importance: HIGH.** When a customer returns goods and isn't given cash, the store issues a Credit Note. This represents actual money the store owes the customer. If lost or duplicated, the store bleeds cash.
*   **Implementation Strategy:** 
    *   The settlement modal (`F10`) in the Sales Return module must auto-generate a record here if the net value is negative.
    *   The implementation must include a ledger system. If a customer has a ₹1,000 Credit Note and buys a ₹200 shirt, the `StockCreditNote` table must track the consumption, leaving an ₹800 balance available for their next visit.

## 6. `promo*` Tables (Promotion Engine)
*   **Importance: VERY HIGH.** Tables like `promomaster`, `promoslabs`, etc., govern complex marketing logic ("Buy 2 Get 1 Free", "Bill > ₹5000 gets 10% off"). Miscalculating promos infuriates customers or drains margins.
*   **Implementation Strategy:** 
    *   The `BillingModule.tsx` must implement an "Evaluation Engine" that runs on every keystroke/cart change.
    *   If a promo hits, the exact discount value must be written directly into the `promoitemlevelofferval` column of `stktrndtls`. The promotion details are stamped permanently onto the receipt so historical reports remain accurate even if the promo is deleted tomorrow.
