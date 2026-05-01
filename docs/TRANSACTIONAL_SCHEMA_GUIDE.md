# 🏛️ SMRITI-OS Transactional Database Schema Guide

## 📖 Objective
This document outlines the architectural logic behind the primary transactional and configuration tables in SMRITI-OS. We have successfully ported the robust, battle-tested schema from Shoper 9 into PostgreSQL. 

Developers must understand this schema before interacting with the backend API or writing frontend submission logic.

---

## 1. The Unified Transaction Engine (`stktrn`)
Unlike naive POS systems that create separate tables for `Sales`, `Purchases`, and `Returns`, SMRITI-OS uses a **Unified Transaction Architecture**.

All core operational data flows into two primary tables:
*   **`public.stktrnhdr`** (Header Level: Totals, Dates, Customer Info)
*   **`public.stktrndtls`** (Detail Level: Items, Quantities, Rates)

### How do we differentiate transactions?
The magic column is `trntype`. 
When the frontend submits a transaction, the `trntype` dictates what happened:
*   `trntype = 1300` ➔ Sales Bill
*   `trntype = 1100` ➔ Goods Receipt Note (GRN)
*   `trntype = 1301` ➔ Sales Return
*   `trntype = 1200` ➔ Stock Transfer

**Developer Rule:** You do **not** need to build separate endpoints for saving Bills vs. GRNs. A unified `/api/v1/transaction` endpoint should accept a standardized JSON payload, relying on `trntype` to route the business logic (e.g., whether to increment or decrement `phyqtyin` vs `phyqtyout`).

---

## 2. Promotions & Discounts Engine
In SMRITI-OS, promotional logic is heavily embedded directly into the transaction line items. 

If you look at the `stktrndtls` schema, you will see dedicated columns for:
*   `promocode` (The offer applied)
*   `promotype`
*   `promoitemlevelofferval` (The value of the discount on this specific item)
*   `promobillleveldiscdtls` (In `stktrnhdr`, tracks bill-level deductions)

**Developer Rule:** The frontend Cart Engine must calculate promotions dynamically. When submitting to `stktrndtls`, you must write the `promocode` and `docentdisc` (Discount Amount) exactly to the row. The system does not use a separate mapping table for applied promos; it's permanently stamped on the transaction line for auditability.

---

## 3. Taxation Architecture (`salestaxcat` & `salestaxrevision`)
Shoper 9's taxation engine (which predated GST and was adapted for it) uses a highly flexible component system:
*   `taxcomp1`, `taxcomp2`, `taxcomp3`, `taxcomp4`

These columns (found in both the header and details tables) map to CGST, SGST, IGST, and CESS based on the rules defined in `salestaxcat` and `salestaxrevision`.

**Developer Rule:** The React frontend should **never** hardcode tax arithmetic (e.g., `rate * 0.18`). The frontend must query the `salestaxcat` for the specific `stockno`, pull the active percentages from `salestaxrevision`, and populate `taxcomp1` and `taxcomp2` accordingly.

---

## 4. Mode of Payment (`paymodeconfig`)
Payment types (Cash, Card, Credit Note, Advance Receipt) are driven by the `paymodeconfig` and `paymodeacceptconfig` tables.

*   When a cashier presses `F10` for settlement, the frontend must fetch allowed payment modes from these configuration tables.
*   The transaction settlement data (how the `netdocvalue` was paid) is linked via the `trnctrlno` to the respective settlement tables.

## 5. Customer Price Groups (`customers`)
The `public.customers` table acts as the CRM hub. It handles limits, groupings, and overrides.
*   If a customer belongs to a specific group (e.g., VIP Wholesale), the billing engine must respect their specific `SalesFactors` or `Credit Limits` before allowing a transaction to close.
