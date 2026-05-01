# 🧠 SMRITI-OS Master Architecture & Workflow Guide

## 📖 Introduction
This document serves as the master blueprint for SMRITI-OS. It translates the legacy Shoper 9 (FoxPro/SQL Server) workflows into the modern, cloud-native **PostgreSQL + React + Supabase** paradigm. 

Developers MUST read this document before modifying any transactional or configuration modules.

---

## 🏗️ 1. Security & Identity Architecture
We have completely stripped out the legacy VisualAge (`Va-`) security tables. SMRITI-OS operates on a Zero-Trust, Token-based architecture.

| Legacy Shoper 9 Table | SMRITI-OS Replacement | Development Workflow |
| :--- | :--- | :--- |
| `vauser` | Supabase `auth.users` | Passwords are encrypted by Supabase. Developers never handle raw credentials. |
| `vacompany` | `public.stores` | Every API call must inject `store_id`. |
| `vamenu` / `vausrgroup`| React Router + JWT | UI menus are rendered conditionally based on `user.hasPermission()` checks decoded from the JWT session. |

### 🔒 Row Level Security (RLS)
All transactional and configuration tables (e.g., `sysparam`, `genlookup`, `AcceptDisplayDtls`) possess a `store_id` foreign key. RLS policies at the database level strictly isolate data:
```sql
CREATE POLICY store_isolation ON public.tablename 
FOR ALL USING (store_id = (SELECT store_id FROM public.store_users WHERE user_id = auth.uid()));
```

---

## ⚙️ 2. The Configuration Engine
SMRITI-OS avoids hardcoded magic strings. The application's behavior is dictated by three primary database engines.

### A. System Parameters (`sysparam`)
The UI behavior (e.g., "Allow Negative Billing", "Enforce LSQ") is governed by the `sysparam` table. 
*   **Developer Workflow**: Use the `SystemParametersModule.tsx` dynamic form. Query the backend for parameters grouped by `category`. The React components `<Switch>` or `<Input>` render dynamically based on whether the `sysparam` row uses the `boolean`, `intg`, or `txt` column.

### B. General Lookup (`genlookup`)
Static dropdowns (Payment Modes, Sales Return Reasons, Discount Types) are populated globally by the `genlookup` and `genlookupextd` tables.
*   **Developer Workflow**: Never hardcode `<option>` arrays. Fetch dropdown data via the `/api/v1/genlookup/:category` endpoint.

### C. Grid Governance (`AcceptDisplayDtls`)
The structure of every `DataTable` is governed by the backend. 
*   **Developer Workflow**: Refer to [GRID_GOVERNANCE.md](./GRID_GOVERNANCE.md). Do not hardcode React `columns`. Always use `const { colDefs } = useGridMask(TrnType);`.

---

## 🛒 3. Transactional User Workflows (Cashier UX)
The speed of the cashier terminal is paramount. We maintain exact keyboard parity with the legacy system.

### A. Billing / POS (`TrnType 1300`)
*   **The Flow**: Walk-In ➔ Scan Barcode (`F3`) ➔ Auto-LSQ to `Qty=1` ➔ Review Footer ➔ Settlement (`F10`) ➔ Commit.
*   **Interrupts**: If multiple prices exist, the system blocks insertion and forces a modal selection.
*   **Developer Guide**: Refer to [POS_WORKFLOW_RULES.md](./POS_WORKFLOW_RULES.md).

### B. Sales Returns & Exchanges
*   **With Reference**: Cashier enters `Document No.` ➔ System hydrates original bill ➔ User alters `Qty` for partial return. Promo rules (Buy 2 Get 1) are strictly enforced.
*   **Without Reference**: Cashier scans item ➔ System fetches current price from `ItemMaster` ➔ Prompt for Customer Phone.
*   **Refund Modes**: Negative net balances automatically trigger the generation of a **Credit Note**, linked to the customer. Cash refunds require strict `sales_return.cash_refund` permissions.
*   **Developer Guide**: Refer to [SALES_RETURN_RULES.md](./SALES_RETURN_RULES.md).

---

## 🚀 4. Technical Suggestions for Immediate Development
Based on this architectural extraction, here is the suggested sprint backlog:

1.  **Dynamic Settings UI**: Build the `SystemParametersModule.tsx` component that consumes the `sysparam` table and dynamically renders inputs (Switch for boolean, Text for txt).
2.  **Global GenLookup Hook**: Create a `useGenLookup('CATEGORY_NAME')` React hook to instantly hydrate dropdowns across the application without duplicating API calls.
3.  **Credit Note Schema Check**: Ensure the `CreditNotes` table has a robust ledger system (to track partial consumption of a credit note over multiple future bills).
